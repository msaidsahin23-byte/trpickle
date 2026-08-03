const fs = require('fs');

let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

store = store.replace(
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

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts for new posts");
