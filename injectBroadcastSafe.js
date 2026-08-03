const fs = require('fs');

let provider = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

// Replace the end of the global-notifications block safely
const originalBlock = `
                const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser!.id) || state.currentUser) : state.currentUser;
                return { users: newUsers, currentUser: newCurrentUser };
              });
            }).subscribe();`;

const newListeners = `
                const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser!.id) || state.currentUser) : state.currentUser;
                return { users: newUsers, currentUser: newCurrentUser };
              });
            });

            notifChannel.on('broadcast', { event: 'new_message' }, (payload) => {
              const m = payload.payload as any;
              useStore.setState((state) => {
                if (state.directMessages?.some(existing => String(existing.id) === String(m.id))) return state;
                const filteredMsgs = (state.directMessages || []).filter(msg => {
                    if (String(msg.id).startsWith('temp-') && String(msg.senderId) === String(m.sender_id) && msg.content === m.content) {
                        return false;
                    }
                    return true;
                });
                const newMsg = {
                  id: m.id,
                  senderId: m.sender_id,
                  receiverId: m.receiver_id,
                  content: m.content,
                  createdAt: m.created_at,
                  isRead: m.is_read
                };
                return { directMessages: [...filteredMsgs, newMsg] };
              });
            });

            notifChannel.on('broadcast', { event: 'new_comment' }, (payload) => {
              const c = payload.payload as any;
              useStore.setState((state) => {
                 const newPosts = state.posts.map(p => {
                    if (String(p.id) === String(c.post_id)) {
                        return { ...p, comments: [...(p.comments || []), {} as any] };
                    }
                    return p;
                 });
                 return { posts: newPosts };
              });
            });

            notifChannel.on('broadcast', { event: 'new_post' }, (payload) => {
              const p = payload.payload as any;
              useStore.setState((state) => {
                  if (state.posts.some(existing => String(existing.id) === String(p.id))) return state;
                  let contentStr = p.content || "";
                  let pollObj = undefined;
                  if (contentStr.includes("<!--POLL:")) {
                     const parts = contentStr.split("<!--POLL:");
                     contentStr = parts[0];
                     try { pollObj = JSON.parse(parts[1].split("-->")[0]); } catch(e){}
                  }
                  return { 
                    posts: [{
                      id: p.id,
                      authorId: p.author_id,
                      content: contentStr,
                      poll: pollObj,
                      createdAt: p.created_at,
                      likedBy: p.liked_by || [],
                      comments: []
                    }, ...state.posts] 
                  };
              });
            });

            notifChannel.on('broadcast', { event: 'update_post' }, (payload) => {
              const p = payload.payload as any;
              useStore.setState((state) => {
                  return {
                    posts: state.posts.map(x => {
                      if (String(x.id) === String(p.id)) {
                         let contentStr = p.content || "";
                         let pollObj = x.poll;
                         if (contentStr.includes("<!--POLL:")) {
                            const parts = contentStr.split("<!--POLL:");
                            contentStr = parts[0];
                            try { pollObj = JSON.parse(parts[1].split("-->")[0]); } catch(e){}
                         }
                         return {
                           ...x,
                           content: contentStr,
                           poll: pollObj,
                           likedBy: p.liked_by || [],
                           comments: x.comments
                         };
                      }
                      return x;
                    })
                  };
              });
            });

            notifChannel.subscribe();
`;

provider = provider.replace(originalBlock, newListeners);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', provider, 'utf8');
console.log("Updated SupabaseSyncProvider.tsx");

// --- 2. useStore.ts ---
let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Broadcast for sendDirectMessage
store = store.replace(
  /supabase\.from\('messages'\)\.insert\(\{([\s\S]*?)\}\)\.then\(\);/,
  `supabase.from('messages').insert({$1}).select().then(({ data }) => {
           if (data && data.length > 0) {
               supabase.channel('global-notifications').send({
                   type: 'broadcast',
                   event: 'new_message',
                   payload: data[0]
               });
           }
        });`
);

// Broadcast for toggleLike (update_post)
store = store.replace(
  /supabase\.from\('posts'\)\.update\(\{ liked_by: finalLikedBy\.map\(String\) \}\)\.eq\('id', postId\.toString\(\)\)\.then\(\);/,
  `supabase.from('posts').update({ liked_by: finalLikedBy.map(String) }).eq('id', postId.toString()).select().then(({ data }) => {
          if (data && data.length > 0) {
              supabase.channel('global-notifications').send({
                  type: 'broadcast',
                  event: 'update_post',
                  payload: data[0]
              });
          }
        });`
);

// Update feed post creation (since there is no CreatePost.tsx, it might be in useStore or Feed.tsx)
fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts");

// --- 3. CommentDrawer.tsx ---
let commentDrawer = fs.readFileSync('src/components/CommentDrawer.tsx', 'utf8');

commentDrawer = commentDrawer.replace(
  /supabase\.from\('comments'\)\.insert\(\{[\s\S]*?content: newCommentText\.trim\(\)\s*\}\)\.then\(\);/,
  `supabase.from('comments').insert({
      id: tempId,
      post_id: postId.toString(),
      author_id: currentUser.id.toString(),
      author_name: currentUser.username || currentUser.name || "Kullanıcı",
      content: newCommentText.trim()
    }).select().then(({ data }) => {
      if (data && data.length > 0) {
        supabase.channel('global-notifications').send({
          type: 'broadcast',
          event: 'new_comment',
          payload: data[0]
        });
      }
    });`
);

fs.writeFileSync('src/components/CommentDrawer.tsx', commentDrawer, 'utf8');
console.log("Updated CommentDrawer.tsx");

// Let's also check where posts are inserted and patch it.
// grep for supabase.from('posts').insert
