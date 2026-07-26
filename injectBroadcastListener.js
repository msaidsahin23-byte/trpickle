const fs = require('fs');
let content = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

const injection = `
              .on(
                'broadcast',
                { event: 'new_notification' },
                (payload) => {
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
                        
                        // Prevent duplicates if Postgres changes ALSO fired
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
                }
              )`;

content = content.replace(
  /\.subscribe\(\(\) => \{\}\)/,
  `${injection}\n              .subscribe(() => {})`
);

// We should also replace .subscribe() if it doesn't have an empty arrow function inside
content = content.replace(
  /\.subscribe\(\)/,
  `${injection}\n              .subscribe()`
);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', content);
console.log("Added global-notifications broadcast listener to SupabaseSyncProvider.tsx");
