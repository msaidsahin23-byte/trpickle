"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { ACHIEVEMENTS } from "@/data/achievements";
import { SEASON_1_QUESTS, getWeeklyQuestsForCurrentWeek, getTimeUntilNextMonday, QuestItem } from "@/data/quests";
import {
  GraduationCap, Swords, UserCheck, Flame, Trophy, Lock, Moon, Award, Medal,
  User, Users, Sunrise, Calendar, Gift, Sparkles, CheckCircle2, Target, Clock, Zap, Star, ShieldCheck, ArrowRight,
  MapPin, QrCode, Heart, Bookmark, Compass, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const iconMap: Record<string, any> = {
  GraduationCap,
  Swords,
  UserCheck,
  Flame,
  Trophy,
  Moon,
  Award,
  Medal,
  User,
  Users,
  Sunrise,
  Calendar,
  Target,
  Sparkles,
  MapPin,
  QrCode,
  Heart,
  Bookmark,
  Compass,
  Zap,
  CheckCircle2,
  TrendingUp,
  Gift,
};

function computeQuestProgress(quest: any, storeState: any) {
  const user = storeState.currentUser;
  if (!user) {
    return {
      current: 0,
      max: 1,
      isCompleted: false,
      actionText: "Giriş Yap ->",
      targetHref: "/auth",
      label: "0 / 1 Görev",
    };
  }

  const userMatches = (storeState.matches || []).filter((m: any) =>
    (!m.status || m.status === 'approved') && (m.team1?.includes(user.id) || m.team2?.includes(user.id))
  );

  let current = 0;
  let max = 1;
  let actionText = "Maç Ekle ->";
  let targetHref = "/add-match";

  switch (quest.category) {
    case "match":
      if (quest.id === "wq-match-3") {
        current = userMatches.some((m: any) => m.matchFormat === "doubles") ? 1 : 0;
      } else if (quest.id === "wq-match-8") {
        current = userMatches.some((m: any) => m.matchFormat === "singles") ? 1 : 0;
      } else if (quest.id === "wq-match-7") {
        current = userMatches.length >= 2 ? 1 : 0;
      } else {
        current = userMatches.length >= 1 ? 1 : 0;
      }
      actionText = "Maç Skoru Ekle ->";
      targetHref = "/add-match";
      break;

    case "academy":
      current = (user.completedVideoIds?.length || 0) >= 1 ? 1 : 0;
      actionText = "Akademi Dersi İzle ->";
      targetHref = "/academy";
      break;

    case "court":
      const hasFav = Boolean(user.favoriteCourt);
      const hasCheckIn = (storeState.courts || []).some((c: any) =>
        c.checkedInUsers?.some((u: any) => u.id === user.id)
      );
      current = (hasFav || hasCheckIn) ? 1 : 0;
      actionText = "Kortları İncele ->";
      targetHref = "/courts";
      break;

    case "social":
      const hasProfile = Boolean(user.bio);
      const hasPost = (storeState.posts || []).some(
        (p: any) => p.authorId === user.id || p.likedBy?.includes(user.name)
      );
      current = (hasProfile || hasPost) ? 1 : 0;
      actionText = "Topluluk Akışı ->";
      targetHref = "/feed";
      break;

    case "partner":
      const hasFollow = (user.following?.length || 0) >= 1;
      const hasPartnerMatch = userMatches.some((m: any) => m.matchFormat === "doubles");
      current = (hasFollow || hasPartnerMatch) ? 1 : 0;
      actionText = "Partner Bul ->";
      targetHref = "/partners";
      break;

    case "leaderboard":
      const hasRating = userMatches.length > 0;
      current = hasRating ? 1 : 0;
      actionText = "Sıralama Tablosu ->";
      targetHref = "/leaderboard";
      break;
  }

  const isCompleted = current >= max;
  const label = isCompleted ? `${max} / ${max} Görev Tamamlandı!` : `${current} / ${max} Görev`;

  return {
    current,
    max,
    isCompleted,
    actionText,
    targetHref,
    label,
  };
}

function QuestCard({
  quest,
  isClaimed,
  isFxActive,
  storeState,
  handleClaimQuest,
  variant = "weekly",
}: {
  quest: any;
  isClaimed: boolean;
  isFxActive: boolean;
  storeState: any;
  handleClaimQuest: (id: string, xp: number, title: string) => void;
  variant?: "weekly" | "season1";
}) {
  const router = useRouter();
  const IconComp = iconMap[quest.iconName] || Trophy;
  const progress = computeQuestProgress(quest, storeState);

  const activeGradientBtn =
    variant === "weekly"
      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/25"
      : "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-slate-950 shadow-amber-500/25";

  return (
    <motion.div
      whileHover={{ scale: isClaimed ? 1 : 1.02 }}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
        isClaimed
          ? "bg-slate-100/70 dark:bg-slate-900/40 border border-gray-300 dark:border-slate-800 opacity-65 grayscale-[35%] hover:opacity-90 shadow-none"
          : progress.isCompleted
          ? "bg-white dark:bg-slate-800 border-2 border-emerald-500 shadow-xl shadow-emerald-500/15"
          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:border-gray-300 dark:hover:border-slate-600"
      }`}
    >
      {/* Status Ribbon / Badge in Top Right */}
      {isClaimed ? (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 select-none">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tamamlandı</span>
        </div>
      ) : progress.isCompleted ? (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md animate-bounce">
          <Sparkles className="w-3 h-3" />
          <span>ÖDÜL HAZIR! 🎉</span>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 border border-gray-200 dark:border-slate-600">
          <span>{progress.label}</span>
        </div>
      )}

      {/* Confetti Glow when claimed */}
      {isFxActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-emerald-400/20 backdrop-blur-[1px] z-20 pointer-events-none flex items-center justify-center"
        >
          <Sparkles className="w-20 h-20 text-amber-400 animate-spin" />
        </motion.div>
      )}

      <div className="flex items-start justify-between gap-4 mb-5 pr-28">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${quest.gradient} text-white flex items-center justify-center shadow-lg shrink-0 ${
              isClaimed ? "opacity-80" : ""
            }`}
          >
            <IconComp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ★ {quest.badge}
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {quest.title}
            </h3>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-6 leading-relaxed">
        {quest.subtitle}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isClaimed
                ? "bg-gray-400"
                : progress.isCompleted
                ? "bg-emerald-500 animate-pulse"
                : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {isClaimed
              ? "1 / 1 Tamamlandı"
              : progress.isCompleted
              ? "1 / 1 Görev Tamamlandı!"
              : progress.label}
          </span>
        </div>

        {isClaimed ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-extrabold text-xs border border-gray-300 dark:border-slate-700 select-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Ödül Toplandı</span>
          </div>
        ) : progress.isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleClaimQuest(quest.id, quest.xpReward, quest.title)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer ${activeGradientBtn}`}
          >
            <Gift className="w-4 h-4" />
            <span>🎁 Ödülü Al (+{quest.xpReward} XP)</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.push(progress.targetHref)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-600 transition-all cursor-pointer"
          >
            <span>🔒 {progress.actionText}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const storeState = useStore();
  const currentUser = storeState.currentUser;
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly" | "season1" | "achievements">("weekly");
  const [claimedFxId, setClaimedFxId] = useState<string | null>(null);
  const [showMegaCelebration, setShowMegaCelebration] = useState(false);
  const [showSeason1Celebration, setShowSeason1Celebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextMonday());
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (mounted && !currentUser) {
      router.push("/auth");
    }
  }, [currentUser, mounted, router]);

  // Live timer tick every second until next Monday 00:00
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextMonday());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !currentUser) return null;

  const level = currentUser.level || 1;
  const xp = currentUser.xp || 0;
  const unlocked = currentUser.unlockedAchievements || [];
  const claimedQuests = currentUser.claimedWeeklyQuests || [];

  const xpProgress = xp % 100;

  // 1) 4 Deterministic Weekly Quests (Selected from 40-quest pool)
  const weeklyQuests = getWeeklyQuestsForCurrentWeek();
  const claimedWeeklyCount = weeklyQuests.filter(q => claimedQuests.includes(q.id)).length;
  const isWeeklyMegaUnlocked = claimedWeeklyCount === weeklyQuests.length;
  const isWeeklyMegaClaimed = claimedQuests.includes("weekly-mega-chest");

  // 2) 6 Season 1 Special Quests
  const season1Quests = SEASON_1_QUESTS;
  const claimedSeason1Count = season1Quests.filter(q => claimedQuests.includes(q.id)).length;
  const isSeason1MegaUnlocked = claimedSeason1Count === season1Quests.length;
  const isSeason1MegaClaimed = claimedQuests.includes("season1-mega-chest");

  const handleClaimQuest = (questId: string, xpReward: number, title: string) => {
    if (claimedQuests.includes(questId)) return;
    setClaimedFxId(questId);
    storeState.claimWeeklyQuestReward(questId, xpReward, title);
    toast.success(`🎉 +${xpReward} XP KAZANDIN! (${title})`, {
      style: {
        borderRadius: '16px',
        background: '#10b981',
        color: '#fff',
        fontWeight: 'bold',
      },
      icon: '🎁',
    });
    setTimeout(() => setClaimedFxId(null), 1800);
  };

  const handleClaimMegaChest = () => {
    if (!isWeeklyMegaUnlocked || isWeeklyMegaClaimed) return;
    setShowMegaCelebration(true);
    setClaimedFxId("weekly-mega-chest");
    storeState.claimWeeklyQuestReward("weekly-mega-chest", 300, "HAFTALIK MEGA ÖDÜL SANDIĞI");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header & Level Info */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl border border-blue-500/30 text-center relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>🔥 RESMÎ SEZON 1 BAŞLADI • KORTLARIN YÜKSELİŞİ</span>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-400 via-teal-400 to-pb-green rounded-3xl flex items-center justify-center border-4 border-white/20 shadow-2xl mb-4 rotate-3 hover:rotate-0 transition-transform duration-300"
          >
            <span className="text-4xl sm:text-5xl font-black text-slate-950 drop-shadow-sm">{level}</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            Seviye {level} Oyuncu
          </h1>
          <p className="text-blue-200/80 font-semibold mb-6 max-w-lg">
            Sezon 1 görevlerini ve haftalık rotasyonu tamamla, XP topla ve Türkiye sıralamasında zirveye tırman!
          </p>

          <div className="w-full max-w-md bg-slate-800/90 rounded-full h-5 p-1 overflow-hidden border border-slate-700 shadow-inner relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 h-full rounded-full shadow-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-black text-white drop-shadow">
                {`${xpProgress} / 100 XP (${100 - xpProgress} XP Kaldı)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher (3 Tabs) */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === "weekly"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>🔥 Haftalık Görevler</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px] font-black">
              {claimedWeeklyCount}/4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("season1")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === "season1"
                ? "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>👑 Sezon 1 Görevleri</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px] font-black">
              {claimedSeason1Count}/6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === "achievements"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🏆 Kalıcı Başarımlar</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px] font-black">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: WEEKLY QUESTS & STREAK HUB */}
      {activeTab === "weekly" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* VIP Weekly Countdown Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-500/30 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Haftalık Rotasyon Havuzu (40 Görev Arasından Seçilen 4 Görev)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Görevleri tamamlayarak anında XP kazan ve haftalık Mega Sandığı aç!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Yenilenmeye (Pzt 00:00):</span>
              <span className="text-xs font-black text-emerald-600 dark:text-lime-400 tracking-wide">
                {timeLeft.formattedText}
              </span>
            </div>
          </div>

          {/* 4 Weekly Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isClaimed={claimedQuests.includes(quest.id)}
                isFxActive={claimedFxId === quest.id}
                storeState={storeState}
                handleClaimQuest={handleClaimQuest}
                variant="weekly"
              />
            ))}
          </div>

          {/* Mega Weekly Chest Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-purple-500/15 border-2 border-amber-500/40 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-xl shrink-0">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      👑 HAFTALIK MEGA ÖDÜL SANDIĞI
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Tüm Haftalık Görevleri Tamamla (+300 EXTRA XP)
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                    4 haftalık görevi de tamamlayıp haftanın Mega Sandığını ve +300 ekstra XP ödülünü kazan!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
                <div className="text-center sm:text-right">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">İlerleme Durumu</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {claimedWeeklyCount} / 4 Görev
                  </span>
                </div>

                {isWeeklyMegaClaimed ? (
                  <div className="px-6 py-3.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-sm border border-amber-500/40 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>👑 MEGA ÖDÜL ALINDI</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={isWeeklyMegaUnlocked ? { scale: 1.05 } : {}}
                    whileTap={isWeeklyMegaUnlocked ? { scale: 0.95 } : {}}
                    type="button"
                    disabled={!isWeeklyMegaUnlocked}
                    onClick={handleClaimMegaChest}
                    className={`px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-all ${
                      isWeeklyMegaUnlocked
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 hover:shadow-amber-500/30 cursor-pointer"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-slate-700"
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span>{isWeeklyMegaUnlocked ? "👑 MEGA SANDIĞI AÇ (+300 XP)" : "4 Görevi Tamamla"}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: SEASON 1 SPECIAL QUESTS (6 Efsanevi Görev) */}
      {activeTab === "season1" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Season 1 Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 border-2 border-amber-500/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    RESMÎ SEZON 1 • ÖZEL GÖREVLER
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  Sezon 1: Kortların Yükselişi (6 Özel Görev)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                  Sezon 2 açılana kadar bu 6 özel görevi tamamla, +1600 Toplam XP kazan ve Sezon 1 Efsanesi rozetini aç!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs border border-amber-500/40">
              <span>👑 Sezon 1 Aktif</span>
            </div>
          </div>

          {/* 6 Season 1 Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {season1Quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isClaimed={claimedQuests.includes(quest.id)}
                isFxActive={claimedFxId === quest.id}
                storeState={storeState}
                handleClaimQuest={handleClaimQuest}
                variant="season1"
              />
            ))}
          </div>

          {/* Season 1 Grandmaster Chest Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-amber-500/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-xl shrink-0">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      👑 SEZON 1 ÖZEL ŞAMPİYON SANDIĞI
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Sezon 1 Tüm Görevlerini Tamamla (+1000 EXTRA XP & ŞAMPİYON ROZETİ)
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                    6 özel sezon görevini de tamamla, profilindeki Rozetler kısmına kalıcı "Sezon 1 Şampiyonu" rozetini ekle ve +1000 XP kazan!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
                <div className="text-center sm:text-right">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">İlerleme Durumu</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {claimedSeason1Count} / 6 Görev
                  </span>
                </div>

                {isSeason1MegaClaimed ? (
                  <div className="px-6 py-3.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-sm border border-amber-500/40 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>👑 SEZON 1 ÖDÜLÜ ALINDI</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={isSeason1MegaUnlocked ? { scale: 1.05 } : {}}
                    whileTap={isSeason1MegaUnlocked ? { scale: 0.95 } : {}}
                    type="button"
                    disabled={!isSeason1MegaUnlocked}
                    onClick={() => {
                      if (!isSeason1MegaUnlocked) return;
                      storeState.claimWeeklyQuestReward("season1-mega-chest", 1000, "👑 SEZON 1 ŞAMPİYONU ROZETİ");
                      setShowSeason1Celebration(true);
                    }}
                    className={`px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-all ${
                      isSeason1MegaUnlocked
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 hover:shadow-amber-500/30 cursor-pointer"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-slate-700"
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span>{isSeason1MegaUnlocked ? "👑 SEZON 1 SANDIĞINI AÇ (+1000 XP)" : "6 Görevi Tamamla"}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: PERMANENT ACHIEVEMENTS GRID */}
      {activeTab === "achievements" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Kalıcı Başarımlar & Rozetler
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Platformda oynadıkça kalıcı olarak kazandığın kupa ve başarımlar.
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-lime-400 border border-emerald-500/30">
              {unlocked.length} / {ACHIEVEMENTS.length} Açıldı
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map(achievement => {
              const isUnlocked = unlocked.includes(achievement.id);
              const IconComponent = iconMap[achievement.iconName] || Trophy;

              return (
                <motion.div 
                  key={achievement.id}
                  whileHover={{ y: -5 }}
                  className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all duration-300 ${
                    isUnlocked 
                      ? "bg-white dark:bg-slate-800 border-emerald-500/50 shadow-lg" 
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-100 dark:border-slate-700 opacity-65 grayscale hover:grayscale-0"
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${
                    isUnlocked ? "bg-emerald-500 text-slate-950" : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500"
                  }`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  
                  <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4 leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700/80">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      isUnlocked ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      +{achievement.xpReward} XP
                    </div>
                    
                    {!isUnlocked && achievement.calculateProgress && (
                      (() => {
                        const { current, max } = achievement.calculateProgress(storeState);
                        const progressPercent = Math.min(100, Math.round((current / max) * 100));
                        return (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{current} / {max}</span>
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* JAW-DROPPING MEGA CHEST CELEBRATION MODAL */}
      <AnimatePresence>
        {showMegaCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl"
          >
            {/* Spinning Golden Light Rays Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20 blur-3xl opacity-75"
              />
            </div>

            {/* Floating Sparkles & Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute w-full max-w-2xl h-full flex items-center justify-around opacity-60"
              >
                <Sparkles className="w-12 h-12 text-amber-400 -translate-y-36 translate-x-28" />
                <Flame className="w-10 h-10 text-orange-400 translate-y-36 -translate-x-32" />
                <Trophy className="w-14 h-14 text-yellow-300 -translate-y-28 -translate-x-36" />
              </motion.div>
            </div>

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.5, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="relative z-10 max-w-md w-full rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/70 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_100px_rgba(245,158,11,0.5)] p-8 text-center overflow-hidden"
            >
              {/* Top Golden Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-extrabold text-xs tracking-wider uppercase mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>SEZON 3 • EFSANEVİ BAŞARIM</span>
              </div>

              {/* Huge Golden Chest Trophy Centerpiece */}
              <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 flex items-center justify-center shadow-2xl shadow-amber-500/50 border-4 border-white/40 mb-6"
              >
                <Trophy className="w-16 h-16 text-slate-950" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                MEGA SANDIK AÇILDI!
              </h2>

              <p className="text-amber-200/90 text-sm font-semibold mb-6">
                4 haftalık görevi de kusursuzca tamamladın ve haftanın Grandmaster sandığını fethettin!
              </p>

              {/* Reward Pills */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-2xl font-black text-amber-400">+300 XP</span>
                  <span className="text-[11px] font-bold text-gray-300">Ekstra Sezon Puanı</span>
                </div>
                <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-2xl font-black text-yellow-300">👑</span>
                  <span className="text-[11px] font-bold text-gray-300">Hafta Şampiyonu</span>
                </div>
              </div>

              {/* Big Celebration Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMegaCelebration(false)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>EFSANE ÖDÜLÜ KUTLA & KAPAT</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JAW-DROPPING SEASON 1 GRANDMASTER CELEBRATION MODAL */}
      <AnimatePresence>
        {showSeason1Celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl"
          >
            {/* Spinning Golden Light Rays Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="w-[900px] h-[900px] rounded-full bg-gradient-to-r from-amber-500/25 via-transparent to-orange-500/25 blur-3xl opacity-85"
              />
            </div>

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.4, y: 60, rotateX: 25 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.9 }}
              className="relative z-10 max-w-lg w-full rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 border-2 border-amber-400 shadow-[0_0_120px_rgba(245,158,11,0.65)] p-8 sm:p-10 text-center overflow-hidden"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-extrabold text-xs tracking-wider uppercase mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>SEZON 1 • RESMÎ ŞAMPİYONLUK BAŞARIMI</span>
              </div>

              <motion.div
                animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 flex items-center justify-center shadow-2xl shadow-amber-500/60 border-4 border-white/50 mb-6"
              >
                <Trophy className="w-20 h-20 text-slate-950" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                SEZON 1 ŞAMPİYONU OLDUN!
              </h2>

              <p className="text-amber-200/90 text-sm font-semibold mb-8">
                Sezon 1&apos;in tüm özel görevlerini başarıyla tamamladın! Kalıcı &quot;Sezon 1 Şampiyonu&quot; rozeti profilindeki Rozetler bölümüne eklendi!
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-3xl font-black text-amber-400">+1000 XP</span>
                  <span className="text-xs font-bold text-gray-300">Devasa Sezon Ödülü</span>
                </div>
                <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-3xl font-black text-yellow-300">🏆</span>
                  <span className="text-xs font-bold text-gray-300">Sezon 1 Şampiyonu Rozeti</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSeason1Celebration(false)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>SEZON 1 ŞAMPİYONLUĞUNU KUTLA</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
