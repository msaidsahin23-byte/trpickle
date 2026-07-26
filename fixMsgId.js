const fs = require('fs');

let useStoreContent = fs.readFileSync('src/store/useStore.ts', 'utf8');

const regex = /supabase\.from\('messages'\)\.insert\(\{\s*sender_id:\s*state\.currentUser\.id\.toString\(\),\s*receiver_id:\s*receiverId\.toString\(\),\s*content:\s*content\.trim\(\),\s*is_read:\s*false\s*\}\)\.then\(\);/;

const replacement = `supabase.from('messages').insert({
           id: tempMsg.id,
           sender_id: state.currentUser.id.toString(),
           receiver_id: receiverId.toString(),
           content: content.trim(),
           is_read: false
        }).then();`;

if (useStoreContent.match(regex)) {
    useStoreContent = useStoreContent.replace(regex, replacement);
    console.log("Fixed sendDirectMessage to include tempMsg.id");
} else {
    console.log("Could not find insert in sendDirectMessage");
}

fs.writeFileSync('src/store/useStore.ts', useStoreContent);
