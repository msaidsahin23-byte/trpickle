const fs = require('fs');
let content = fs.readFileSync('src/store/useStore.ts', 'utf8');

const regex = /markNotificationsAsRead:\s*\(userId\)\s*=>\s*set\(\(state\)\s*=>\s*\{/;
const replacement = `markNotificationsAsRead: (userId) => set((state) => {
        supabase.from('notifications').update({ read: true }).eq('user_id', String(userId)).then();`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    console.log("Fixed markNotificationsAsRead");
} else {
    console.log("Regex not found for markNotificationsAsRead");
}

fs.writeFileSync('src/store/useStore.ts', content);
