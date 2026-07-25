const fs = require('fs');

let content = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Replace the arrays with empty ones
content = content.replace(/const initialUsers: User\[\] = \[[\s\S]*?\];/g, 'const initialUsers: User[] = [];');
content = content.replace(/const initialDirectMessages: DirectMessage\[\] = \[[\s\S]*?\];/g, 'const initialDirectMessages: DirectMessage[] = [];');
content = content.replace(/const initialPosts: Post\[\] = \[[\s\S]*?\];/g, 'const initialPosts: Post[] = [];');
content = content.replace(/const initialCourts: CourtRecord\[\] = \[[\s\S]*?\];/g, 'const initialCourts: CourtRecord[] = [];');
content = content.replace(/const initialCourtSubmissions: CourtSubmission\[\] = \[[\s\S]*?\];/g, 'const initialCourtSubmissions: CourtSubmission[] = [];');

// Write back
fs.writeFileSync('src/store/useStore.ts', content);
console.log("Successfully cleaned useStore.ts dummy data.");
