const fs = require('fs');

let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

// 1. sendDirectMessage bypass select
store = store.replace(
  /supabase\.from\('messages'\)\.insert\(\{([\s\S]*?)\}\)\.select\(\)\.then\(\(\{ data \}\) => \{[\s\S]*?payload: data\[0\][\s\S]*?\}\);[\s\S]*?\}\);/,
  `supabase.from('messages').insert({$1}).then();
          supabase.channel('global-notifications').send({
             type: 'broadcast',
             event: 'new_message',
             payload: {
                id: tempMsg.id,
                sender_id: state.currentUser.id.toString(),
                receiver_id: receiverId.toString(),
                content: content.trim(),
                is_read: false,
                created_at: tempMsg.createdAt
             }
          });`
);

// 2. toggleLike bypass select
store = store.replace(
  /supabase\.from\('posts'\)\.update\(\{ liked_by: finalLikedBy\.map\(String\) \}\)\.eq\('id', postId\.toString\(\)\)\.select\(\)\.then\(\(\{ data \}\) => \{[\s\S]*?payload: data\[0\][\s\S]*?\}\);[\s\S]*?\}\);/,
  `supabase.from('posts').update({ liked_by: finalLikedBy.map(String) }).eq('id', postId.toString()).then();
          supabase.channel('global-notifications').send({
              type: 'broadcast',
              event: 'update_post',
              payload: {
                id: postId.toString(),
                liked_by: finalLikedBy.map(String)
              }
          });`
);

// 3. new post bypass select
store = store.replace(
  /supabase\.from\('posts'\)\.insert\(\{([\s\S]*?)\}\)\.select\(\)\.then\(\(\{ data \}\) => \{[\s\S]*?payload: data\[0\][\s\S]*?\}\);[\s\S]*?\}\);/,
  `supabase.from('posts').insert({$1}).then();
          supabase.channel('global-notifications').send({
              type: 'broadcast',
              event: 'new_post',
              payload: {
                id: post.id.toString(),
                author_id: post.authorId.toString(),
                author_name: post.author,
                rating: post.rating,
                content: post.poll ? post.content + "\\n\\n<!--POLL:" + JSON.stringify(post.poll) + "-->" : post.content,
                time: post.time,
                liked_by: (post.likedBy || []).map(String),
                comments: post.comments || [],
                image_url: post.imageUrl || null,
                linked_match_id: post.linkedMatchId ? post.linkedMatchId.toString() : null
              }
          });`
);

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts safely");
