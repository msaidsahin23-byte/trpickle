const fs = require('fs');
let f = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

f = f.replace(
  /import \{ supabase, getGlobalChannel \} from "@\/lib\/supabase";/,
  'import { supabase, getGlobalChannel, subscribeGlobalChannel } from "@/lib/supabase";'
);

f = f.replace(
  /const notifChannel = supabase\.channel\('global-notifications'\)/,
  'const notifChannel = getGlobalChannel()'
);

const newListener = `            notifChannel.on('broadcast', { event: 'update_follow' }, (payload) => {
              const data = payload.payload;
              useStore.setState(state => {
                 const newUsers = state.users.map(u => {
                    if (String(u.id) === String(data.userId1)) {
                       return { ...u, following: data.userId1Following };
                    }
                    if (String(u.id) === String(data.userId2)) {
                       return { ...u, followers: data.userId2Followers };
                    }
                    return u;
                 });
                 const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser.id) || state.currentUser) : state.currentUser;
                 return { users: newUsers, currentUser: newCurrentUser };
              });
            });

            subscribeGlobalChannel();
`;

f = f.replace(/\/\/ getGlobalChannel already subscribes\n\s*;/g, newListener);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', f);
console.log("Done");
