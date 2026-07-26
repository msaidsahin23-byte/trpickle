const fs = require('fs');

let syncContent = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

// Fix posts UPDATE comparison
syncContent = syncContent.replace(
  /if \(x\.id\.toString\(\) === p\.id\) \{/g,
  'if (x.id.toString() === String(p.id)) {'
);

// Fix comments INSERT/DELETE comparison
syncContent = syncContent.replace(
  /if \(p\.id\.toString\(\) === c\.post_id\) \{/g,
  'if (p.id.toString() === String(c.post_id)) {'
);

// Fix notifications INSERT comparison
syncContent = syncContent.replace(
  /if \(u\.id === n\.user_id\) \{/g,
  'if (String(u.id) === String(n.user_id)) {'
);

// Also fix messages INSERT comparison just in case
syncContent = syncContent.replace(
  /if \(state\.directMessages\?\.some\(existing => existing\.id === m\.id\)\)/g,
  'if (state.directMessages?.some(existing => String(existing.id) === String(m.id)))'
);

// Also fix messages DELETE comparison
syncContent = syncContent.replace(
  /directMessages: \(state\.directMessages \|\| \[\]\)\.filter\(msg => msg\.id !== m\.id\)/g,
  'directMessages: (state.directMessages || []).filter(msg => String(msg.id) !== String(m.id))'
);

// Also fix users UPDATE comparison
syncContent = syncContent.replace(
  /if \(existing\.id === u\.id\) \{/g,
  'if (String(existing.id) === String(u.id)) {'
);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', syncContent);
console.log("Fixed all strict string/number ID comparisons in SupabaseSyncProvider.tsx");
