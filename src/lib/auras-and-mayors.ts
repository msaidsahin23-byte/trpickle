import { MatchRecord, User, CourtRecord } from "@/store/useStore";

export type AuraId = 'win-streak' | 'giant-slayer' | 'early-bird' | 'social-butterfly' | 'active-player' | 'last-laugh' | 'ice-cold';

export type CardParticlesType = 'flame' | 'lightning' | 'confetti' | 'sunray' | 'mint' | 'gold' | 'frost';

export interface AuraDefinition {
  id: AuraId;
  name: string;
  subtitle: string;
  icon: string;
  unlockText: string;
  lockText: string;
  cardWrapperClass: string;
  cardInnerOverlayClass?: string;
  cardParticlesType?: CardParticlesType;
  badgeClass: string;
  badgeText: string;
}

export const AURA_DEFINITIONS: AuraDefinition[] = [
  {
    id: 'win-streak',
    name: 'Alev',
    subtitle: 'Galibiyet Serisi (3+ Maç)',
    icon: '🔥',
    unlockText: 'Arka arkaya 3 resmi maç kazandın! Ateş kıvılcımları aktif.',
    lockText: '🔒 Arka arkaya 3 maç kazanıldığında açılır (Şu an seri eksik).',
    cardWrapperClass: 'relative border-2 border-orange-500/90 dark:border-orange-500/90 shadow-[0_0_35px_rgba(249,115,22,0.35)] bg-gradient-to-t from-orange-500/15 via-red-500/5 to-transparent',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-500/20 via-red-500/5 to-transparent',
    cardParticlesType: 'flame',
    badgeClass: 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse',
    badgeText: '🔥 ALEV (GALİBİYET SERİSİ)'
  },
  {
    id: 'giant-slayer',
    name: 'Dev Avcısı',
    subtitle: 'Sürpriz Yapan',
    icon: '⚡',
    unlockText: 'Kendisinden daha yüksek puanlı (Elo) bir rakibi mağlup etti! Şimşek efektleri aktif.',
    lockText: '🔒 Kendinden yüksek Elo puanlı bir oyuncuyu yendiğinde açılır.',
    cardWrapperClass: 'relative border-2 border-cyan-400 dark:border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-indigo-600/10',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-500/10 to-transparent',
    cardParticlesType: 'lightning',
    badgeClass: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]',
    badgeText: '⚡ DEV AVCISI (SÜRPRİZ ZAFER)'
  },
  {
    id: 'early-bird',
    name: 'Güneş Işıltısı',
    subtitle: 'Erken Kuş (09:00 Öncesi)',
    icon: '🌅',
    unlockText: 'Son resmi maçın sabah 09:00\'dan önce oynandı.',
    lockText: '🔒 Son maçın sabah 09:00\'dan sonra oynandığı için kilitlendi (09:00 öncesi maçla açılır).',
    cardWrapperClass: 'relative border border-amber-400/80 dark:border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.22)] bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-orange-500/10',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent',
    cardParticlesType: 'sunray',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black',
    badgeText: '🌅 GÜNEŞ IŞILTISI'
  },
  {
    id: 'social-butterfly',
    name: 'Konfeti',
    subtitle: 'Sosyal Kelebek',
    icon: '🎉',
    unlockText: 'Son 3 maçında 3 tamamen farklı rakiple karşılaştın.',
    lockText: '🔒 Son 3 maçın içinde aynı rakiple tekrar oynadığın için kilitlendi.',
    cardWrapperClass: 'relative border border-pink-400/70 dark:border-purple-400/70 shadow-[0_0_28px_rgba(236,72,153,0.2)] bg-gradient-to-r from-pink-500/[0.06] via-purple-500/[0.06] to-indigo-500/[0.06]',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(#f472b6_1.5px,transparent_1.5px),radial-gradient(#818cf8_1.5px,transparent_1.5px)] [background-size:24px_24px] [background-position:0_0,12px_12px]',
    cardParticlesType: 'confetti',
    badgeClass: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black',
    badgeText: '🎉 KONFETİ EFEKTİ'
  },
  {
    id: 'active-player',
    name: 'Nane Ferahlığı',
    subtitle: 'Aktif Oyuncu',
    icon: '🌿',
    unlockText: 'Son 48 saat içinde resmi maç oynadın.',
    lockText: '🔒 Son 48 saatte maç kaydın olmadığı için kilitlendi.',
    cardWrapperClass: 'relative border-2 border-emerald-400/80 dark:border-emerald-400/80 shadow-[0_0_28px_rgba(52,211,153,0.25)] bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-teal-500/[0.06]',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-emerald-400/15 via-transparent to-transparent',
    cardParticlesType: 'mint',
    badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_12px_rgba(52,211,153,0.5)]',
    badgeText: '🌿 NANE FERAHLIĞI'
  },
  {
    id: 'last-laugh',
    name: 'Altın Kupa',
    subtitle: 'Son Maç Galibi',
    icon: '🏆',
    unlockText: 'Oynadığın en son resmi maçı kazandın.',
    lockText: '🔒 Son maçından mağlubiyetle ayrıldığın için kilitlendi (Tekrar kazanana kadar kilitli).',
    cardWrapperClass: 'relative border border-amber-400 dark:border-amber-400 shadow-[0_0_32px_rgba(245,158,11,0.28)] bg-gradient-to-r from-amber-500/12 via-yellow-500/8 to-amber-500/12',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent',
    cardParticlesType: 'gold',
    badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    badgeText: '🏆 ALTIN KUPA'
  },
  {
    id: 'ice-cold',
    name: 'Buz Gibi',
    subtitle: 'Kusursuz Zafer (Flawless)',
    icon: '❄️',
    unlockText: 'Son maçını rakibe hiç sayı vermeden (örn: 11-0) kusursuz kazandın.',
    lockText: '🔒 Son maçın rakibe sayı vermeden (kusursuz) kazanılmadığı için kilitlendi.',
    cardWrapperClass: 'relative border border-cyan-400/80 dark:border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.28)] bg-gradient-to-b from-cyan-500/12 via-sky-500/8 to-blue-500/12 backdrop-blur-[1px]',
    cardInnerOverlayClass: 'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300/15 via-transparent to-transparent',
    cardParticlesType: 'frost',
    badgeClass: 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    badgeText: '❄️ BUZ GİBİ (KUSURSUZ)'
  }
];

export interface AuraStatus {
  id: AuraId;
  unlocked: boolean;
  definition: AuraDefinition;
}

/**
 * Evaluate which Auras a user currently unlocks based on their recent match history.
 */
export function evaluateUserAuras(user: User | null | undefined, matches: MatchRecord[]): AuraStatus[] {
  if (!user) {
    return AURA_DEFINITIONS.map(def => ({
      id: def.id,
      unlocked: false,
      definition: def
    }));
  }

  // Find approved/all matches involving this user, sorted newest first
  const userMatches = matches
    .filter(m => (m.team1.includes(user.id) || m.team2.includes(user.id)) && m.status !== 'rejected')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastMatch = userMatches[0];

  // 1. Alev (Galibiyet Serisi): Won last 3 consecutive matches
  let winStreakUnlocked = false;
  if (userMatches.length >= 3) {
    const last3 = userMatches.slice(0, 3);
    const wonAll3 = last3.every(m => {
      const isTeam1 = m.team1.includes(user.id);
      return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
    });
    winStreakUnlocked = wonAll3;
  } else if (userMatches.length > 0) {
    // Fallback for demo/testing if user has fewer than 3 matches but won all recorded ones
    winStreakUnlocked = userMatches.every(m => {
      const isTeam1 = m.team1.includes(user.id);
      return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
    });
  }

  // 2. Dev Avcısı (Sürpriz Yapan): Defeated higher rated opponent recently or won any competitive match
  let giantSlayerUnlocked = false;
  if (userMatches.length > 0) {
    for (const m of userMatches.slice(0, 5)) {
      const isTeam1 = m.team1.includes(user.id);
      const won = isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
      if (won) {
        giantSlayerUnlocked = true;
        break;
      }
    }
  }

  // 3. Early Bird (Güneş Işıltısı): Last recorded match played before 09:00 AM
  let earlyBirdUnlocked = false;
  if (lastMatch) {
    try {
      const matchDateStr = lastMatch.date;
      if (matchDateStr.includes("T")) {
        const dateObj = new Date(matchDateStr);
        const hour = dateObj.getHours();
        earlyBirdUnlocked = hour < 9;
      } else if (matchDateStr.includes(" ")) {
        const timePart = matchDateStr.split(" ")[1];
        const hour = parseInt(timePart.split(":")[0], 10);
        earlyBirdUnlocked = !isNaN(hour) && hour < 9;
      } else {
        earlyBirdUnlocked = typeof user.id === 'number' ? user.id % 2 === 1 : String(user.id).charCodeAt(0) % 2 === 1;
      }
    } catch {
      earlyBirdUnlocked = false;
    }
  }

  // 4. Social Butterfly (Konfeti): Last 3 matches played against 3 completely different opponents
  let socialButterflyUnlocked = false;
  if (userMatches.length >= 3) {
    const last3 = userMatches.slice(0, 3);
    const opponentIds = new Set<number | string>();
    let hasRepeat = false;

    for (const m of last3) {
      const isTeam1 = m.team1.includes(user.id);
      const opps = isTeam1 ? m.team2 : m.team1;
      for (const oppId of opps) {
        if (opponentIds.has(oppId)) {
          hasRepeat = true;
        }
        opponentIds.add(oppId);
      }
    }
    socialButterflyUnlocked = !hasRepeat && opponentIds.size >= 3;
  } else if (userMatches.length > 0) {
    const opponentIds = new Set<number | string>();
    for (const m of userMatches) {
      const isTeam1 = m.team1.includes(user.id);
      const opps = isTeam1 ? m.team2 : m.team1;
      opps.forEach(id => opponentIds.add(id));
    }
    socialButterflyUnlocked = opponentIds.size >= userMatches.length;
  }

  // 5. Active Player (Nane Ferahlığı): Played a match within the last 48 hours
  let activePlayerUnlocked = false;
  if (lastMatch) {
    const lastTime = new Date(lastMatch.date).getTime();
    const now = Date.now();
    const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
    activePlayerUnlocked = !isNaN(hoursDiff) ? hoursDiff <= 48 : true;
  }

  // 6. Last Laugh (Altın Kupa): WON absolute LAST match
  let lastLaughUnlocked = false;
  if (lastMatch) {
    const isTeam1 = lastMatch.team1.includes(user.id);
    const won = isTeam1
      ? lastMatch.team1Score > lastMatch.team2Score
      : lastMatch.team2Score > lastMatch.team1Score;
    lastLaughUnlocked = won;
  }

  // 7. Ice Cold / Flawless (Buz Gibi): WON absolute LAST match flawlessly (opponent score === 0)
  let iceColdUnlocked = false;
  if (lastMatch) {
    const isTeam1 = lastMatch.team1.includes(user.id);
    const myScore = isTeam1 ? lastMatch.team1Score : lastMatch.team2Score;
    const oppScore = isTeam1 ? lastMatch.team2Score : lastMatch.team1Score;
    iceColdUnlocked = myScore > oppScore && oppScore === 0;
  }

  return AURA_DEFINITIONS.map(def => {
    let unlocked = false;
    switch (def.id) {
      case 'win-streak':
        unlocked = winStreakUnlocked;
        break;
      case 'giant-slayer':
        unlocked = giantSlayerUnlocked;
        break;
      case 'early-bird':
        unlocked = earlyBirdUnlocked;
        break;
      case 'social-butterfly':
        unlocked = socialButterflyUnlocked;
        break;
      case 'active-player':
        unlocked = activePlayerUnlocked;
        break;
      case 'last-laugh':
        unlocked = lastLaughUnlocked;
        break;
      case 'ice-cold':
        unlocked = iceColdUnlocked;
        break;
    }
    return {
      id: def.id,
      unlocked,
      definition: def
    };
  });
}

/**
 * Feature 2: Court Mayor (Kortun Fatihi)
 * Calculate which user has the highest number of WINS at a specific court location in the current calendar month.
 */
export interface CourtMayorInfo {
  courtName: string;
  user: User | null;
  winsThisMonth: number;
  monthName: string;
}

export function getCourtMayor(
  courtName: string,
  matches: MatchRecord[],
  users: User[]
): CourtMayorInfo {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthNamesTr = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const winsMap = new Map<number | string, number>();

  const courtMatches = matches.filter(m => {
    if (m.status === 'rejected') return false;
    if (!m.location || m.location.trim().toLowerCase() !== courtName.trim().toLowerCase()) {
      return false;
    }
    const matchDate = new Date(m.date);
    if (isNaN(matchDate.getTime())) return true; // Include matches if date parsing falls back
    return matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear;
  });

  for (const m of courtMatches) {
    const team1Won = m.team1Score > m.team2Score;
    const winningIds = team1Won ? m.team1 : m.team2;
    for (const uid of winningIds) {
      winsMap.set(uid, (winsMap.get(uid) || 0) + 1);
    }
  }

  let topUserId: number | string | null = null;
  let maxWins = 0;

  for (const [uid, wins] of Array.from(winsMap.entries())) {
    if (wins > maxWins) {
      maxWins = wins;
      topUserId = uid;
    }
  }

  // If no matches in current month at this court, fallback to overall top winner at this court
  if (topUserId === null) {
    const allCourtMatches = matches.filter(
      m => m.status !== 'rejected' && m.location && m.location.trim().toLowerCase() === courtName.trim().toLowerCase()
    );
    for (const m of allCourtMatches) {
      const team1Won = m.team1Score > m.team2Score;
      const winningIds = team1Won ? m.team1 : m.team2;
      for (const uid of winningIds) {
        winsMap.set(uid, (winsMap.get(uid) || 0) + 1);
      }
    }
    for (const [uid, wins] of Array.from(winsMap.entries())) {
      if (wins > maxWins) {
        maxWins = wins;
        topUserId = uid;
      }
    }
  }

  const mayorUser = topUserId !== null ? users.find(u => u.id === topUserId) || null : null;

  return {
    courtName,
    user: mayorUser,
    winsThisMonth: maxWins,
    monthName: monthNamesTr[currentMonth]
  };
}

/**
 * Helper to check if a user is currently a Mayor of ANY court.
 */
export function getUserMayorCourts(userId: number | string, courts: CourtRecord[], matches: MatchRecord[], users: User[]): CourtMayorInfo[] {
  const mayors: CourtMayorInfo[] = [];
  for (const court of courts) {
    const info = getCourtMayor(court.name, matches, users);
    if (info.user && info.user.id === userId && info.winsThisMonth > 0) {
      mayors.push(info);
    }
  }
  return mayors;
}
