const fs = require('fs');

let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

// 1. sendDirectMessage
store = store.replace(
  /        supabase\.from\('messages'\)\.insert\(\{([\s\S]*?is_read: false\s*)\}\)\.then\(\);/,
  `        supabase.from('messages').insert({$1}).then();
        supabase.channel('global-notifications').send({
           type: 'broadcast',
           event: 'new_message',
           payload: {
              id: tempMsg.id,
              sender_id: state.currentUser.id.toString(),
              receiver_id: receiverId.toString(),
              content: content.trim(),
              is_read: false,
              created_at: tempMsg.createdAt
           }
        });`
);

// 2. toggleLike (update post)
store = store.replace(
  /supabase\.from\('posts'\)\.update\(\{ liked_by: finalLikedBy\.map\(String\) \}\)\.eq\('id', postId\.toString\(\)\)\.then\(\);/,
  `supabase.from('posts').update({ liked_by: finalLikedBy.map(String) }).eq('id', postId.toString()).then();
        supabase.channel('global-notifications').send({
            type: 'broadcast',
            event: 'update_post',
            payload: {
              id: postId.toString(),
              liked_by: finalLikedBy.map(String)
            }
        });`
);

// 3. new post
store = store.replace(
  /        supabase\.from\('posts'\)\.insert\(\{([\s\S]*?linked_match_id: post\.linkedMatchId \? post\.linkedMatchId\.toString\(\) : null\s*)\}\)\.then\(\);/,
  `        supabase.from('posts').insert({$1}).then();
        supabase.channel('global-notifications').send({
            type: 'broadcast',
            event: 'new_post',
            payload: {
              id: post.id.toString(),
              author_id: post.authorId.toString(),
              author_name: post.author,
              rating: post.rating,
              content: post.poll ? post.content + "\\n\\n<!--POLL:" + JSON.stringify(post.poll) + "-->" : post.content,
              time: post.time,
              liked_by: (post.likedBy || []).map(String),
              comments: post.comments || [],
              image_url: post.imageUrl || null,
              linked_match_id: post.linkedMatchId ? post.linkedMatchId.toString() : null
            }
        });`
);

// 4. Match syncs (approve partial)
store = store.replace(
  /          const updatedMatches = \[\.\.\.state\.matches\];\r?\n          updatedMatches\[matchIndex\] = \{ \.\.\.match, approvedBy: currentApprovedBy \};\r?\n          return \{ matches: updatedMatches \};/,
  `          const updatedMatches = [...state.matches];
          const newMatchState = { ...match, approvedBy: currentApprovedBy };
          updatedMatches[matchIndex] = newMatchState;

          // SYNC TO SUPABASE & BROADCAST
          supabase.from('matches').update({ approved_by: currentApprovedBy }).eq('id', match.id).then();
          supabase.channel('global-notifications').send({ 
            type: 'broadcast', 
            event: 'update_match', 
            payload: {
              id: match.id,
              approved_by: currentApprovedBy
            }
          });

          return { matches: updatedMatches };`
);

// 5. Match syncs (approve unanimous)
store = store.replace(
  /          const finalCurrentUser = notifiedUsers\.find\(u => u\.id === newCurrentUser\?\.id\) \|\| newCurrentUser;\r?\n\r?\n          return \{ matches: updatedMatches, users: notifiedUsers, currentUser: finalCurrentUser \};\r?\n        \}\);\r?\n        get\(\)\.checkAchievements\(\);\r?\n      \},/,
  `          const finalCurrentUser = notifiedUsers.find(u => u.id === newCurrentUser?.id) || newCurrentUser;

          // SYNC TO SUPABASE & BROADCAST (UNANIMOUS APPROVAL)
          supabase.from('matches').update({ 
            status: 'approved', 
            approved_by: currentApprovedBy,
            team1_elo: t1Ratings,
            team2_elo: t2Ratings,
            elo_change: {
              team1Change: result.team1Change,
              team2Change: result.team2Change,
              team1Changes: result.team1Changes,
              team2Changes: result.team2Changes
            }
          }).eq('id', match.id).then();
          
          supabase.channel('global-notifications').send({ 
            type: 'broadcast', 
            event: 'update_match', 
            payload: {
              id: match.id,
              status: 'approved',
              approved_by: currentApprovedBy,
              team1_elo: t1Ratings,
              team2_elo: t2Ratings,
              elo_change: {
                team1Change: result.team1Change,
                team2Change: result.team2Change,
                team1Changes: result.team1Changes,
                team2Changes: result.team2Changes
              }
            } 
          });

          // Sync user rating changes to Supabase
          updates.forEach(up => {
            const u = newUsers.find(nu => nu.id === up.id);
            if (u) {
              supabase.from('users').update({ 
                singles_rating: u.singlesRating, 
                doubles_rating: u.doublesRating 
              }).eq('id', u.id).then();
            }
          });

          return { matches: updatedMatches, users: notifiedUsers, currentUser: finalCurrentUser };
        });
        get().checkAchievements();
      },`
);

// 6. Match syncs (rejectMatch)
store = store.replace(
  /        const updatedMatches = \[\.\.\.state\.matches\];\r?\n        updatedMatches\[matchIndex\] = \{ \.\.\.match, status: 'rejected' \};\r?\n        \r?\n        return \{ matches: updatedMatches \};/,
  `        const updatedMatches = [...state.matches];
        updatedMatches[matchIndex] = { ...match, status: 'rejected' };
        
        // SYNC TO SUPABASE & BROADCAST
        supabase.from('matches').update({ status: 'rejected' }).eq('id', match.id).then();
        supabase.channel('global-notifications').send({ 
            type: 'broadcast', 
            event: 'update_match', 
            payload: {
              id: match.id,
              status: 'rejected'
            }
        });

        return { matches: updatedMatches };`
);

// 7. Add match broadcast
store = store.replace(
  /        const \{ data, error \} = await supabase\.from\('matches'\)\.insert\(\{([\s\S]*?is_tournament: m\.isTournament || false\s*)\}\)\.select\(\)\.single\(\);/,
  `        const { data, error } = await supabase.from('matches').insert({$1}).select().single();
        if (data) {
           supabase.channel('global-notifications').send({ type: 'broadcast', event: 'new_match', payload: data });
        } else {
           // Fallback if RLS blocks select on insert
           supabase.channel('global-notifications').send({ type: 'broadcast', event: 'new_match', payload: {
              id: m.id,
              team1: m.team1,
              team2: m.team2,
              team1_score: m.team1Score,
              team2_score: m.team2Score,
              date: m.date,
              court: m.court,
              match_format: m.matchFormat,
              status: 'pending',
              is_tournament: m.isTournament || false
           }});
        }`
);

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts perfectly");
