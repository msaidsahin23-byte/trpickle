const fs = require('fs');

// --- 1. SupabaseSyncProvider.tsx ---
let provider = fs.readFileSync('src/components/SupabaseSyncProvider.tsx', 'utf8');

const matchListeners = `
            notifChannel.on('broadcast', { event: 'update_match' }, (payload) => {
              const m = payload.payload as any;
              useStore.setState((state) => {
                 const newMatches = state.matches.map(existing => {
                    if (String(existing.id) === String(m.id)) {
                       return {
                         ...existing,
                         status: m.status,
                         approvedBy: m.approved_by || [],
                         team1Elo: m.team1_elo || existing.team1Elo,
                         team2Elo: m.team2_elo || existing.team2Elo,
                         eloChange: m.elo_change || existing.eloChange
                       };
                    }
                    return existing;
                 });
                 return { matches: newMatches };
              });
            });

            notifChannel.on('broadcast', { event: 'new_match' }, (payload) => {
              const m = payload.payload as any;
              useStore.setState((state) => {
                 if (state.matches.some(existing => String(existing.id) === String(m.id))) return state;
                 const newMatch = {
                    id: m.id,
                    team1: m.team1 || [],
                    team2: m.team2 || [],
                    team1Score: m.team1_score || 0,
                    team2Score: m.team2_score || 0,
                    date: m.date || new Date().toISOString(),
                    court: m.court || "",
                    matchFormat: m.match_format || "doubles",
                    status: m.status || "pending",
                    approvedBy: m.approved_by || [],
                    team1Elo: m.team1_elo,
                    team2Elo: m.team2_elo,
                    eloChange: m.elo_change,
                    isTournament: m.is_tournament || false,
                    tournamentId: m.tournament_id
                 };
                 return { matches: [newMatch, ...state.matches] };
              });
            });
`;

// Insert the match listeners right before notifChannel.subscribe()
provider = provider.replace(/            notifChannel\.subscribe\(\);/, `${matchListeners}\n            notifChannel.subscribe();`);
fs.writeFileSync('src/components/SupabaseSyncProvider.tsx', provider, 'utf8');
console.log("Updated SupabaseSyncProvider.tsx with match listeners");


// --- 2. useStore.ts ---
let store = fs.readFileSync('src/store/useStore.ts', 'utf8');

// Inject the Supabase update for partial match approval (not unanimous yet)
store = store.replace(
  /          const updatedMatches = \[\.\.\.state\.matches\];\r?\n          updatedMatches\[matchIndex\] = \{ \.\.\.match, approvedBy: currentApprovedBy \};\r?\n          return \{ matches: updatedMatches \};/,
  `          const updatedMatches = [...state.matches];
          const newMatchState = { ...match, approvedBy: currentApprovedBy };
          updatedMatches[matchIndex] = newMatchState;

          // SYNC TO SUPABASE & BROADCAST
          supabase.from('matches').update({ approved_by: currentApprovedBy }).eq('id', match.id).select().then(({ data }) => {
            if (data && data.length > 0) {
              supabase.channel('global-notifications').send({ type: 'broadcast', event: 'update_match', payload: data[0] });
            }
          });

          return { matches: updatedMatches };`
);

// Inject the Supabase update for UNANIMOUS match approval (at the very end of approveMatch)
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
          }).eq('id', match.id).select().then(({ data }) => {
            if (data && data.length > 0) {
              supabase.channel('global-notifications').send({ type: 'broadcast', event: 'update_match', payload: data[0] });
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

// Inject the Supabase update for rejectMatch
store = store.replace(
  /        const updatedMatches = \[\.\.\.state\.matches\];\r?\n        updatedMatches\[matchIndex\] = \{ \.\.\.match, status: 'rejected' \};\r?\n        \r?\n        return \{ matches: updatedMatches \};/,
  `        const updatedMatches = [...state.matches];
        updatedMatches[matchIndex] = { ...match, status: 'rejected' };
        
        // SYNC TO SUPABASE & BROADCAST
        supabase.from('matches').update({ status: 'rejected' }).eq('id', match.id).select().then(({ data }) => {
            if (data && data.length > 0) {
              supabase.channel('global-notifications').send({ type: 'broadcast', event: 'update_match', payload: data[0] });
            }
        });

        return { matches: updatedMatches };`
);

// Add broadcast for Add Match
store = store.replace(
  /        const \{ data, error \} = await supabase\.from\('matches'\)\.insert\(\{([\s\S]*?)\}\)\.select\(\)\.single\(\);/,
  `        const { data, error } = await supabase.from('matches').insert({$1}).select().single();
        if (data) {
           supabase.channel('global-notifications').send({ type: 'broadcast', event: 'new_match', payload: data });
        }`
);

fs.writeFileSync('src/store/useStore.ts', store, 'utf8');
console.log("Updated useStore.ts with match syncs");
