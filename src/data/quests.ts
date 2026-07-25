import {
  Swords,
  GraduationCap,
  Sparkles,
  Target,
  MapPin,
  Users,
  Trophy,
  Award,
  QrCode,
  Flame,
  Heart,
  MessageSquare,
  Share2,
  Compass,
  Zap,
  CheckCircle2,
  Bookmark,
  ShieldAlert,
  UserCheck,
  TrendingUp,
} from "lucide-react";

export interface QuestItem {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  badge: string;
  category: "match" | "academy" | "court" | "social" | "partner" | "leaderboard";
  gradient: string;
  iconName: string; // We map icon names to icons in component
}

/**
 * SEZON 1 ÖZEL GÖREVLERİ (6 Adet Efsanevi Sezon Görevi)
 * Sezon 2 gelene kadar oyuncuların tamamlaması gereken özel kilometre taşları.
 */
export const SEASON_1_QUESTS: QuestItem[] = [
  {
    id: "s1-q1-first-blood",
    title: "İlk Kan & Kort Tozu",
    subtitle: "Maç skoru ekle modülünden resmî veya antrenman maçı kaydet ve sistemde ilk galibiyet/skorunu tescille.",
    xpReward: 250,
    badge: "Sezon 1 Öncüsü",
    category: "match",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    iconName: "Swords",
  },
  {
    id: "s1-q2-court-explorer",
    title: "Kort Kâşifi & Radar Üstü",
    subtitle: "Kortlar & Radar haritasında en az 3 farklı tenis/pickleball kortunu incele veya favori kortunu belirle.",
    xpReward: 200,
    badge: "Harita Fatihi",
    category: "court",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    iconName: "MapPin",
  },
  {
    id: "s1-q3-academy-master",
    title: "Pickleball Akademisyeni",
    subtitle: "Akademi masterclass bölümündeki Kitchen & Dink vuruş tekniklerini incele ve kuralları öğren.",
    xpReward: 300,
    badge: "Akademi Bilgesi",
    category: "academy",
    gradient: "from-blue-500 via-indigo-500 to-cyan-600",
    iconName: "GraduationCap",
  },
  {
    id: "s1-q4-partner-sync",
    title: "Çiftler Uyum Sahası",
    subtitle: "Partner bul modülünden oyuncuları filtrele veya QR kod sistemiyle profil ağını genişlet.",
    xpReward: 250,
    badge: "Kort Ortağı",
    category: "partner",
    gradient: "from-purple-500 via-pink-500 to-fuchsia-600",
    iconName: "Users",
  },
  {
    id: "s1-q5-social-spark",
    title: "Sosyal Kort Tribünü",
    subtitle: "Topluluk akışındaki maç skorlarını incele, etkileşim ver ve Türkiye Pickleball topluluğuna katıl.",
    xpReward: 200,
    badge: "Topluluk Ateşi",
    category: "social",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    iconName: "Sparkles",
  },
  {
    id: "s1-q6-dupr-pioneer",
    title: "TRPickle Rating Öncüsü",
    subtitle: "Sıralama tablosunu ziyaret et ve Türkiye geneli Rating yarışında yerini al.",
    xpReward: 400,
    badge: "Grandmaster Adayı",
    category: "leaderboard",
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    iconName: "Trophy",
  },
];

/**
 * 40 GÖREVLİK HAFTALIK GÖREV HAVUZU
 * Her Pazartesi saat 00:00'da bu havuzdan deterministik olarak 4 görev seçilir.
 */
export const WEEKLY_QUEST_POOL: QuestItem[] = [
  // --- MAÇ & SKOR GÖREVLERİ (10 Adet) ---
  {
    id: "wq-match-1",
    title: "Haftanın İlk Servisi",
    subtitle: "Bu hafta en az 1 resmî veya antrenman maçı oyna ve skorunu sisteme kaydet.",
    xpReward: 150,
    badge: "Kort Savaşçısı",
    category: "match",
    gradient: "from-amber-500 to-orange-600",
    iconName: "Swords",
  },
  {
    id: "wq-match-2",
    title: "Mutfak Hattı Defansı",
    subtitle: "Bu hafta oynadığın bir maçta Kitchen (NVZ) kuralına sadık kalarak harika bir mücadele çıkar.",
    xpReward: 125,
    badge: "Defans Ustası",
    category: "match",
    gradient: "from-emerald-500 to-teal-600",
    iconName: "Target",
  },
  {
    id: "wq-match-3",
    title: "Çiftler Mücadelesi",
    subtitle: "Bir çiftler (2v2) maçına katıl ve partnerinle birlikte kortta sinerji yakala.",
    xpReward: 150,
    badge: "Sinerji",
    category: "match",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Users",
  },
  {
    id: "wq-match-4",
    title: "Günün Şampiyonluk Sayısı",
    subtitle: "11 sayı üzerinden tamamlanan tam set bir maç oyna veya skor kaydı oluştur.",
    xpReward: 140,
    badge: "11 Sayı",
    category: "match",
    gradient: "from-purple-500 to-pink-600",
    iconName: "Trophy",
  },
  {
    id: "wq-match-5",
    title: "Hafta Sonu Maratonu",
    subtitle: "Hafta sonu veya hafta içi akşam saatlerinde bir maç kaydı oluştur.",
    xpReward: 160,
    badge: "Maratonçu",
    category: "match",
    gradient: "from-rose-500 to-orange-500",
    iconName: "Flame",
  },
  {
    id: "wq-match-6",
    title: "Fair-Play El Sıkışması",
    subtitle: "Maç sonunda rakibinle fair-play ruhunu yansıtan dostane bir maç skoru kaydet.",
    xpReward: 120,
    badge: "Fair-Play",
    category: "match",
    gradient: "from-teal-500 to-emerald-600",
    iconName: "Heart",
  },
  {
    id: "wq-match-7",
    title: "Rövanş Ateşi",
    subtitle: "Daha önce karşılaştığın bir oyuncuyla rövanş maçı yap veya antrenman skoru gir.",
    xpReward: 150,
    badge: "Rövanş",
    category: "match",
    gradient: "from-amber-600 to-red-600",
    iconName: "Zap",
  },
  {
    id: "wq-match-8",
    title: "Tekler Kort Düellosu",
    subtitle: "1v1 tekler formatında bir maç oyna ve kondisyonunu sına.",
    xpReward: 145,
    badge: "Tekler Ustası",
    category: "match",
    gradient: "from-cyan-500 to-blue-600",
    iconName: "Swords",
  },
  {
    id: "wq-rank-1",
    title: "Hızlı Rating Yükselişi",
    subtitle: "Maç kaydını tamamlayıp haftalık reyting ve performans puanını güncelle.",
    xpReward: 170,
    badge: "Performans",
    category: "match",
    gradient: "from-yellow-500 to-amber-600",
    iconName: "TrendingUp",
  },
  {
    id: "wq-match-10",
    title: "Kusursuz Set Hırsı",
    subtitle: "Maçlarında minimum hata ile odaklanmış bir performans sergile.",
    xpReward: 155,
    badge: "Odak",
    category: "match",
    gradient: "from-indigo-500 to-purple-600",
    iconName: "Award",
  },

  // --- AKADEMİ & EĞİTİM GÖREVLERİ (8 Adet) ---
  {
    id: "wq-acad-1",
    title: "Dink Vuruş Masterclass",
    subtitle: "Akademi sayfasında Dink ve file önü yumuşak vuruş taktiklerini incele.",
    xpReward: 100,
    badge: "Dink Taktikçisi",
    category: "academy",
    gradient: "from-emerald-500 to-green-600",
    iconName: "GraduationCap",
  },
  {
    id: "wq-acad-2",
    title: "Continental Grip Sırları",
    subtitle: "Raket tutuşu rehberini oku ve Continental Grip avantajlarını keşfet.",
    xpReward: 100,
    badge: "Teknik Bilgi",
    category: "academy",
    gradient: "from-blue-500 to-cyan-600",
    iconName: "GraduationCap",
  },
  {
    id: "wq-acad-3",
    title: "3. Vuruş Drop Stratejisi",
    subtitle: "Third Shot Drop (3. vuruş yumuşatma) taktik rehberini oku ve strateji geliştir.",
    xpReward: 110,
    badge: "Stratejist",
    category: "academy",
    gradient: "from-purple-500 to-indigo-600",
    iconName: "GraduationCap",
  },
  {
    id: "wq-acad-4",
    title: "Kitchen Kuralları Testi",
    subtitle: "Non-Volley Zone (Mutfak) kurallarını hatırla ve bilgi testi çöz.",
    xpReward: 125,
    badge: "Kural Bilgesi",
    category: "academy",
    gradient: "from-amber-500 to-yellow-600",
    iconName: "CheckCircle2",
  },
  {
    id: "wq-acad-5",
    title: "Haftalık Kural Tekrarı",
    subtitle: "Servis kuralları ve puanlama sistemi derslerini gözden geçir.",
    xpReward: 90,
    badge: "Kural Hâkimi",
    category: "academy",
    gradient: "from-teal-500 to-blue-600",
    iconName: "GraduationCap",
  },
  {
    id: "wq-acad-6",
    title: "Pozisyon Alma Sanatı",
    subtitle: "Kort üzerinde doğru duruş ve partnerle paralel hareket tekniklerini incele.",
    xpReward: 105,
    badge: "Pozisyon",
    category: "academy",
    gradient: "from-rose-500 to-pink-600",
    iconName: "Target",
  },
  {
    id: "wq-acad-7",
    title: "Lob & Overhead Smashing",
    subtitle: "Aşırtma vuruşlara karşı kafa üstü smaç ve savunma taktiklerine göz at.",
    xpReward: 115,
    badge: "Smaçör",
    category: "academy",
    gradient: "from-orange-500 to-red-600",
    iconName: "Zap",
  },
  {
    id: "wq-acad-8",
    title: "Hızlı Refleks Antrenmanı",
    subtitle: "File önünde hızlı vole düelloları için reaksiyon süresi önerilerini oku.",
    xpReward: 100,
    badge: "Refleks",
    category: "academy",
    gradient: "from-indigo-500 to-blue-600",
    iconName: "Zap",
  },

  // --- KORTLAR & HARİTA GÖREVLERİ (7 Adet) ---
  {
    id: "wq-court-1",
    title: "Yakın Kort Radarı",
    subtitle: "Kortlar & Radar sayfasına girip konumuna en yakın kortları incele.",
    xpReward: 110,
    badge: "Radar",
    category: "court",
    gradient: "from-emerald-500 to-teal-600",
    iconName: "MapPin",
  },
  {
    id: "wq-court-2",
    title: "Favori Kort Seçimi",
    subtitle: "Haritadaki kort detaylarını aç ve en sevdiğin oynama alanını belirle.",
    xpReward: 100,
    badge: "Ev Sahibi",
    category: "court",
    gradient: "from-amber-500 to-orange-600",
    iconName: "Bookmark",
  },
  {
    id: "wq-court-3",
    title: "Şehirlerarası Keşif",
    subtitle: "İstanbul, Ankara veya İzmir gibi farklı şehirlerdeki aktif kort sayısına göz at.",
    xpReward: 105,
    badge: "Kâşif",
    category: "court",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Compass",
  },
  {
    id: "wq-court-4",
    title: "Kort Zemin İncelemesi",
    subtitle: "Akrilik veya sert zeminli kortların özelliklerini harita kartlarından kontrol et.",
    xpReward: 95,
    badge: "Zemin Uzmanı",
    category: "court",
    gradient: "from-purple-500 to-pink-600",
    iconName: "MapPin",
  },
  {
    id: "wq-court-5",
    title: "Işıklandırma & Gece Maçı",
    subtitle: "Gece ışıklandırması olan kortları tespit et ve akşam maçı planla.",
    xpReward: 120,
    badge: "Gece Kuşu",
    category: "court",
    gradient: "from-slate-700 to-indigo-900",
    iconName: "Sparkles",
  },
  {
    id: "wq-court-6",
    title: "Açık / Kapalı Kort Filtresi",
    subtitle: "Hava durumuna göre açık veya kapalı kort seçeneklerini incele.",
    xpReward: 100,
    badge: "Planlayıcı",
    category: "court",
    gradient: "from-teal-500 to-emerald-600",
    iconName: "MapPin",
  },
  {
    id: "wq-court-7",
    title: "Kulüp & Tesis Ziyareti",
    subtitle: "Haritada kayıtlı tenis ve pickleball kulüp tesislerini incele.",
    xpReward: 110,
    badge: "Tesisçi",
    category: "court",
    gradient: "from-orange-500 to-amber-600",
    iconName: "MapPin",
  },

  // --- SOSYAL AKIŞ & TOPLULUK GÖREVLERİ (8 Adet) ---
  {
    id: "wq-soc-1",
    title: "Akışta Günün Maçları",
    subtitle: "Topluluk akışında paylaşılan maç skorlarını incele ve oyuncuları tebrik et.",
    xpReward: 80,
    badge: "Sosyal Elçi",
    category: "social",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Sparkles",
  },
  {
    id: "wq-soc-2",
    title: "Topluluğa Destek",
    subtitle: "Akışta yer alan maç kartlarına veya paylaşımlara etkileşim ver.",
    xpReward: 75,
    badge: "Destekçi",
    category: "social",
    gradient: "from-rose-500 to-red-600",
    iconName: "Heart",
  },
  {
    id: "wq-soc-3",
    title: "Skor Kartı İncelemesi",
    subtitle: "Oyuncuların set set paylaştığı maç skor kartlarını detaylı incele.",
    xpReward: 85,
    badge: "Analist",
    category: "social",
    gradient: "from-emerald-500 to-teal-600",
    iconName: "Award",
  },
  {
    id: "wq-soc-4",
    title: "Haftanın Trend Oyuncuları",
    subtitle: "Akışta öne çıkan oyuncuların profillerini ve rozetlerini incele.",
    xpReward: 90,
    badge: "Gözlemci",
    category: "social",
    gradient: "from-amber-500 to-orange-600",
    iconName: "Users",
  },
  {
    id: "wq-soc-5",
    title: "Pickleball Heyecanı",
    subtitle: "Sitedeki en yeni maç bildirimlerini ve topluluk akışını kontrol et.",
    xpReward: 75,
    badge: "Aktif Üye",
    category: "social",
    gradient: "from-purple-500 to-indigo-600",
    iconName: "Zap",
  },
  {
    id: "wq-soc-6",
    title: "Turnuva & Etkinlik Ruhı",
    subtitle: "Toplulukta yaklaşan organizasyon veya maç haberlerine göz at.",
    xpReward: 95,
    badge: "Etkinlik",
    category: "social",
    gradient: "from-cyan-500 to-blue-600",
    iconName: "Trophy",
  },
  {
    id: "wq-soc-7",
    title: "Oyuncu Ağı Bağlantısı",
    subtitle: "Partnerler veya akış üzerinden Türkiye geneli oyuncu listesine göz at.",
    xpReward: 80,
    badge: "Network",
    category: "social",
    gradient: "from-teal-500 to-emerald-600",
    iconName: "Users",
  },
  {
    id: "wq-soc-8",
    title: "Haftalık Akış Taraması",
    subtitle: "Bu haftanın en çok konuşulan veya oynanan maçlarına göz gezdir.",
    xpReward: 85,
    badge: "Gündem",
    category: "social",
    gradient: "from-orange-500 to-rose-600",
    iconName: "Flame",
  },

  // --- PARTNER, QR & SIRALAMA GÖREVLERİ (7 Adet) ---
  {
    id: "wq-part-1",
    title: "QR Davet & Hızlı Bağlantı",
    subtitle: "QR kod sistemini incele ve hızlı davet / profil okutma özelliğini keşfet.",
    xpReward: 110,
    badge: "Dijital Davet",
    category: "partner",
    gradient: "from-emerald-500 to-green-600",
    iconName: "QrCode",
  },
  {
    id: "wq-part-2",
    title: "Partner Seviye Filtresi",
    subtitle: "Partner Bul modülünde kendi seviyene uygun oyuncuları filtrele.",
    xpReward: 100,
    badge: "Uygun Eşleşme",
    category: "partner",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "Users",
  },
  {
    id: "wq-social-7",
    title: "Türkiye Rating Sıralaması",
    subtitle: "Sıralama sayfasına gir ve en üst basamaktaki oyuncuların puanlarını incele.",
    xpReward: 105,
    badge: "Liderlik Tablosu",
    category: "leaderboard",
    gradient: "from-amber-500 to-yellow-600",
    iconName: "Trophy",
  },
  {
    id: "wq-part-4",
    title: "Seviye Basamakları",
    subtitle: "Kendi seviyendeki oyuncuların haftalık XP yükselişini sıralamadan kontrol et.",
    xpReward: 95,
    badge: "Rekabet",
    category: "leaderboard",
    gradient: "from-purple-500 to-pink-600",
    iconName: "Award",
  },
  {
    id: "wq-part-5",
    title: "Şehir Bazlı Partner Arama",
    subtitle: "Kendi şehrindeki potansiyel antrenman partnerlerini listele.",
    xpReward: 100,
    badge: "Lokal Partner",
    category: "partner",
    gradient: "from-teal-500 to-cyan-600",
    iconName: "MapPin",
  },
  {
    id: "wq-part-6",
    title: "Haftalık Zirve Takibi",
    subtitle: "İlk 10 sırada yer alan oyuncuların maç geçmişlerine göz at.",
    xpReward: 110,
    badge: "Zirve Takibi",
    category: "leaderboard",
    gradient: "from-orange-500 to-amber-600",
    iconName: "TrendingUp",
  },
  {
    id: "wq-profile-2",
    title: "Oyuncu Kartı",
    subtitle: "Kendi profilinde rozetlerini, Rating puanını ve istatistiklerini incele.",
    xpReward: 90,
    badge: "Profilim",
    category: "leaderboard",
    gradient: "from-indigo-500 to-purple-600",
    iconName: "UserCheck",
  },
];

/**
 * Calculates a unique seed string for the current ISO week.
 * Example return: "2026-W28"
 */
export function getCurrentWeekSeed(): string {
  const now = new Date();
  // ISO week date calculation
  const date = new Date(now.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
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

/**
 * Deterministically picks exactly 4 distinct quests from WEEKLY_QUEST_POOL
 * based on the current ISO week seed.
 */
export function getWeeklyQuestsForCurrentWeek(): QuestItem[] {
  const seedStr = getCurrentWeekSeed();
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const pool = [...WEEKLY_QUEST_POOL];
  const selected: QuestItem[] = [];

  // Pick 4 distinct quests deterministically
  for (let i = 0; i < 4; i++) {
    const idx = Math.abs(hash + i * 1337) % pool.length;
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return selected;
}

/**
 * Calculates countdown until the next Monday at 00:00:00.
 */
export function getTimeUntilNextMonday(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedText: string;
} {
  const now = new Date();
  const nextMonday = new Date(now);
  
  // Calculate days until next Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = now.getDay();
  let daysUntilMonday = (1 + 7 - currentDay) % 7;
  if (daysUntilMonday === 0) {
    daysUntilMonday = 7; // Next Monday
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
