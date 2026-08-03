const fs = require('fs');

// --- 1. SupabaseSyncProvider.tsx ---
let provider = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

const newMessageListener = `
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
`;

const newCommentListener = `
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
`;

const newPostListener = `
              notifChannel.on('broadcast', { event: 'new_post' }, (payload) => {
                  const p = payload.payload as any;
                  useStore.setState((state) => {
                      if (state.posts.some(existing => String(existing.id) === String(p.id))) return state;
                      let contentStr = p.content || "";
                      let pollObj = undefined;
                      if (contentStr.includes("<!--POLL:")) {
                         const parts = contentStr.split("<!--POLL:");
                         contentStr = parts[0];
                         try {
                           pollObj = JSON.parse(parts[1].split("-->")[0]);
                         } catch(e){}
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
`;

const postUpdateListener = `
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
                                try {
                                  pollObj = JSON.parse(parts[1].split("-->")[0]);
                                } catch(e){}
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
`;

// Inject into provider
provider = provider.replace(/\.subscribe\(\);/, `
${newMessageListener}
${newCommentListener}
${newPostListener}
${postUpdateListener}
              .subscribe();`);

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
// Note: toggleLike does: supabase.from('posts').update({ liked_by: finalLikedBy.map(String) }).eq('id', postId.toString()).then();
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

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts");

// --- 3. CommentDrawer.tsx ---
let commentDrawer = fs.readFileSync('src/components/CommentDrawer.tsx', 'utf8');

// Broadcast for new comment
commentDrawer = commentDrawer.replace(
  /const tempId = `temp-\$\{Date\.now\(\)\}`;[\s\S]*?supabase\.from\('comments'\)\.insert\(\{[\s\S]*?\}\)\.then\(\);/,
  `const tempId = \`temp-\$\{Date.now()\}\`;
    const newComment = {
      id: tempId,
      post_id: postId.toString(),
      author_id: currentUser.id.toString(),
      author_name: currentUser.username || currentUser.name || "Kullanıcı",
      content: newCommentText.trim(),
      created_at: new Date().toISOString()
    };
    supabase.from('comments').insert({
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

// --- 4. CreatePost.tsx ---
let createPost = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

createPost = createPost.replace(
  /supabase\.from\('posts'\)\.insert\(\{([\s\S]*?)\}\)\.then\(\);/,
  `supabase.from('posts').insert({$1}).select().then(({ data }) => {
        if (data && data.length > 0) {
          supabase.channel('global-notifications').send({
            type: 'broadcast',
            event: 'new_post',
            payload: data[0]
          });
        }
      });`
);

fs.writeFileSync('src/components/CreatePost.tsx', createPost, 'utf8');
console.log("Updated CreatePost.tsx");
