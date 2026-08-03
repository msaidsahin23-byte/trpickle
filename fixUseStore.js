const fs = require('fs');

let content = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Fix toggleLike
content = content.replace(
  /supabase\.from\('notifications'\)\.insert\(\{\s*user_id:\s*String\(authorToNotify\),\s*type:\s*'like',\s*message:\s*".*?",\s*related_match_id:\s*postId\.toString\(\)\s*\}\)\.then\(\);/,
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

fs.writeFileSync('src/store/useStore.ts', content, 'utf8');
console.log("Fixed useStore.ts");
