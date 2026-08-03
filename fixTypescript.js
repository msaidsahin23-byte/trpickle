const fs = require('fs');

let provider = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

provider = provider.replace(
  /posts: \[\{\s*id: p\.id,\s*authorId: p\.author_id,\s*content: contentStr,\s*poll: pollObj,\s*createdAt: p\.created_at,\s*likedBy: p\.liked_by \|\| \[\],\s*comments: \[\]\s*\}, \.\.\.state\.posts\]/,
  `posts: [{
                      id: p.id,
                      authorId: p.author_id,
                      author: p.author_name || "Kullanıcı",
                      rating: p.rating || 2.5,
                      content: contentStr,
                      poll: pollObj,
                      time: p.time || new Date().toISOString(),
                      likedBy: p.liked_by || [],
                      comments: []
                    }, ...state.posts]`
);

fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', provider, 'utf8');
console.log("Fixed missing properties in SupabaseSyncProvider.tsx");
