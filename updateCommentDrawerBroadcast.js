const fs = require('fs');

let file = fs.readFileSync('src/components/CommentDrawer.tsx', 'utf8');

// Add import
if (!file.includes('sendReliableBroadcast')) {
  file = file.replace(
    /import \{ supabase \} from '@\/lib\/supabase'/,
    "import { supabase, sendReliableBroadcast } from '@/lib/supabase'"
  );
}

// Replace channel sends
file = file.replace(
  /supabase\.channel\('global-notifications'\)\.send\(\{[\s\S]*?type: 'broadcast',[\s\S]*?event: '([^']+)',[\s\S]*?payload: (.*?)\s*\}\);/g,
  "sendReliableBroadcast('$1', $2);"
);

// Replace remaining single line ones
file = file.replace(
  /supabase\.channel\('global-notifications'\)\.send\(\{ type: 'broadcast', event: '([^']+)', payload: (.*?) \}\);/g,
  "sendReliableBroadcast('$1', $2);"
);

fs.writeFileSync('src/components/CommentDrawer.tsx', file, 'utf8');
console.log("Updated CommentDrawer.tsx with sendReliableBroadcast");
