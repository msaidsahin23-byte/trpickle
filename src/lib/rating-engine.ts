/**
 * High-Reward Rating System Override (Phase 13)
 * Implements absolute floors, heavy MoV scaling, high K-Factor, and proportional individual rewards.
 */

export function calculateNewRatings(
  team1Ratings: number[],
  team2Ratings: number[],
  team1Score: number,
  team2Score: number
) {
  const t1Avg = team1Ratings.reduce((a, b) => a + b, 0) / team1Ratings.length;
  const t2Avg = team2Ratings.reduce((a, b) => a + b, 0) / team2Ratings.length;

  const r1Avg = t1Avg * 1000;
  const r2Avg = t2Avg * 1000;

  const s1 = team1Score > team2Score ? 1 : 0;
  const s2 = team2Score > team1Score ? 1 : 0;

  // Margin of Victory Multiplier (MoV) - Heavy Scaling
  const scoreDiff = Math.abs(team1Score - team2Score);
  // Base 1.0, add 0.15 for every point difference above 1
  const movMultiplier = 1 + Math.max(0, scoreDiff - 1) * 0.15;

  // High K-Factor
  const K = 0.150;
  const MIN_CHANGE = 0.010;
  const MAX_CHANGE = 0.100;

  const processChange = (rating: number, oppAvg: number, won: number) => {
    const r = rating * 1000;
    const e = 1 / (1 + Math.pow(10, (oppAvg - r) / 400));
    
    // Raw change
    let change = K * movMultiplier * (won - e);
    
    // Apply absolute bounds (hard caps)
    if (won === 1) {
      change = Math.max(MIN_CHANGE, Math.min(change, MAX_CHANGE));
    } else {
      change = Math.min(-MIN_CHANGE, Math.max(change, -MAX_CHANGE));
    }
    
    return Number(change.toFixed(3));
  };

  const team1Changes = team1Ratings.map(rating => processChange(rating, r2Avg, s1));
  const team2Changes = team2Ratings.map(rating => processChange(rating, r1Avg, s2));

  // Flat team changes for backward compatibility (Average of individual changes)
  const t1Change = Number((team1Changes.reduce((a, b) => a + b, 0) / team1Changes.length).toFixed(3));
  const t2Change = Number((team2Changes.reduce((a, b) => a + b, 0) / team2Changes.length).toFixed(3));

  return {
    team1Change: t1Change,
    team2Change: t2Change,
    team1Changes,
    team2Changes,
    team1NewAvg: Number((t1Avg + t1Change).toFixed(3)),
    team2NewAvg: Number((t2Avg + t2Change).toFixed(3))
  };
}
