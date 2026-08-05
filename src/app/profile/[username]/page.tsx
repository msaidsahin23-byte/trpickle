"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Feed from "@/components/Feed";
import { AuthModal } from "@/components/AuthModal";
import { ClientTime } from "@/components/ClientTime";
import { ArrowLeft, MapPin, Edit3, Settings, Shield, PlusCircle, CheckCircle2, ChevronRight, Pen, AlertCircle, MessageCircle, Heart, Trophy, Medal, Crown, Activity, BadgeCheck, ShieldCheck, Flame, Star, Trophy as TrophyIcon, TrendingUp, Users, Target, Zap, History, Plus, X, Share2, Send, Bell, BellOff, QrCode, Sparkles, Lock } from "lucide-react";
import html2canvas from "html2canvas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, MatchRecord, User } from "@/store/useStore";
import { ACHIEVEMENTS } from "@/data/achievements";
import { StoryExportTemplate } from "@/components/StoryExportTemplate";
import CommentDrawer from "@/components/CommentDrawer";
import { FollowersModal } from "@/components/FollowersModal";
import FriendBadge, { isMutualFriend } from "@/components/FriendBadge";
import PlayerQrModal from "@/components/PlayerQrModal";

// Helpers
function getInitials(name?: string) { if (!name) return '?';
  return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().substring(0, 2);
}

function calculateAge(birthdate?: string) {
  if (!birthdate) return null;
  const today = new Date();
  const birthDate = new Date(birthdate);
  // Guard against invalid dates
  if (isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0 || isNaN(age)) return null;
  return age;
}

function calculateAnalytics(history: MatchRecord[], userId: number | string, users: User[]) {
  if (!history || history.length === 0) return null;

  let wins = 0;
  let losses = 0;
  let flawlessWins = 0;
  let overtimeWins = 0;
  let overtimeTotal = 0;
  let closeMatchesTotal = 0;
  let closeMatchesWon = 0;

  let singlesPlayed = 0;
  let singlesWon = 0;
  let doublesPlayed = 0;
  let doublesWon = 0;

  let winDiffTotal = 0;
  let lossDiffTotal = 0;

  let doublePoints = 2.500;
  let mixPoints = 2.500;

  let partnerRatingSum = 0;
  let partnerRatingCount = 0;
  let opponentRatingSum = 0;
  let opponentRatingCount = 0;

  const partnerWins: { [id: string]: { played: number; won: number } } = {};
  const oppLosses: { [id: string]: { played: number; lost: number } } = {};

  const me = (Array.isArray(users) ? users : []).find(u => u.id === userId);
  const myGender = me?.gender || 'male';

  history.forEach(m => {
    const isT1 = (Array.isArray(m.team1) ? m.team1 : []).includes(userId);
    const myScore = isT1 ? m.team1Score : m.team2Score;
    const oppScore = isT1 ? m.team2Score : m.team1Score;
    const won = myScore > oppScore;

    if (won) {
      wins++;
      winDiffTotal += (myScore - oppScore);
    } else {
      losses++;
      lossDiffTotal += (oppScore - myScore);
    }

    if (won && oppScore === 0) flawlessWins++;

    if (myScore >= 10 && oppScore >= 10) {
      overtimeTotal++;
      if (won) overtimeWins++;
    }

    if (Math.abs(myScore - oppScore) <= 3) {
      closeMatchesTotal++;
      if (won) closeMatchesWon++;
    }

    const myTeam = isT1 ? m.team1 : m.team2;
    const oppTeam = isT1 ? m.team2 : m.team1;

    if (m.matchFormat === 'singles') {
      singlesPlayed++;
      if (won) singlesWon++;
    } else {
      doublesPlayed++;
      if (won) doublesWon++;

      // Double vs Mix logic
      const pIdx = myTeam.findIndex(id => id !== userId);
      if (pIdx !== -1) {
        const partnerId = myTeam[pIdx];
        const partner = (Array.isArray(users) ? users : []).find(u => u.id === partnerId);
        const partnerGender = partner?.gender || 'male';

        let myChange = 0;
        const myIdx = myTeam.indexOf(userId);
        if (isT1) {
          myChange = m.eloChange?.team1Changes?.[myIdx] ?? m.eloChange?.team1Change ?? 0;
        } else {
          myChange = m.eloChange?.team2Changes?.[myIdx] ?? m.eloChange?.team2Change ?? 0;
        }

        if (myGender === partnerGender) {
          doublePoints += myChange;
        } else {
          mixPoints += myChange;
        }
      }
    }

    myTeam.forEach(pid => {
      if (pid !== userId) {
        if (!partnerWins[pid]) partnerWins[pid] = { played: 0, won: 0 };
        partnerWins[pid].played++;
        if (won) partnerWins[pid].won++;
      }
    });

    oppTeam.forEach(oid => {
      if (!oppLosses[oid]) oppLosses[oid] = { played: 0, lost: 0 };
      oppLosses[oid].played++;
      if (!won) oppLosses[oid].lost++;
    });

    // Ratings
    if (isT1) {
      if (m.team2Elo) {
        m.team2Elo.forEach(elo => {
          opponentRatingSum += elo;
          opponentRatingCount++;
        });
      } else {
        oppTeam.forEach(oid => {
           const u = (Array.isArray(users) ? users : []).find(u => u.id === oid);
           opponentRatingSum += u ? (m.matchFormat === 'singles' ? u.singlesRating : u.doublesRating) : 2.500;
           opponentRatingCount++;
        });
      }
      if (m.matchFormat === 'doubles' && m.team1Elo) {
        const pIdx = m.team1.findIndex(id => id !== userId);
        if (pIdx !== -1) {
          partnerRatingSum += m.team1Elo[pIdx];
          partnerRatingCount++;
        }
      } else if (m.matchFormat === 'doubles') {
        const pIdx = m.team1.findIndex(id => id !== userId);
        if (pIdx !== -1) {
           const partnerId = m.team1[pIdx];
           const u = (Array.isArray(users) ? users : []).find(u => u.id === partnerId);
           partnerRatingSum += u ? u.doublesRating : 2.500;
           partnerRatingCount++;
        }
      }
    } else {
      if (m.team1Elo) {
        m.team1Elo.forEach(elo => {
          opponentRatingSum += elo;
          opponentRatingCount++;
        });
      } else {
        oppTeam.forEach(oid => {
           const u = (Array.isArray(users) ? users : []).find(u => u.id === oid);
           opponentRatingSum += u ? (m.matchFormat === 'singles' ? u.singlesRating : u.doublesRating) : 2.500;
           opponentRatingCount++;
        });
      }
      if (m.matchFormat === 'doubles' && m.team2Elo) {
        const pIdx = m.team2.findIndex(id => id !== userId);
        if (pIdx !== -1) {
          partnerRatingSum += m.team2Elo[pIdx];
          partnerRatingCount++;
        }
      } else if (m.matchFormat === 'doubles') {
        const pIdx = m.team2.findIndex(id => id !== userId);
        if (pIdx !== -1) {
           const partnerId = m.team2[pIdx];
           const u = (Array.isArray(users) ? users : []).find(u => u.id === partnerId);
           partnerRatingSum += u ? u.doublesRating : 2.500;
           partnerRatingCount++;
        }
      }
    }
  });

  let bestPartnerId: string | null = null;
  let bestPartnerRate = -1;
  Object.keys(partnerWins).forEach(pidStr => {
    const data = partnerWins[pidStr];
    if (data && data.played >= 1) {
      const rate = (data.won / data.played) * 100;
      if (rate > bestPartnerRate) {
        bestPartnerRate = rate;
        bestPartnerId = pidStr;
      }
    }
  });

  let toughestOppId: string | null = null;
  let maxLosses = -1;
  Object.keys(oppLosses).forEach(oidStr => {
    const data = oppLosses[oidStr];
    if (data && data.lost > maxLosses) {
      maxLosses = data.lost;
      toughestOppId = oidStr;
    }
  });

  const bestPartnerUser = (Array.isArray(users) ? users : []).find(u => String(u.id) === String(bestPartnerId));
  const toughestOppUser = (Array.isArray(users) ? users : []).find(u => String(u.id) === String(toughestOppId));

  return {
    winRate: Math.round((wins / history.length) * 100),
    flawlessWins,
    overtimeRate: overtimeTotal > 0 ? Math.round((overtimeWins / overtimeTotal) * 100) : 0,
    surpriseRate: closeMatchesTotal > 0 ? Math.round((closeMatchesWon / closeMatchesTotal) * 100) : 0,
    singlesRate: singlesPlayed > 0 ? Math.round((singlesWon / singlesPlayed) * 100) : 0,
    doublesRate: doublesPlayed > 0 ? Math.round((doublesWon / doublesPlayed) * 100) : 0,
    bestPartner: {
      name: bestPartnerUser ? bestPartnerUser.name : "Yok",
      rate: bestPartnerRate >= 0 ? Math.round(bestPartnerRate) : 0
    },
    toughestOpp: {
      name: toughestOppUser ? toughestOppUser.name : "Yok",
      text: maxLosses >= 0 ? `${maxLosses} Kez Yenilgi` : "Yok"
    },
    doublePoints,
    mixPoints,
    avgWinDiff: wins > 0 ? (winDiffTotal / wins) : 0,
    avgLossDiff: losses > 0 ? (lossDiffTotal / losses) : 0,
    avgPartnerRating: partnerRatingCount > 0 ? (partnerRatingSum / partnerRatingCount) : 0,
    avgOpponentRating: opponentRatingCount > 0 ? (opponentRatingSum / opponentRatingCount) : 0
  };
}

export interface BadgeItem {
  id: string;
  icon: any;
  title: string;
  description: string;
  isUnlocked: boolean;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

function getEarnableBadges(history: MatchRecord[], user: User): BadgeItem[] {
  const badges: BadgeItem[] = [];

  let currentStreak = 0;
  let maxStreak = 0;
  const chronological = [...history].reverse();
  chronological.forEach(match => {
    const isUserTeam1 = (Array.isArray(match.team1) ? match.team1 : []).includes(user.id);
    const userScore = isUserTeam1 ? match.team1Score : match.team2Score;
    const oppScore = isUserTeam1 ? match.team2Score : match.team1Score;
    if (userScore > oppScore) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  const hasWin = history.some(match => {
    const isUserTeam1 = (Array.isArray(match.team1) ? match.team1 : []).includes(user.id);
    const userScore = isUserTeam1 ? match.team1Score : match.team2Score;
    const oppScore = isUserTeam1 ? match.team2Score : match.team1Score;
    return userScore > oppScore;
  });

  const hasFlawless = history.some(match => {
    const isUserTeam1 = (Array.isArray(match.team1) ? match.team1 : []).includes(user.id);
    const userScore = isUserTeam1 ? match.team1Score : match.team2Score;
    const oppScore = isUserTeam1 ? match.team2Score : match.team1Score;
    return userScore > 0 && oppScore === 0;
  });

  const doublesCount = history.filter(m => m.matchFormat === "doubles").length;

  badges.push({
    id: "season-1-champion",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    title: "👑 Sezon 1 Şampiyonu",
    description: "Sezon 1 özel görevlerini ve Mega Sandığı tamamla",
    isUnlocked: Boolean((Array.isArray(user.claimedWeeklyQuests) ? user.claimedWeeklyQuests : []).includes("season1-mega-chest") || (Array.isArray(user.unlockedAchievements) ? user.unlockedAchievements : []).includes("season-1-champion")),
    color: "amber",
    bgClass: "bg-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-400"
  });

  badges.push({
    id: "first-match",
    icon: <Target className="w-5 h-5" />,
    title: "Korta İlk Adım",
    description: "Sisteme ilk resmi maç skorunu kaydet",
    isUnlocked: history.length >= 1,
    color: "blue",
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    textClass: "text-blue-600 dark:text-blue-300",
    borderClass: "border-blue-200"
  });

  badges.push({
    id: "first-win",
    icon: <Trophy className="w-5 h-5" />,
    title: "İlk Galibiyet",
    description: "Resmi bir maçta ilk galibiyetini al",
    isUnlocked: hasWin,
    color: "emerald",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-200"
  });

  badges.push({
    id: "streak-3",
    icon: <Flame className="w-5 h-5" />,
    title: "Seri Galibiyet: 3+",
    description: "Arka arkaya en az 3 maç kazan",
    isUnlocked: maxStreak >= 3,
    color: "orange",
    bgClass: "bg-orange-100 dark:bg-orange-900/40",
    textClass: "text-orange-600 dark:text-orange-300",
    borderClass: "border-orange-200"
  });

  badges.push({
    id: "streak-5",
    icon: <Zap className="w-5 h-5 text-rose-500" />,
    title: "Yenilmez Ateş: 5+",
    description: "Arka arkaya en az 5 maç kazan",
    isUnlocked: maxStreak >= 5,
    color: "rose",
    bgClass: "bg-rose-100 dark:bg-rose-900/40",
    textClass: "text-rose-600 dark:text-rose-300",
    borderClass: "border-rose-200"
  });

  badges.push({
    id: "doubles-master",
    icon: <Users className="w-5 h-5 text-cyan-500" />,
    title: "Çiftler Ustası",
    description: "En az 3 eşli (2v2) maç tamamla",
    isUnlocked: doublesCount >= 3,
    color: "cyan",
    bgClass: "bg-cyan-100 dark:bg-cyan-900/40",
    textClass: "text-cyan-600 dark:text-cyan-300",
    borderClass: "border-cyan-200"
  });

  badges.push({
    id: "flawless-win",
    icon: <ShieldCheck className="w-5 h-5 text-yellow-500" />,
    title: "Kusursuz Zafer",
    description: "Rakibe hiç sayı vermeden net skorla bir maç kazan",
    isUnlocked: hasFlawless,
    color: "yellow",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/40",
    textClass: "text-yellow-700 dark:text-yellow-300",
    borderClass: "border-yellow-200"
  });

  badges.push({
    id: "court-explorer",
    icon: <MapPin className="w-5 h-5 text-indigo-500" />,
    title: "Kort Seyyahı",
    description: "Profiline favori kort ekleyerek radarını ayarla",
    isUnlocked: Boolean(user.favoriteCourt),
    color: "indigo",
    bgClass: "bg-indigo-100 dark:bg-indigo-900/40",
    textClass: "text-indigo-600 dark:text-indigo-300",
    borderClass: "border-indigo-200"
  });

  badges.push({
    id: "social-popular",
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    title: "Topluluk Popüleri",
    description: "Toplulukta en az 25 takipçiye ulaş",
    isUnlocked: (user.followers?.length || 0) >= 25,
    color: "pink",
    bgClass: "bg-pink-100 dark:bg-pink-900/40",
    textClass: "text-pink-600 dark:text-pink-300",
    borderClass: "border-pink-200"
  });

  badges.push({
    id: "match-100",
    icon: <Star className="w-5 h-5 text-purple-500" />,
    title: "100. Maç Efsanesi",
    description: "Toplam 100 resmi maça çıkarak kulübün efsanesi ol",
    isUnlocked: history.length >= 100,
    color: "purple",
    bgClass: "bg-purple-100 dark:bg-purple-900/40",
    textClass: "text-purple-600 dark:text-purple-300",
    borderClass: "border-purple-200"
  });

  const unlockedIds = Array.isArray(user.unlockedAchievements) ? user.unlockedAchievements : [];
  ACHIEVEMENTS.forEach(ach => {
    if (ach.id !== "season-1-champion") {
      badges.push({
        id: `ach-${ach.id}`,
        icon: <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        title: ach.title,
        description: ach.description || "Başarım görevi",
        isUnlocked: unlockedIds.includes(ach.id),
        color: "emerald",
        bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
        textClass: "text-emerald-700 dark:text-emerald-300",
        borderClass: "border-emerald-200"
      });
    }
  });

  return badges;
}

function getBadges(history: MatchRecord[], user: User) {
  return getEarnableBadges(history, user).filter(b => b.isUnlocked);
}

function getBadgeOwnershipInfo(badgeId: string, allUsers: User[]) {
  let count = 0;
  for (const u of allUsers) {
    if (u.unlockedAchievements?.includes(badgeId)) {
      count++;
    }
  }
  const percentage = allUsers.length > 0 ? Math.round((count / allUsers.length) * 100) : 0;
  let label = "Keşfedilmedi";
  if (count > 0) {
    if (percentage < 5) label = "Efsanevi Nadirlik";
    else if (percentage < 15) label = "Çok Nadir";
    else if (percentage < 30) label = "Nadir Başarım";
    else if (percentage < 50) label = "Seçkin Başarım";
    else label = "Yaygın Başarım";
  }
  return { count, percentage, label };
}

const TAG_CATEGORIES = {
  "Fiziksel & Tutuş": ["Sağlak", "Solak", "İki Elli Backhand", "Tek Elli Backhand", "Continental Tutuş", "Western Tutuş"],
  "Oyun Stili": ["Sert Vurucu (Banger)", "Defansif Duvar", "Agresif Hücumcu", "Hızlı / Atletik", "Sabırlı Oyuncu", "Kontra-Atakçı", "Servis & Vole"],
  "Saha İçi Alan": ["File Önü Uzmanı (Dinker)", "Çizgi Oyuncusu (Baseline)", "Her Yerde (All-Court)", "Mutfak Bekçisi", "Geçiş Bölgesi Ustası"],
  "Özel Vuruşlar": ["Lob Uzmanı", "Top-Spin Ustası", "Drop Shot Ustası", "Kesme Vuruş (Slice)", "Keskin Paralel", "Smaç Canavarı"],
  "Mental & Topluluk": ["Takım Oyuncusu", "Soğukkanlı (Clutch)", "Eğlence Odaklı", "Adil Oyuncu (Fair-Play)", "Taktiksel Zeka", "Kort Lideri", "Turnuva Savaşçısı"],
  "Prestij Unvanları": ["Geleceğin Yıldızı", "Deneyimli Raket", "Kortların Hakimi", "Kortların Efendisi", "Pickleball Ustası", "TRPickle Efsanesi"]
};

const TAG_LEVEL_REQUIREMENTS: Record<string, number> = {
  "Geleceğin Yıldızı": 5,
  "Deneyimli Raket": 10,
  "Kortların Hakimi": 15,
  "Kortların Efendisi": 25,
  "Pickleball Ustası": 35,
  "TRPickle Efsanesi": 50,
};

function MatchCardItem({ match, idx, userState, renderTeamWithElo, currentUser, addMatchComment, users, onOpenComments }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleNativeShare = async () => {
    const text = `TRPickle'da efsane bir maç oynadık! Skor: ${match.team1Score}-${match.team2Score}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pickleball Maçı',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Bağlantı panoya kopyalandı!");
    }
    setShowShareModal(false);
  };

  const handleExportImage = async () => {
    setShowShareModal(false);
    setIsExporting(true);
    // Allow template to mount and images/fonts to load
    await new Promise(r => setTimeout(r, 800));
    
    if (exportRef.current) {
      try {
        const canvas = await html2canvas(exportRef.current, { 
          backgroundColor: '#0f172a', 
          scale: 1,
          useCORS: true,
          allowTaint: true
        });
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }
          const file = new File([blob], `trpickle-match-${match.id}.png`, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
             try {
               await navigator.share({
                 title: 'TRPickle Maç Sonucu',
                 files: [file]
               });
             } catch (err) {
               console.error('Error sharing:', err);
             }
          } else {
             const image = canvas.toDataURL("image/png", 1.0);
             const link = document.createElement('a');
             link.download = `trpickle-match-${match.id}.png`;
             link.href = image;
             link.click();
          }
          setIsExporting(false);
        }, "image/png", 1.0);
      } catch (err) {
        console.error(err);
        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
    }
  };

  const handleCommentSubmit = (e: any) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    addMatchComment(match.id, { id: Date.now(), author: currentUser.name, text: newComment });
    setNewComment("");
  };

  const isUserTeam1 = (Array.isArray(match.team1) ? match.team1 : []).includes(userState.id);
  const isUserTeam2 = (Array.isArray(match.team2) ? match.team2 : []).includes(userState.id);
  
  let won = false;
  let eloChangeVal = 0;

  if (isUserTeam1) {
    won = match.team1Score > match.team2Score;
    eloChangeVal = match.eloChange?.team1Change || 0;
  } else if (isUserTeam2) {
    won = match.team2Score > match.team1Score;
    eloChangeVal = match.eloChange?.team2Change || 0;
  } else {
    won = match.team1Score > match.team2Score;
    eloChangeVal = match.eloChange?.team1Change || 0;
  }

  const isPositive = eloChangeVal >= 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow ${match.status === 'pending' ? 'opacity-70' : ''}`}>
      <div ref={cardRef} className="bg-white dark:bg-slate-800 rounded-t-2xl relative group">
        <Link href={`/match/${match.id}`} className="p-4 flex flex-col sm:flex-row items-center gap-4 block w-full hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-t-2xl">
          <div className="flex flex-col items-center sm:items-start w-full sm:w-24 shrink-0">
            <ClientTime dateString={match.date} className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase" />
            <span className="text-sm font-bold text-pb-dark dark:text-white bg-gray-50 dark:bg-slate-700 px-2 py-0.5 rounded mt-1 mb-1">
              {(match.team1?.length > 1) ? "2v2" : "1v1"}
            </span>
            {(match.location || match.eventName) && (
              <div className="flex flex-col gap-1 mt-1">
                {match.eventName && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <TrophyIcon className="w-3 h-3 text-yellow-500" /> {match.eventName}
                  </span>
                )}
                {match.location && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <MapPin className="w-3 h-3 text-pb-blue" /> {match.location}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center sm:justify-start gap-4 sm:gap-6 w-full">
            {renderTeamWithElo(match.team1, match.team1Elo, isUserTeam1, 'right', idx, match.matchFormat, match, true)}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-600 shrink-0">
              <span className="font-extrabold text-lg text-pb-dark dark:text-white">{match.team1Score}</span>
              <span className="text-gray-300 dark:text-gray-500 font-bold">-</span>
              <span className="font-extrabold text-lg text-pb-dark dark:text-white">{match.team2Score}</span>
            </div>
            {renderTeamWithElo(match.team2, match.team2Elo, isUserTeam2, 'left', idx, match.matchFormat, match, false)}
          </div>

          <div className="w-full sm:w-32 shrink-0 flex justify-center sm:justify-end">
            {match.status === 'pending' ? (
              <div className="flex flex-col items-center sm:items-end gap-1">
                <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-500 rounded-lg text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider">
                  ⏳ Onay Bekliyor
                </span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 italic">Hesaplanıyor...</span>
              </div>
            ) : (
              <div className={`font-extrabold text-lg flex items-center gap-1.5 ${isPositive ? 'text-pb-green' : 'text-red-500'}`}>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{match.matchFormat === 'doubles' ? 'Eşli' : 'Tekli'}</span>
                <span>{isPositive ? '+' : ''}{eloChangeVal.toFixed(3)}</span>
              </div>
            )}
          </div>
        </Link>
      </div>
      
      {match.status !== 'pending' && (
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-pb-blue transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Yorumlar ({match.comments?.length || 0})
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowShareModal(!showShareModal)}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-pb-green transition-colors"
            >
              <Share2 className="w-4 h-4" /> Paylaş
            </button>
            
            {showShareModal && (
              <div className="absolute right-0 bottom-8 mb-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl p-2 z-50 flex flex-col gap-1">
                <button onClick={handleNativeShare} className="text-left px-3 py-2 text-sm font-bold text-pb-dark dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl">
                  Paylaş
                </button>
                <button onClick={handleExportImage} className="text-left px-3 py-2 text-sm font-bold text-pb-dark dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl">
                  Hikaye Olarak İndir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="overflow-hidden border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl">
          <div className="p-4 flex flex-col gap-4">
            {(Array.isArray(match.comments) ? match.comments : []).map((c: any) => (
              <div key={c.id} className="flex flex-col">
                <span className="text-xs font-bold text-pb-dark dark:text-white">{c.author}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{c.text}</span>
              </div>
            ))}
            
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center mt-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Bir yorum yaz..." 
                  className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:border-pb-blue text-pb-dark dark:text-white"
                />
                <button type="submit" className="p-2 bg-pb-blue text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50" disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="text-xs text-gray-400 font-medium mt-2">Yorum yapmak için giriş yapmalısın.</div>
            )}
          </div>
        </div>
      )}

      {isExporting && <StoryExportTemplate match={match} users={users} ref={exportRef} />}
    </div>
  );
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | number | null>(null);
  const users = useStore(state => state.users);
  const matches = useStore(state => state.matches);
  const currentUser = useStore(state => state.currentUser);
  const updateUser = useStore(state => state.updateUser);
  const updateUserTags = useStore(state => state.updateUserTags);
  const toggleBlockUser = useStore(state => state.toggleBlockUser);
  const toggleFollow = useStore(state => state.toggleFollow);
  const toggleMuteActivityUser = useStore(state => state.toggleMuteActivityUser);
  const addMatchComment = useStore(state => state.addMatchComment);
  const adminUpdateUserRole = useStore(state => state.adminUpdateUserRole);
  const adminUpdateUserRating = useStore(state => state.adminUpdateUserRating);
  const deleteUser = useStore(state => state.deleteUser);
  
  const profileUsername = params.username;
  const userState = (Array.isArray(users) ? users : []).find(u => u.username === profileUsername || u.id.toString() === profileUsername);

  useEffect(() => {
    if (mounted && userState && userState.username && userState.username !== profileUsername) {
      router.replace(`/profile/${userState.username}`);
    }
  }, [mounted, userState, profileUsername, router]);

  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tags, setTags] = useState<string[]>(userState?.tags || []);
  const [tagError, setTagError] = useState("");
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following" | null>(null);
  const [showQrCardModal, setShowQrCardModal] = useState(false);
  const [showBadgeShowcaseModal, setShowBadgeShowcaseModal] = useState(false);
  const [selectedShowcaseIds, setSelectedShowcaseIds] = useState<string[]>([]);
  const [showcaseError, setShowcaseError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "trophies" | "matches" | "posts">("overview");
  const [matchFilter, setMatchFilter] = useState<"all" | "singles" | "doubles" | "wins">("all");

  if (!mounted) return null;

  if (!userState) {
    return <div className="p-12 text-center font-bold text-slate-500">Kullanıcı bulunamadı.</div>;
  }

  const isOwnProfile = currentUser?.id === userState.id;

  const handleSaveTags = () => {
    updateUserTags(userState.id, tags);
    setIsEditingTags(false);
    setTagError("");
  };

  const handleToggleTag = (tagToToggle: string) => {
    if (tags.includes(tagToToggle)) {
      setTags(tags.filter(t => t !== tagToToggle));
      setTagError("");
    } else {
      if (tags.length >= 3) {
        setTagError("En fazla 3 etiket seçebilirsiniz.");
      } else {
        setTags([...tags, tagToToggle]);
        setTagError("");
      }
    }
  };

  const userMatches = (Array.isArray(matches) ? matches : []).filter(m => 
    (!m.status || m.status === 'approved') && 
    ((Array.isArray(m.team1) ? m.team1 : []).includes(userState.id) || (Array.isArray(m.team2) ? m.team2 : []).includes(userState.id))
  );

  const history = userMatches;

  const recent10 = history.slice(0, 10);
  const formTrend = recent10.map(match => {
    const isTeam1 = (Array.isArray(match.team1) ? match.team1 : []).includes(userState.id);
    const isTeam2 = (Array.isArray(match.team2) ? match.team2 : []).includes(userState.id);
    let won = false;
    if (isTeam1) won = match.team1Score > match.team2Score;
    else if (isTeam2) won = match.team2Score > match.team1Score;
    else won = match.team1Score > match.team2Score;
    return won ? "W" : "L";
  }).reverse();

  const analytics = calculateAnalytics(history, userState.id, users);
  const badges = getBadges(history, userState);
  const allEarnableBadges = getEarnableBadges(history, userState);
  const unlockedBadges = allEarnableBadges.filter(b => b.isUnlocked);
  const lockedBadges = allEarnableBadges.filter(b => !b.isUnlocked);

  const activeFeaturedIds = Array.isArray(userState.featuredBadges) && userState.featuredBadges.length > 0
    ? userState.featuredBadges
    : [];

  const hasShowcase = activeFeaturedIds.length > 0;

  const featuredBadgesList = activeFeaturedIds
    .map(id => allEarnableBadges.find(b => b.id === id))
    .filter(Boolean) as BadgeItem[];

  const filteredMatches = history.filter(m => {
    if (matchFilter === "singles") return m.matchFormat === "singles";
    if (matchFilter === "doubles") return m.matchFormat === "doubles";
    if (matchFilter === "wins") {
      const isTeam1 = (Array.isArray(m.team1) ? m.team1 : []).includes(userState.id);
      return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
    }
    return true;
  });

  const totalWinsCount = history.filter(m => {
    const isTeam1 = (Array.isArray(m.team1) ? m.team1 : []).includes(userState.id);
    return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
  }).length;
  const winRatePercentage = history.length > 0 ? Math.round((totalWinsCount / history.length) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const getUserId = (name: string) => {
    const u = (Array.isArray(users) ? users : []).find(user => user.name === name);
    return u ? u.id : null;
  };

  const getHistoricalElo = (userId: number, matchIdx: number, matchFormat: 'singles' | 'doubles') => {
    const user = (Array.isArray(users) ? users : []).find(u => u.id === userId);
    if (!user) return null;
    
    let elo = matchFormat === 'singles' ? user.singlesRating : user.doublesRating;
    
    for (let i = 0; i <= matchIdx; i++) {
      const m = history[i];
      if (m.matchFormat !== matchFormat || m.status === 'pending' || m.status === 'rejected') continue;
      
      const isT1 = (Array.isArray(m.team1) ? m.team1 : []).includes(userId);
      const isT2 = (Array.isArray(m.team2) ? m.team2 : []).includes(userId);
      
      if (isT1) {
        const idx = m.team1.indexOf(userId);
        if (m.eloChange?.team1Changes?.[idx] !== undefined) {
          elo -= m.eloChange!.team1Changes![idx];
        } else {
          elo -= (m.eloChange?.team1Change || 0);
        }
      } else if (isT2) {
        const idx = m.team2.indexOf(userId);
        if (m.eloChange?.team2Changes?.[idx] !== undefined) {
          elo -= m.eloChange!.team2Changes![idx];
        } else {
          elo -= (m.eloChange?.team2Change || 0);
        }
      }
    }
    
    return elo;
  };

  const renderTeamWithElo = (teamIds: number[], teamElos: number[] | undefined, isUserTeam: boolean, align: 'left' | 'right', matchIdx: number, matchFormat: 'singles' | 'doubles', m: MatchRecord, isTeam1: boolean) => {
    return (
      <div className={`flex flex-wrap gap-x-1.5 items-center justify-center ${align === 'left' ? 'sm:justify-start text-left' : 'sm:justify-end text-right'} flex-1 ${isUserTeam ? 'font-extrabold text-pb-dark dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
        {(Array.isArray(teamIds) ? teamIds : []).map((tId, i) => {
          const u = (Array.isArray(users) ? users : []).find(user => user.id === tId);
          const name = u ? u.name : "Bilinmeyen Kullanıcı";
          
          let eloStr = null;
          const calculatedElo = getHistoricalElo(tId, matchIdx, matchFormat);
          if (calculatedElo !== null) {
            eloStr = calculatedElo.toFixed(3);
          } else if (teamElos && teamElos[i]) {
            eloStr = teamElos[i].toFixed(3);
          }

          let gainStr = null;
          let isPositiveGain = true;
          
          if (m.status !== 'pending' && m.status !== 'rejected') {
            const tIdx = isTeam1 ? m.team1.indexOf(tId) : m.team2.indexOf(tId);
            let gain = 0;
            if (isTeam1) {
              gain = m.eloChange?.team1Changes?.[tIdx] ?? m.eloChange?.team1Change ?? 0;
            } else {
              gain = m.eloChange?.team2Changes?.[tIdx] ?? m.eloChange?.team2Change ?? 0;
            }
            isPositiveGain = gain >= 0;
            // For gray formatting if 0
            if (gain === 0) {
              gainStr = "0.000";
            } else {
              gainStr = `${isPositiveGain ? '+' : ''}${gain.toFixed(3)}`;
            }
          }
          
          const nameContent = u ? (
            <Link href={`/profile/${tId}`} className="hover:text-pb-blue hover:underline transition-colors">
              {name}
            </Link>
          ) : <span>{name}</span>;

          return (
            <span key={i} className="inline-flex items-center gap-1">
              {nameContent}
              {eloStr && <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-normal whitespace-nowrap">({eloStr})</span>}
              {gainStr && (
                <span className={`text-[10px] sm:text-[11px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-full ml-0.5 ${gainStr === "0.000" ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700' : isPositiveGain ? 'text-pb-green bg-pb-green/10 dark:bg-pb-green/20' : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>
                  {gainStr}
                </span>
              )}
              {i < teamIds.length - 1 && <span className="text-gray-300 dark:text-gray-600 mx-0.5">&</span>}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div 
            className="max-w-7xl mx-auto flex flex-col gap-8"
      >
        {/* 1. CINEMATIC HERO SECTION WITH INTEGRATED BADGE SHOWCASE */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200/80 dark:border-slate-800 overflow-hidden relative">
          {/* Banner Cover */}
          <div className="w-full h-44 sm:h-56 relative overflow-hidden bg-gradient-to-r from-emerald-50 dark:from-slate-900 via-white dark:via-indigo-950 to-emerald-100/50 dark:to-slate-900">
            {userState.bannerUrl ? (
              <img src={userState.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-80 dark:opacity-80 opacity-100" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 dark:from-amber-500/20 via-pb-green/10 dark:via-pb-blue/15 to-transparent pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent pointer-events-none"></div>

            {/* Top Bar Actions inside Banner */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/60 backdrop-blur-md text-white font-bold text-xs border border-white/15 hover:bg-slate-950/80 transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>

              <div className="flex items-center gap-2">
                {isOwnProfile && (
                  <button
                    onClick={() => setShowQrCardModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-950/60 backdrop-blur-md text-amber-300 font-extrabold text-xs border border-white/15 hover:bg-slate-950/80 transition-all shadow-md cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden sm:inline">Oyuncu Kartım</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Hero Content Area (Clean, Full-Width & Breathing Room) */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 -mt-16 sm:-mt-20">
              
              {/* Left Side: Avatar & Profile Bio Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 flex-1">
                {/* Avatar with Level Ring */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-2xl border border-gray-200 dark:border-slate-700">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden flex items-center justify-center text-4xl font-black text-slate-800 dark:text-white">
                      {userState.avatarUrl ? (
                        <img src={userState.avatarUrl} alt={userState.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(userState.name)
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-lg border border-gray-100 dark:border-slate-700"
                    style={{ color: userState.accentColor || '#3b82f6' }}
                  >
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 mt-2 sm:mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex flex-col">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        {userState.name}
                      </h1>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-0.5">@{userState.username}</span>
                    </div>

                    {!isOwnProfile && (
                      <FriendBadge currentUser={currentUser} targetUser={userState} size="lg" />
                    )}

                    {calculateAge(userState.birthdate) !== null && (
                      <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30">
                        Yaş: {calculateAge(userState.birthdate)}
                      </span>
                    )}

                    <span className="bg-pb-blue/15 text-pb-blue text-xs font-black px-3 py-1 rounded-full border border-pb-blue/30">
                      Seviye {userState.level || 1}
                    </span>
                  </div>

                  {/* Bio */}
                  {userState.bio && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                      <p className="leading-relaxed">{userState.bio}</p>
                    </div>
                  )}

                  {/* City & Total Matches */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                    {userState.city && (
                      <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-pb-blue" />
                        {userState.city}
                      </span>
                    )}
                    <span>🎾 Toplam {history.length} Resmi Maç</span>
                  </div>

                  {/* HIGH-UP HERO TAGS BAR (DAHA YUKARDA OYUN STİLİ & ETİKETLER) */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3.5">
                    {tags.map((tag) => {
                      const reqLvl = TAG_LEVEL_REQUIREMENTS[tag] || 1;
                      let badgeStyle = "bg-slate-900 dark:bg-slate-800 text-white border-white/15";
                      if (reqLvl >= 50) badgeStyle = "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white border-yellow-400 shadow-md shadow-yellow-500/40 animate-pulse";
                      else if (reqLvl >= 35) badgeStyle = "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-purple-400 shadow-md";
                      else if (reqLvl >= 25) badgeStyle = "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-md";
                      else if (reqLvl >= 15) badgeStyle = "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md";
                      else if (reqLvl >= 10) badgeStyle = "bg-emerald-600 text-white border-emerald-400";
                      else if (reqLvl >= 5) badgeStyle = "bg-slate-700 text-white border-slate-500";

                      return (
                        <span
                          key={`hero-tag-${tag}`}
                          className={`px-3.5 py-1 rounded-xl text-xs font-black border shadow-sm flex items-center gap-1.5 ${badgeStyle}`}
                        >
                          {reqLvl >= 50 ? <Crown className="w-3 h-3 text-yellow-100" /> : <Target className="w-3 h-3 text-emerald-400" />}
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingTags(true)}
                        className="px-3.5 py-1 rounded-xl text-xs font-extrabold bg-pb-blue/15 hover:bg-pb-blue/25 text-pb-blue border border-pb-blue/30 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>+ Etiketleri Düzenle</span>
                      </button>
                    )}
                  </div>

                  {/* Social Counters & Main Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
                    <button
                      onClick={() => setFollowersModalTab("followers")}
                      className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-pb-blue transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-black text-sm text-slate-900 dark:text-white">{userState.followers?.length || 0}</span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Takipçi</span>
                    </button>

                    <button
                      onClick={() => setFollowersModalTab("following")}
                      className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-pb-blue transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-black text-sm text-slate-900 dark:text-white">{userState.following?.length || 0}</span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Takip</span>
                    </button>

                    {/* Own profile edit / follow action */}
                    {isOwnProfile ? (
                      <Link
                        href="/settings"
                        className="px-5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:scale-105 transition-transform flex items-center gap-2 shadow-md"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profili Düzenle</span>
                      </Link>
                    ) : currentUser && (
                      <button
                        onClick={() => toggleFollow(userState.id)}
                        className={`px-6 py-2 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 ${
                          (Array.isArray(currentUser?.following) ? currentUser.following : []).includes(userState.id)
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700'
                            : 'bg-gradient-to-r from-pb-blue to-indigo-600 text-white hover:scale-105'
                        }`}
                      >
                        {(Array.isArray(currentUser?.following) ? currentUser.following : []).includes(userState.id) ? "Takip Ediliyor" : "+ Takip Et"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Rating Shield Stamp */}
              <div className="flex sm:flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-slate-800/80 px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-slate-700/80 shrink-0 mt-4 lg:mt-6">
                <div className="text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">Tekli Rating</span>
                  <span className="text-2xl font-black text-pb-blue">{(userState.singlesRating || 2.500).toFixed(3)}</span>
                </div>
                <div className="w-px h-8 sm:w-12 sm:h-px bg-gray-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">Eşli Rating</span>
                  <span className="text-2xl font-black text-purple-500">{(userState.doublesRating || 2.500).toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. LUXURY CLEAN TABS HEADER (ZERO SCROLLBARS EVER) */}
        <div className="border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center justify-start flex-wrap gap-2 w-full">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <Activity className="w-4 h-4 text-pb-blue" />
              <span>Genel Bakış</span>
            </button>

            <button
              onClick={() => setActiveTab("trophies")}
              className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "trophies"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <Medal className="w-4 h-4 text-amber-500" />
              <span>Rozet Koleksiyonu</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] sm:text-[11px]">
                {unlockedBadges.length}/{allEarnableBadges.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("matches")}
              className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "matches"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <History className="w-4 h-4 text-emerald-500" />
              <span>Maç Geçmişi</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-xs">
                {history.length}
              </span>
            </button>

            {(userState.showPostsOnProfile !== false || isOwnProfile) && (
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "posts"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-[1.02]"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-pb-blue" />
                <span>Gönderiler</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW & SMART ANALYTICS (WIDESCREEN DASHBOARD)
           ======================================================== */}
        {activeTab === "overview" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-8">
            
            {/* ⭐ GRAND HOLO-SHOWCASE PODIUM: ÖNE ÇIKAN 3 ROZET VİTRİNİ */}
            {hasShowcase && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white dark:from-slate-900 via-emerald-50/40 dark:via-slate-900 to-emerald-100/50 dark:to-indigo-950 p-6 sm:p-8 border border-gray-200 dark:border-amber-500/30 shadow-xl dark:shadow-2xl shadow-emerald-900/5">
              {/* Background Ambient Gold Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-pb-green/10 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-pb-green/10 dark:bg-pb-blue/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        OYUNCU BAŞARIM VİTRİNİ
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-500/30">
                        Öne Çıkan İlk 3
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Oyuncunun kariyerinde en gurur duyduğu ve vitrine sabitlediği kupa ile rozetler
                    </p>
                  </div>
                </div>

              </div>

              {/* 3 Luxury Holographic Podium Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
                {[0, 1, 2].map((slotIdx) => {
                  const badge = featuredBadgesList[slotIdx];
                  return badge ? (
                    <div
                      key={`podium-card-${badge.id}-${slotIdx}`}
                      className="group relative rounded-3xl bg-gray-50/50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-gray-200 dark:border-white/10 hover:border-emerald-400/50 dark:hover:border-amber-500/50 p-6 flex flex-col items-center text-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Slot Rank Watermark */}
                      <span className="absolute top-3.5 right-4 text-xs font-black text-gray-300 dark:text-amber-500/40 tracking-wider">
                        SLOT #{slotIdx + 1}
                      </span>

                      <div className="mt-2">
                        <div className={`w-16 h-16 mx-auto ${badge.bgClass} rounded-3xl flex items-center justify-center ${badge.textClass} shadow-md group-hover:scale-110 transition-transform`}>
                          {badge.icon}
                        </div>
                      </div>

                      <div>
                        <span className="font-black text-base text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-amber-300 transition-colors">
                          {badge.title}
                        </span>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {badge.description}
                        </p>
                      </div>

                      {(() => {
                        const ownerInfo = getBadgeOwnershipInfo(badge.id, users);
                        return (
                          <div className="w-full pt-3 border-t border-white/10 flex flex-col gap-1.5 items-center justify-center">
                            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              <span>{ownerInfo.count} Oyuncu Sahip (%{ownerInfo.percentage})</span>
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/80">
                              ⭐ VİTRİNE SABİTLENDİ
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div
                      key={`podium-empty-${slotIdx}`}
                      onClick={() => {
                        if (isOwnProfile) {
                          setSelectedShowcaseIds(activeFeaturedIds);
                          setShowBadgeShowcaseModal(true);
                        }
                      }}
                      className={`rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-50/50 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[190px] transition-all ${
                        isOwnProfile
                          ? 'cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5'
                          : 'opacity-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-500">
                        <PlusCircle className="w-6 h-6 text-amber-500/60" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-gray-500 dark:text-gray-300 block">
                          {isOwnProfile ? 'Vitrini Doldur' : `Boş Vitrin #${slotIdx + 1}`}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {isOwnProfile ? '+ Rozet seçmek için tıkla' : 'Oyuncu henüz rozet eklemedi'}
                        </span>
                        <CommentDrawer isOpen={!!activeCommentPostId} onClose={() => setActiveCommentPostId(null)} postId={activeCommentPostId || ""} />
      </div>
    </div>
  );
})}
              </div>
            </div>
            )}
            
            {/* ROW 1: 4 Key Performance Metric Cards + 4 New Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Double Puanı</span>
                  <div className="w-8 h-8 rounded-xl bg-pb-blue/10 text-pb-blue flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">{analytics?.doublePoints?.toFixed(3) || "2.500"}</span>
                  <span className="text-xs font-bold text-pb-green block mt-1">Çift Erkekler & Çift Kadınlar Puanı</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Mix Puanı</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">{analytics?.mixPoints?.toFixed(3) || "2.500"}</span>
                  <span className="text-xs font-bold text-purple-400 block mt-1">Karma Çiftler Puanı</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Galibiyet Oranı</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">%{winRatePercentage}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mt-1">{totalWinsCount} Galibiyet / {history.length} Maç</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Form & Ateş Serisi</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">{formTrend.length > 0 ? (formTrend[formTrend.length - 1] === "W" ? "🔥 Ateşte" : "⚡ Dengeli") : "Bekleniyor"}</span>
                  <span className="text-xs font-bold text-orange-500 block mt-1">Son Maç: {formTrend.length > 0 ? (formTrend[formTrend.length - 1] === "W" ? "Galibiyet" : "Mağlubiyet") : "Yok"}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Ortalama Partner</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">{analytics?.avgPartnerRating ? analytics.avgPartnerRating.toFixed(3) : "2.500"}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mt-1">Eşli Maçlardaki Partner Ort.</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Ortalama Rakip</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">{analytics?.avgOpponentRating ? analytics.avgOpponentRating.toFixed(3) : "2.500"}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mt-1">Tüm Maçlardaki Rakip Ort.</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Galibiyet Farkı</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">+{analytics?.avgWinDiff?.toFixed(1) || "0"}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mt-1">Ortalama Kazanılan Sayı Farkı</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Mağlubiyet Farkı</span>
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white block">-{analytics?.avgLossDiff?.toFixed(1) || "0"}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mt-1">Ortalama Kaybedilen Sayı Farkı</span>
                </div>
              </div>
            </div>

            {/* ROW 2: Balanced Widescreen Grid (8 cols Left / 4 cols Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 cols): Akıllı İstatistikler & AI Analizler */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-pb-blue" />
                        <span>AI Koç & Akıllı İstatistikler</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oyuncunun resmi maç verilerine dayalı oyun stili ve performans analizi</p>
                    </div>
                  </div>

                  {analytics ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-pb-blue">
                          <Users className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">En Uyumlu Partner</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">{analytics.bestPartner.name}</div>
                        <div className="text-xs font-bold text-pb-green mt-1">%{analytics.bestPartner.rate} Kazanma Oranı</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-red-500">
                          <Target className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">En Zorlu Rakip</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">{analytics.toughestOpp.name}</div>
                        <div className="text-xs font-bold text-red-500 mt-1">{analytics.toughestOpp.text}</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-amber-500">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Kusursuz Galibiyet</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">{analytics.flawlessWins} Maç</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Rakibe sayı vermeden zafer</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-orange-500">
                          <Activity className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Uzatma Başarısı</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">%{analytics.overtimeRate}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Kritik anlarda soğukkanlı</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-purple-500">
                          <Zap className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Çekişmeli Maç Oranı</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">%{analytics.surpriseRate}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Kafa kafaya giden mücadeleler</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 mb-1.5 text-pb-blue">
                          <Activity className="w-4 h-4" />
                          <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Oyun Formatı</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-base">Tekli %{analytics.singlesRate} / Eşli %{analytics.doublesRate}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Format başarı dağılımı</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200/60 dark:border-slate-800 text-center flex flex-col items-center">
                      <Activity className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <h4 className="font-bold text-slate-800 dark:text-white">Akıllı Analizler İçin Maç Verisi Bekleniyor</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maç kaydettikçe AI analitik raporunuz burada oluşturulacaktır.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (4 cols): Form Trend & Equipment */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Form Trend Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pb-blue" />
                    <span>Son 10 Maçlık Form Durumu</span>
                  </h3>
                  {formTrend.length > 0 ? (
                    <div className="flex items-center justify-between gap-1.5">
                      {formTrend.map((res, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                          <div className={`w-full h-11 rounded-xl transition-all duration-300 ${
                            res === "W" ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-red-400/80'
                          }`}></div>
                          <span className={`text-[11px] font-black ${
                            res === "W" ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                          }`}>{res}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs font-medium">Henüz form grafiği verisi bulunmuyor.</div>
                  )}
                </div>

                {/* Equipment & Court Preferences */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Ekipman & Kort Tercihi</span>
                  </h3>

                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Kullandığı Raket</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{userState.paddle || "Belirtilmemiş"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <div className="w-11 h-11 rounded-2xl bg-pb-blue/15 text-pb-blue flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Favori Kort</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{userState.favoriteCourt || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Control Panel (Visible only to Admin) */}
                {currentUser?.role === 'admin' && (
                  <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white rounded-3xl p-6 shadow-lg border border-emerald-500/40 flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-black text-sm text-amber-300">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Admin Denetim Paneli</span>
                    </div>
                    <p className="text-xs text-emerald-100">Bu kullanıcının yetkisini, puanlarını veya hesap durumunu yönetin.</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        onClick={() => adminUpdateUserRole(userState.id, userState.role === 'admin' ? 'user' : 'admin')}
                        className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold"
                      >
                        Rol Değiştir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 2: TROPHY ROOM (WIDESCREEN GAMING TROPHY SHOWCASE)
           ======================================================== */}
        {activeTab === "trophies" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-8">
            {/* Top Progress Bar Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-black shrink-0">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Oyuncu Rozet & Başarım Koleksiyonu
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Kazanılan {unlockedBadges.length} / {allEarnableBadges.length} Rozet (Toplam %{Math.round((unlockedBadges.length / allEarnableBadges.length) * 100)} Tamamlandı)
                  </p>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => {
                    setSelectedShowcaseIds(activeFeaturedIds);
                    setShowBadgeShowcaseModal(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Profil Vitrinini Özelleştir (3 Seç)</span>
                </button>
              )}
            </div>

            {/* SECTION 1: UNLOCKED BADGES GRID (4 COLUMNS WIDE) */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5" />
                <span>KAZANILAN ROZETLER ({unlockedBadges.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {unlockedBadges.map((badge) => {
                  const isFeatured = activeFeaturedIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className="relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between gap-4 group hover:-translate-y-1"
                    >
                      {isFeatured && (
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                          ⭐ Vitrinde
                        </span>
                      )}

                      <div className="flex items-center gap-3.5">
                        <div className={`w-14 h-14 ${badge.bgClass} rounded-2xl flex items-center justify-center ${badge.textClass} shrink-0 shadow-sm`}>
                          {badge.icon}
                        </div>
                        <div>
                          <span className="font-black text-base text-slate-900 dark:text-white block">{badge.title}</span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">ROZET & BAŞARIM</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {badge.description}
                      </p>

                      {(() => {
                        const ownerInfo = getBadgeOwnershipInfo(badge.id, users);
                        return (
                          <div className="w-full pt-3 mt-1 border-t border-gray-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-pb-blue" />
                              <span>{ownerInfo.count} Oyuncu Sahip</span>
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">
                              %{ownerInfo.percentage} ({ownerInfo.label})
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: LOCKED BADGES GRID (HOW TO EARN) */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>NASIL KAZANILIR? ({lockedBadges.length} Kilitli Rozet)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-5 rounded-3xl bg-gray-50/70 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-800 opacity-80 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-gray-400 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300 block">{badge.title}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">KİLİTLİ ROZET</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {badge.description}
                    </p>

                    {(() => {
                      const ownerInfo = getBadgeOwnershipInfo(badge.id, users);
                      return (
                        <div className="w-full pt-3 mt-1 border-t border-gray-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>{ownerInfo.count} Oyuncu Sahip</span>
                          </span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">
                            %{ownerInfo.percentage} ({ownerInfo.label})
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: MATCH HISTORY (WIDESCREEN LOG & FILTERS)
           ======================================================== */}
        {activeTab === "matches" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">Maç Geçmişi & Skorlar</h3>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "all", label: "Tümü" },
                  { id: "singles", label: "Tekli (1v1)" },
                  { id: "doubles", label: "Eşli (2v2)" },
                  { id: "wins", label: "Galibiyetler" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMatchFilter(f.id as any)}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                      matchFilter === f.id
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match, idx) => (
                  <MatchCardItem
                    key={`${match.id}-${idx}`}
                    match={match}
                    idx={idx}
                    userState={userState}
                    renderTeamWithElo={renderTeamWithElo}
                    currentUser={currentUser}
                    addMatchComment={addMatchComment}
                      users={users}
                      onOpenComments={setActiveCommentPostId}
                    />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 text-gray-400 font-medium">
                  Seçilen filtrede henüz kayıtlı maç bulunmuyor.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {followersModalTab && (
        <FollowersModal
          isOpen={Boolean(followersModalTab)}
          onClose={() => setFollowersModalTab(null)}
          initialTab={followersModalTab}
          targetUser={userState}
        />
      )}

      {isOwnProfile && (
        <PlayerQrModal
          isOpen={showQrCardModal}
          onClose={() => setShowQrCardModal(false)}
          user={userState}
        />
      )}

      {/* Badge Showcase Customizer Modal */}
      <AnimatePresence>
        {showBadgeShowcaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Profil Rozet Vitrinini Özelleştir</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">En sevdiğiniz 3 rozeti seçin, profilinizde gururla sergileyin.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBadgeShowcaseModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Showcase Top Preview */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-gray-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    ⭐ SEÇİLEN VİTRİN ROZETLERİ ({selectedShowcaseIds.length} / 3)
                  </span>
                  {selectedShowcaseIds.length === 3 && (
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Vitrin Dolu!</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(slotIdx => {
                    const selId = selectedShowcaseIds[slotIdx];
                    const badge = allEarnableBadges.find(b => b.id === selId);
                    return badge ? (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedShowcaseIds(prev => prev.filter(id => id !== badge.id))}
                        className="relative p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-500/60 shadow-sm flex flex-col items-center text-center justify-center gap-1.5 cursor-pointer hover:border-red-400 group"
                      >
                        <span className="absolute top-1.5 right-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-bold">Kaldır ✖</span>
                        <div className={`w-10 h-10 ${badge.bgClass} rounded-2xl flex items-center justify-center ${badge.textClass}`}>
                          {badge.icon}
                        </div>
                        <span className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">{badge.title}</span>
                      </div>
                    ) : (
                      <div
                        key={`modal-slot-${slotIdx}`}
                        className="p-3 rounded-2xl border-2 border-dashed border-amber-500/30 dark:border-amber-500/20 flex flex-col items-center justify-center gap-1 text-center min-h-[92px] text-gray-400"
                      >
                        <PlusCircle className="w-5 h-5 text-amber-500/40" />
                        <span className="text-[11px] font-bold text-amber-600/60 dark:text-amber-400/60">Boş Slot</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unlocked Badges Selection Grid */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                    SEÇİLEBİLİR ROZETLERİNİZ ({unlockedBadges.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unlockedBadges.map(badge => {
                      const isSelected = selectedShowcaseIds.includes(badge.id);
                      return (
                        <div
                          key={badge.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedShowcaseIds(prev => prev.filter(id => id !== badge.id));
                              setShowcaseError("");
                            } else {
                              if (selectedShowcaseIds.length >= 3) {
                                setShowcaseError("En fazla 3 rozet seçebilirsiniz! Önce birini çıkarmalısınız.");
                                return;
                              }
                              setSelectedShowcaseIds(prev => [...prev, badge.id]);
                              setShowcaseError("");
                            }
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 dark:border-amber-400 shadow-sm'
                              : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 hover:border-amber-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 pr-2">
                            <div className={`w-11 h-11 ${badge.bgClass} rounded-2xl flex items-center justify-center ${badge.textClass} shrink-0`}>
                              {badge.icon}
                            </div>
                            <div>
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white block line-clamp-1">{badge.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block line-clamp-1">{badge.description}</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950 font-black'
                              : 'border-gray-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <BadgeCheck className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Locked Badges Guide */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    NASIL KAZANILIR? ({lockedBadges.length} Kilitli Rozet)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lockedBadges.map(badge => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-100/70 dark:bg-slate-800/40 border border-gray-200/60 dark:border-slate-700/60 opacity-80"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-400 shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-gray-700 dark:text-gray-300 block">{badge.title}</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{badge.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {showcaseError && (
                <div className="px-6 py-2.5 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{showcaseError}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-800 shrink-0 bg-gray-50/50 dark:bg-slate-900/50">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {3 - selectedShowcaseIds.length} slot kaldı
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowBadgeShowcaseModal(false);
                      setShowcaseError("");
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      updateUser(userState.id, { featuredBadges: selectedShowcaseIds });
                      setShowBadgeShowcaseModal(false);
                      setShowcaseError("");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-slate-950 font-black text-sm shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    💾 Vitrini Kaydet ({selectedShowcaseIds.length}/3)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 4: POSTS (USER'S OWN POSTS)
           ======================================================== */}
        {activeTab === "posts" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
              {(userState.showPostsOnProfile !== false || isOwnProfile) ? (
                <Feed filterUserId={userState.id} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Gönderiler Gizli</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Bu kullanıcı gönderilerini profilinde sergilememeyi tercih ediyor.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAG EDITOR MODAL (OYUN STİLİ & KARAKTER ETİKETLERİNİ DÜZENLE) */}
        {isEditingTags && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      🏷️ Oyun Stili & Karakter Etiketlerini Düzenle
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Profilinizde sergilenmesini istediğiniz en fazla 3 etiketi seçin. ({tags.length}/3)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingTags(false)}
                  className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-slate-900 dark:hover:text-white"
                >
                  ✖
                </button>
              </div>

              {/* Tag Categories Content */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                {tagError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold">
                    ⚠️ {tagError}
                  </div>
                )}

                {Object.entries(TAG_CATEGORIES).map(([catName, catTags]) => (
                  <div key={catName}>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2.5">
                      {catName}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {catTags.map((tag) => {
                        const isSel = tags.includes(tag);
                        const requiredLevel = TAG_LEVEL_REQUIREMENTS[tag] || 1;
                        const userLevel = userState.level || 1;
                        const isLocked = userLevel < requiredLevel;

                        const getTagColors = (lvl: number, sel: boolean, locked: boolean) => {
                          if (locked) return 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed opacity-80';
                          if (!sel) {
                            if (lvl >= 50) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20';
                            if (lvl >= 35) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/50 hover:bg-purple-500/20';
                            if (lvl >= 25) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50 hover:bg-blue-500/20';
                            if (lvl >= 15) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/50 hover:bg-orange-500/20';
                            if (lvl >= 10) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20';
                            if (lvl >= 5) return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 hover:border-slate-400';
                            return 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-emerald-500/50';
                          }
                          // Selected
                          if (lvl >= 50) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white border-yellow-400 shadow-lg shadow-yellow-500/40 animate-pulse hover:bg-red-500 hover:bg-none hover:border-red-500';
                          if (lvl >= 35) return 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-purple-400 shadow-md hover:bg-red-500 hover:bg-none hover:border-red-500';
                          if (lvl >= 25) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-md hover:bg-red-500 hover:bg-none hover:border-red-500';
                          if (lvl >= 15) return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md hover:bg-red-500 hover:bg-none hover:border-red-500';
                          if (lvl >= 10) return 'bg-emerald-600 text-white border-emerald-400 shadow-md hover:bg-red-500 hover:border-red-500';
                          if (lvl >= 5) return 'bg-slate-700 text-white border-slate-500 shadow-md hover:bg-red-500 hover:border-red-500';
                          return 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105 hover:bg-red-500 hover:border-red-500';
                        };

                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              if (isLocked) {
                                setTagError(`"${tag}" etiketini kullanabilmek için Seviye ${requiredLevel} olmalısınız.`);
                                return;
                              }
                              handleToggleTag(tag);
                            }}
                            disabled={isLocked}
                            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all border group relative cursor-pointer ${getTagColors(requiredLevel, isSel, isLocked)}`}
                          >
                            {isLocked ? (
                              <span className="flex items-center gap-1.5" title={`Seviye ${requiredLevel} Gerekli`}>
                                <Lock className="w-3 h-3 text-gray-400" />
                                {tag}
                              </span>
                            ) : isSel ? (
                              <span className="flex items-center gap-1">
                                <span className="group-hover:hidden">✓</span>
                                <span className="hidden group-hover:inline">✖</span>
                                {tag}
                              </span>
                            ) : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500">
                    Seçilen Etiket Sayısı: <strong className="text-emerald-600 dark:text-emerald-400">{tags.length}/3</strong>
                  </span>
                  {tags.length > 0 && (
                    <button onClick={() => { setTags([]); setTagError(""); }} className="text-[11px] font-bold text-red-500 hover:text-red-600 underline">
                      Tümünü Temizle
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setTags(userState.tags);
                      setIsEditingTags(false);
                      setTagError("");
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveTags}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                  >
                    💾 Etiketleri Kaydet ({tags.length}/3)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
