const fs = require('fs');
let f = fs.readFileSync('src/store/useStore.ts', 'utf8');

const replacement = `        // PUSH TO SUPABASE
        supabase.from('users').update({ following: newFollowing.map(String) }).eq('id', currentUserId.toString()).then();
        supabase.from('users').update({ followers: newFollowers.map(String) }).eq('id', targetUserId.toString()).then();

        sendReliableBroadcast({
           type: 'broadcast',
           event: 'update_follow',
           payload: {
               userId1: currentUserId.toString(),
               userId1Following: newFollowing,
               userId2: targetUserId.toString(),
               userId2Followers: newFollowers
           }
        });`;

f = f.replace(
  /\s*\/\/\s*PUSH TO SUPABASE\s*supabase\.from\('users'\)\.update\(\{ following: newFollowing\.map\(String\) \}\)\.eq\('id', currentUserId\.toString\(\)\)\.then\(\);\s*supabase\.from\('users'\)\.update\(\{ followers: newFollowers\.map\(String\) \}\)\.eq\('id', targetUserId\.toString\(\)\)\.then\(\);/,
  '\n' + replacement
);

fs.writeFileSync('src/store/useStore.ts', f);
console.log("Done");
