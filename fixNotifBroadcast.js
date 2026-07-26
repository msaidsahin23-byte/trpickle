const fs = require('fs');

function fixUseStore() {
  let content = fs.readFileSync('src/store/useStore.ts', 'utf8');

  // Fix toggleLike
  content = content.replace(
    /supabase\.from\('notifications'\)\.insert\(\{\s*user_id:\s*String\(authorToNotify\),\s*type:\s*'like',\s*message:\s*"Bir gönderiniz yeni beğeniler aldı\.",\s*related_match_id:\s*postId\.toString\(\)\s*\}\)\.then\(\);/,
    `supabase.from('notifications').insert({
              user_id: String(authorToNotify),
              type: 'like',
              message: "Bir gönderiniz yeni beğeniler aldı.",
              related_match_id: postId.toString()
            }).select().then(({ data }) => {
              if (data && data.length > 0) {
                 supabase.channel('global-notifications').send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: data[0]
                 });
              }
            });`
  );

  // Fix toggleFollow
  content = content.replace(
    /supabase\.from\('notifications'\)\.insert\(\{\s*user_id:\s*targetUserId\.toString\(\),\s*type:\s*'system',\s*message:\s*followMsg\s*\}\)\.then\(\);/,
    `supabase.from('notifications').insert({
                user_id: targetUserId.toString(),
                type: 'system',
                message: followMsg
              }).select().then(({ data }) => {
                if (data && data.length > 0) {
                   supabase.channel('global-notifications').send({
                      type: 'broadcast',
                      event: 'new_notification',
                      payload: data[0]
                   });
                }
              });`
  );

  fs.writeFileSync('src/store/useStore.ts', content);
  console.log("Fixed useStore.ts inserts");
}

function fixCommentDrawer() {
  let content = fs.readFileSync('src/components/CommentDrawer.tsx', 'utf8');
  
  content = content.replace(
    /supabase\.from\('notifications'\)\.insert\(notificationsToInsert\)\.then\(\);/,
    `supabase.from('notifications').insert(notificationsToInsert).select().then(({ data }) => {
          if (data && data.length > 0) {
             data.forEach(notif => {
                supabase.channel('global-notifications').send({
                   type: 'broadcast',
                   event: 'new_notification',
                   payload: notif
                });
             });
          }
      });`
  );

  fs.writeFileSync('src/components/CommentDrawer.tsx', content);
  console.log("Fixed CommentDrawer.tsx inserts");
}

fixUseStore();
fixCommentDrawer();
