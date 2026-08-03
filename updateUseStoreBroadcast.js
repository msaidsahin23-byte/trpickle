const fs = require('fs');

let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Add import
if (!store.includes('sendReliableBroadcast')) {
  store = store.replace(
    /import \{ supabase \} from '@\/lib\/supabase'/,
    "import { supabase, sendReliableBroadcast } from '@/lib/supabase'"
  );
}

// Replace all channel sends
store = store.replace(
  /supabase\.channel\('global-notifications'\)\.send\(\{[\s\S]*?type: 'broadcast',[\s\S]*?event: '([^']+)',[\s\S]*?payload: (.*?)\s*\}\);/g,
  "sendReliableBroadcast('$1', $2);"
);

// Replace remaining single line ones
store = store.replace(
  /supabase\.channel\('global-notifications'\)\.send\(\{ type: 'broadcast', event: '([^']+)', payload: (.*?) \}\);/g,
  "sendReliableBroadcast('$1', $2);"
);

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts with sendReliableBroadcast");
