const fs = require('fs');

let provider = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

// Add import
if (!provider.includes('getGlobalChannel')) {
  provider = provider.replace(
    /import \{ supabase \} from '@\/lib\/supabase'/,
    "import { supabase, getGlobalChannel } from '@/lib/supabase'"
  );
}

// Replace notifChannel creation
provider = provider.replace(
  /const notifChannel = supabase\.channel\('global-notifications'\);/g,
  "const notifChannel = getGlobalChannel();"
);

// Remove the explicit subscribe call since getGlobalChannel handles it
provider = provider.replace(
  /notifChannel\.subscribe\(\);/g,
  "// getGlobalChannel already subscribes"
);

// Add cleanup for the listeners on unmount (important!)
provider = provider.replace(
  /    return \(\) => \{\s*subscription\.unsubscribe\(\);\s*\};/g,
  `    return () => {
      subscription.unsubscribe();
      // Unsubscribe the global channel as well when the app unmounts
      const channel = getGlobalChannel();
      supabase.removeChannel(channel);
    };`
);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', provider, 'utf8');
console.log("Updated SupabaseSyncProvider.tsx for robust channel sharing");
