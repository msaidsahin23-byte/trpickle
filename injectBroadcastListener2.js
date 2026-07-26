const fs = require('fs');
let content = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

const dedicatedChannelCode = `
            const notifChannel = supabase.channel('global-notifications')
              .on('broadcast', { event: 'new_notification' }, (payload) => {
                  const n = payload.payload as any;
                  if (!n || !n.user_id) return;
                  
                  useStore.setState((state) => {
                    const newUsers = state.users.map(u => {
                      if (String(u.id) === String(n.user_id)) {
                        const newNotif = {
                          id: n.id,
                          postId: n.related_match_id,
                          matchId: n.match_id,
                          type: n.type,
                          message: n.message,
                          isRead: n.read,
                          createdAt: n.created_at
                        };
                        
                        if (u.notifications?.some(existing => String(existing.id) === String(n.id))) {
                          return u;
                        }
                        
                        return { ...u, notifications: [newNotif, ...(u.notifications || [])] };
                      }
                      return u;
                    });
                    
                    const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser!.id) || state.currentUser) : state.currentUser;
                    return { users: newUsers, currentUser: newCurrentUser };
                  });
              })
              .subscribe();
`;

// Insert it right after channel subscription
content = content.replace(
  /\.subscribe\(\(\) => \{\}\)/,
  `.subscribe(() => {})
${dedicatedChannelCode}`
);

content = content.replace(
  /\.subscribe\(\)/,
  `.subscribe()
${dedicatedChannelCode}`
);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', content);
console.log("Added global-notifications dedicated channel to SupabaseSyncProvider.tsx");
