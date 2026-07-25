const fs = require('fs');
const file = 'src/store/useStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/id: (\d+),\s+name: '([^']+)',\s+email: '([^']+)',/g, (match, id, name, email) => {
  const parts = name.split(' ');
  const firstName = parts.slice(0, -1).join(' ') || name;
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  let username = email.split('@')[0];
  if (id == '99') username = 'admin';
  
  return `id: ${id},
      username: '${username}',
      firstName: '${firstName}',
      lastName: '${lastName}',
      name: '${name}',
      email: '${email}',`;
});

fs.writeFileSync(file, content);
console.log('Migration complete');
