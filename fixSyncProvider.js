const fs = require('fs');

let content = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

// 1. Remove supabase.removeAllChannels()
content = content.replace('supabase.removeAllChannels();', "// Don't use removeAllChannels() to prevent race conditions");

// 2. Add defensive casting to posts INSERT
content = content.replace(
  'if (state.posts.some(existing => existing.id.toString() === p.id)) return state;',
  'if (state.posts.some(existing => String(existing.id) === String(p.id))) return state;'
);

// 3. Fix the poll JSON parse logic for posts INSERT
content = content.replace(
  /let contentStr = p\.content \|\| "";[\s\S]*?pollObj = JSON\.parse\(parts\[1\]\.replace\("-->", ""\)\);[\s\S]*?\} catch\(e\) \{\}/,
  `let contentStr = p.content || "";
                        let pollObj = undefined;
                        if (contentStr.includes("<!--POLL:")) {
                           const parts = contentStr.split("<!--POLL:");
                           contentStr = parts[0];
                           try {
                             pollObj = JSON.parse(parts[1].split("-->")[0]);
                           } catch(e){}
                        }`
);

// 4. Update the object returned in posts INSERT
content = content.replace(
  /const mappedNewPost = \{[\s\S]*?linkedMatchId: p\.linked_match_id\s*\};\s*return \{ posts: \[mappedNewPost, \.\.\.state\.posts\] \};/,
  `return { 
                          posts: [{
                            id: p.id,
                            authorId: p.author_id,
                            content: contentStr,
                            poll: pollObj,
                            createdAt: p.created_at,
                            likedBy: p.liked_by || [],
                            comments: []
                          }, ...state.posts] 
                        };`
);

// 5. Add defensive casting to posts UPDATE
content = content.replace(
  'if (x.id.toString() === String(p.id)) {',
  'if (String(x.id) === String(p.id)) {'
);

// 6. Fix the poll JSON parse logic for posts UPDATE
content = content.replace(
  /let contentStr = p\.content \|\| "";\s*let pollObj = x\.poll;[\s\S]*?pollObj = JSON\.parse\(parts\[1\]\.replace\("-->", ""\)\);[\s\S]*?\} catch\(e\) \{\}/,
  `let contentStr = p.content || "";
                             let pollObj = undefined;
                             if (contentStr.includes("<!--POLL:")) {
                                const parts = contentStr.split("<!--POLL:");
                                contentStr = parts[0];
                                try {
                                  pollObj = JSON.parse(parts[1].split("-->")[0]);
                                } catch(e){}
                             }`
);

// 7. Add defensive casting to posts DELETE
content = content.replace(
  'return { posts: state.posts.filter(x => x.id.toString() !== oldP.id) };',
  'return { posts: state.posts.filter(x => String(x.id) !== String(oldP.id)) };'
);

// 8. Add defensive casting to messages INSERT
content = content.replace(
  /if \(msg\.id\.toString\(\)\.startsWith\('temp-'\) && msg\.senderId === m\.sender_id && msg\.content === m\.content\) \{/,
  "if (String(msg.id).startsWith('temp-') && String(msg.senderId) === String(m.sender_id) && msg.content === m.content) {"
);

// 9. Add defensive casting to comments INSERT
content = content.replace(
  'if (p.id.toString() === String(c.post_id)) {',
  'if (String(p.id) === String(c.post_id)) {'
);

// 10. Add defensive casting to comments DELETE
content = content.replace(
  'if (p.id.toString() === String(c.post_id)) {',
  'if (String(p.id) === String(c.post_id)) {'
);

// 11. Add defensive casting to messages UPDATE
content = content.replace(
  'msg.id === m.id ? { ...msg, isRead: m.is_read } : msg',
  'String(msg.id) === String(m.id) ? { ...msg, isRead: m.is_read } : msg'
);

// 12. Add global-notifications channel and unmount cleanup logic properly
const endOfChannelBlock = `
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

              // Clean up channels gracefully
              if (!(window as any).__channels) (window as any).__channels = [];
              (window as any).__channels.push(channel, notifChannel);
            }
        } else {`;

content = content.replace(/                \)\r?\n                \.subscribe\(\);\r?\n          \}\r?\n        \} else \{/, `                )\n                .subscribe();\n${endOfChannelBlock}`);

// 13. Update useEffect unmount cleanup
const useEffectReturnBlock = `    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined' && (window as any).__channels) {
        (window as any).__channels.forEach((c: any) => supabase.removeChannel(c));
        (window as any).__channels = [];
      }
    };`;

content = content.replace(/    return \(\) => \{\r?\n      subscription\.unsubscribe\(\);\r?\n    \};/, useEffectReturnBlock);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', content, 'utf8');
console.log("SupabaseSyncProvider.tsx successfully fixed!");
