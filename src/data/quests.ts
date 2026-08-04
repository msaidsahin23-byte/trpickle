import {
  Swords,
  GraduationCap,
  Sparkles,
  Target,
  MapPin,
  Users,
  Trophy,
  Award,
  Flame,
  Heart,
  TrendingUp,
  Bookmark,
  UserCheck
} from "lucide-react";

export interface QuestItem {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  badge: string;
  category: "match" | "academy" | "court" | "social" | "partner" | "leaderboard";
  gradient: string;
  iconName: string;
}

/**
 * SEZON 1 ÖZEL GÖREVLERİ (6 Adet Efsanevi Sezon Görevi)
 */
export const SEASON_1_QUESTS: QuestItem[] = [
  {
    id: "s1-q1-first-blood",
    title: "Sezonun İlk Maçı",
    subtitle: "Maç skoru ekle modülünden ilk maçını sisteme kaydet.",
    xpReward: 250,
    badge: "Sezon 1 Öncüsü",
    category: "match",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    iconName: "Swords",
  },
  {
    id: "s1-q2-court-explorer",
    title: "Kort Fatihi",
    subtitle: "Kortlar sayfasına giderek bir korta check-in yap veya favorilerine ekle.",
    xpReward: 200,
    badge: "Harita Fatihi",
    category: "court",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    iconName: "MapPin",
  },
  {
    id: "s1-q3-academy-master",
    title: "Akademi Mezunu",
    subtitle: "Pickleball Akademi sayfasındaki eğitim videolarından en az birini tamamla.",
    xpReward: 300,
    badge: "Akademi Bilgesi",
    category: "academy",
    gradient: "from-blue-500 via-indigo-500 to-cyan-600",
    iconName: "GraduationCap",
  },
  {
    id: "s1-q4-partner-sync",
    title: "Ağını Genişlet",
    subtitle: "Sistemde en az 1 oyuncuyu takip et veya bir çiftler (2v2) maçına katıl.",
    xpReward: 250,
    badge: "Kort Ortağı",
    category: "partner",
    gradient: "from-purple-500 via-pink-500 to-fuchsia-600",
    iconName: "Users",
  },
  {
    id: "s1-q5-social-spark",
    title: "Topluluk Sesi",
    subtitle: "Profiline bir biyografi yaz veya akışta bir gönderi paylaş.",
    xpReward: 200,
    badge: "Topluluk Ateşi",
    category: "social",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    iconName: "Sparkles",
  },
  {
    id: "s1-q6-dupr-pioneer",
    title: "Sıralama Başlangıcı",
    subtitle: "Maç oynayarak reytingini hesaplat ve Türkiye Pickleball sıralamasına gir.",
    xpReward: 400,
    badge: "Grandmaster Adayı",
    category: "leaderboard",
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    iconName: "Trophy",
  },
];

/**
 * HAFTALIK GÖREV HAVUZU (Mantıklı ve takip edilebilir görevler)
 */
export const WEEKLY_QUEST_POOL: QuestItem[] = [
  // --- MAÇ & SKOR GÖREVLERİ ---
  {
    id: "wq-match-1",
    title: "Haftanın İlk Maçı",
    subtitle: "Bu hafta en az 1 maç oyna ve skorunu sisteme kaydet.",
    xpReward: 150,
    badge: "Kort Savaşçısı",
    category: "match",
    gradient: "from-amber-500 to-orange-600",
    iconName: "Swords",
  },
  {
    id: "wq-match-3",
    title: "Çiftler Mücadelesi",
    subtitle: "Bir çiftler (2v2) maçı oyna ve skorunu sisteme kaydet.",
    xpReward: 150,
    badge: "Sinerji",
    category: "match",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Users",
  },
  {
    id: "wq-match-7",
    title: "Kort Bağımlısı",
    subtitle: "Bu hafta en az 2 farklı maç skorunu sisteme kaydet.",
    xpReward: 200,
    badge: "Maratoncu",
    category: "match",
    gradient: "from-rose-500 to-orange-500",
    iconName: "Flame",
  },
  {
    id: "wq-match-8",
    title: "Tekler Düellosu",
    subtitle: "1v1 tekler formatında bir maç oyna ve skorunu kaydet.",
    xpReward: 145,
    badge: "Tekler Ustası",
    category: "match",
    gradient: "from-cyan-500 to-blue-600",
    iconName: "Swords",
  },

  // --- AKADEMİ GÖREVLERİ ---
  {
    id: "wq-acad-1",
    title: "Sürekli Gelişim",
    subtitle: "Akademi sayfasından en az bir eğitim videosunu tamamla.",
    xpReward: 100,
    badge: "Öğrenci",
    category: "academy",
    gradient: "from-emerald-500 to-green-600",
    iconName: "GraduationCap",
  },

  // --- KORTLAR GÖREVLERİ ---
  {
    id: "wq-court-1",
    title: "Kort Radarı",
    subtitle: "Kortlar sayfasında bulunduğun korta Check-in yap veya bir kortu favorilerine ekle.",
    xpReward: 110,
    badge: "Lokal Oyuncu",
    category: "court",
    gradient: "from-emerald-500 to-teal-600",
    iconName: "MapPin",
  },

  // --- SOSYAL GÖREVLER ---
  {
    id: "wq-soc-1",
    title: "Profilini Canlandır",
    subtitle: "Kendi profiline bir biyografi ekle veya akışta bir post paylaş/beğen.",
    xpReward: 80,
    badge: "Sosyal Elçi",
    category: "social",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Sparkles",
  },

  // --- PARTNER GÖREVLERİ ---
  {
    id: "wq-part-1",
    title: "Yeni Bağlantılar",
    subtitle: "Sistemde en az 1 yeni kişiyi takip et veya bir çiftler maçına katıl.",
    xpReward: 110,
    badge: "Ağ Kurucu",
    category: "partner",
    gradient: "from-emerald-500 to-green-600",
    iconName: "UserCheck",
  },

  // --- LİDERLİK TABLOSU GÖREVLERİ ---
  {
    id: "wq-lead-1",
    title: "Sıralamada Yükseliş",
    subtitle: "En az 1 maç skoru girerek liderlik tablosundaki reytingini güncelle.",
    xpReward: 105,
    badge: "Rekabetçi",
    category: "leaderboard",
    gradient: "from-amber-500 to-yellow-600",
    iconName: "Trophy",
  },
];

export function getCurrentWeekSeed(): string {
  const now = new Date();
  const date = new Date(now.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${date.getFullYear()}-W${weekNumber}`;
}

export function getWeeklyQuestsForCurrentWeek(): QuestItem[] {
  const seedStr = getCurrentWeekSeed();
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const pool = [...WEEKLY_QUEST_POOL];
  const selected: QuestItem[] = [];

  for (let i = 0; i < 4; i++) {
    const idx = Math.abs(hash + i * 1337) % pool.length;
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return selected;
}

export function getTimeUntilNextMonday(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedText: string;
} {
  const now = new Date();
  const nextMonday = new Date(now);
  
  const currentDay = now.getDay();
  let daysUntilMonday = (1 + 7 - currentDay) % 7;
  if (daysUntilMonday === 0) {
    daysUntilMonday = 7;
  }

  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diffMs = Math.max(0, nextMonday.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedText = `${days} Gün ${hours} Saat ${minutes} Dk ${seconds} Sn`;

  return { days, hours, minutes, seconds, formattedText };
}
