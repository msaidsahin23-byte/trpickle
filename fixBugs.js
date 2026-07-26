const fs = require('fs');

// Fix layout.tsx version
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace(/Beta v1\.0\.1/g, 'Beta v1.0.2');
fs.writeFileSync('src/app/layout.tsx', layout);

// Fix CommentDrawer.tsx z-index
let drawer = fs.readFileSync('src/components/CommentDrawer.tsx', 'utf8');
// Fix backdrop z-index
drawer = drawer.replace(/className="fixed inset-0 bg-black\/60 z-50 backdrop-blur-sm"/g, 'className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"');
// Fix drawer z-index
drawer = drawer.replace(/z-\[60\]/g, 'z-[210]');
fs.writeFileSync('src/components/CommentDrawer.tsx', drawer);
