const fs = require('fs');

function processFile(path) {
  let file = fs.readFileSync(path, 'utf8');

  if (!file.includes('sendReliableBroadcast')) {
    file = file.replace(
      /import \{ supabase \} from '@\/lib\/supabase'/,
      "import { supabase, sendReliableBroadcast } from '@/lib/supabase'"
    );
  }

  file = file.replace(/supabase\.channel\('global-notifications'\)\.send/g, "sendReliableBroadcast");

  fs.writeFileSync(path, file, 'utf8');
  console.log("Updated " + path + " with sendReliableBroadcast (SAFE)");
}

processFile('src/store/useStore.ts');
processFile('src/components/CommentDrawer.tsx');
