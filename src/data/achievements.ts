import { GraduationCap, Swords, UserCheck, Flame, Trophy, Moon, Award, Medal, User, Users, Sunrise, Calendar } from "lucide-react";
import type { StoreState } from "@/store/useStore";
import { academyLessons } from "@/data/academyLessons";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  iconName: "GraduationCap" | "Swords" | "UserCheck" | "Flame" | "Trophy" | "Moon" | "Award" | "Medal" | "User" | "Users" | "Sunrise" | "Calendar";
  calculateProgress?: (state: StoreState) => { current: number; max: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "academy_grad",
    title: "Akademi Mezunu",
    description: "Tüm akademi derslerini tamamladın.",
    xpReward: 150,
    iconName: "GraduationCap",
    calculateProgress: (state) => {
      const current = state.currentUser?.completedVideoIds?.length || 0;
      return { current, max: academyLessons.length };
    }
  },
  {
    id: "first_match",
    title: "Korta İlk Adım",
    description: "Sisteme ilk skorunu başarıyla girdin.",
    xpReward: 50,
    iconName: "Swords",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const userId = state.currentUser.id;
      const hasMatch = state.matches.some(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)));
      return { current: hasMatch ? 1 : 0, max: 1 };
    }
  },
  {
    id: "first_win",
    title: "İlk Galibiyet",
    description: "İlk galibiyetini aldın.",
    xpReward: 75,
    iconName: "Award",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const userId = state.currentUser.id;
      const wins = state.matches.filter(m => {
        if (m.status === 'pending' || m.status === 'rejected') return false;
        if (!m.team1.includes(userId) && !m.team2.includes(userId)) return false;
        const isTeam1 = m.team1.includes(userId);
        return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
      });
      return { current: wins.length > 0 ? 1 : 0, max: 1 };
    }
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Sistemde toplam 10 maça katıldın.",
    xpReward: 150,
    iconName: "Medal",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 10 };
      const userId = state.currentUser.id;
      const matchesPlayed = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId))).length;
      return { current: Math.min(matchesPlayed, 10), max: 10 };
    }
  },
  {
    id: "social_butterfly",
    title: "Sosyal Kelebek",
    description: "Profilindeki bilgileri tamamen doldurdun.",
    xpReward: 50,
    iconName: "UserCheck",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const u = state.currentUser;
      const details = [u.city, u.bio, u.birthdate, u.paddle, u.favoriteCourt];
      const filled = details.filter(Boolean).length;
      // Let's say if they fill at least 4 of these 5, they get it.
      return { current: Math.min(filled, 4), max: 4 };
    }
  },
  {
    id: "win_streak",
    title: "Yenilmez",
    description: "Üst üste 3 galibiyet aldın.",
    xpReward: 100,
    iconName: "Flame",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 3 };
      const userId = state.currentUser.id;
      const userMatches = state.matches
        .filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      let currentStreak = 0;
      let maxStreak = 0;
      for (const m of userMatches) {
        const isTeam1 = m.team1.includes(userId);
        const won = isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
        if (won) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      return { current: Math.min(maxStreak, 3), max: 3 };
    }
  },
  {
    id: "serial_killer",
    title: "Alev Alev",
    description: "Üst üste 5 galibiyet aldın.",
    xpReward: 200,
    iconName: "Swords",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 5 };
      const userId = state.currentUser.id;
      const userMatches = state.matches
        .filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      let currentStreak = 0;
      let maxStreak = 0;
      for (const m of userMatches) {
        const isTeam1 = m.team1.includes(userId);
        const won = isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
        if (won) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      return { current: Math.min(maxStreak, 5), max: 5 };
    }
  },
  {
    id: "night_owl",
    title: "Gece Kuşu",
    description: "Akşam 20:00 ile 06:00 arasında bir maç oynadın.",
    xpReward: 50,
    iconName: "Moon",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)));
      
      const hasNightMatch = userMatches.some(m => {
        const date = new Date(m.date);
        const hours = date.getHours();
        return hours >= 20 || hours < 6;
      });
      return { current: hasNightMatch ? 1 : 0, max: 1 };
    }
  },
  {
    id: "lone_wolf",
    title: "Yalnız Kurt",
    description: "10 adet Tekli (1v1) maç oynadın.",
    xpReward: 100,
    iconName: "User",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 10 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)) && m.matchFormat === 'singles');
      return { current: Math.min(userMatches.length, 10), max: 10 };
    }
  },
  {
    id: "team_spirit",
    title: "Takım Ruhu",
    description: "10 adet Eşli (2v2) maç oynadın.",
    xpReward: 100,
    iconName: "Users",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 10 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)) && m.matchFormat === 'doubles');
      return { current: Math.min(userMatches.length, 10), max: 10 };
    }
  },
  {
    id: "gladiator",
    title: "Gladyatör",
    description: "Sistemde toplam 50 maça katıldın.",
    xpReward: 300,
    iconName: "Swords",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 50 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)));
      return { current: Math.min(userMatches.length, 50), max: 50 };
    }
  },
  {
    id: "unstoppable",
    title: "Durdurulamaz",
    description: "Üst üste 10 galibiyet aldın.",
    xpReward: 400,
    iconName: "Flame",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 10 };
      const userId = state.currentUser.id;
      const userMatches = state.matches
        .filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      let currentStreak = 0;
      let maxStreak = 0;
      for (const m of userMatches) {
        const isTeam1 = m.team1.includes(userId);
        const won = isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
        if (won) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      return { current: Math.min(maxStreak, 10), max: 10 };
    }
  },
  {
    id: "early_bird",
    title: "Erkenci Kuş",
    description: "Sabah 06:00 ile 12:00 arasında bir maç oynadın.",
    xpReward: 50,
    iconName: "Sunrise",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)));
      
      const hasMorningMatch = userMatches.some(m => {
        const date = new Date(m.date);
        const hours = date.getHours();
        return hours >= 6 && hours < 12;
      });
      return { current: hasMorningMatch ? 1 : 0, max: 1 };
    }
  },
  {
    id: "weekend_warrior",
    title: "Hafta Sonu Savaşçısı",
    description: "Cumartesi veya Pazar günü bir maç oynadın.",
    xpReward: 50,
    iconName: "Calendar",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)));
      
      const hasWeekendMatch = userMatches.some(m => {
        const date = new Date(m.date);
        const day = date.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
      });
      return { current: hasWeekendMatch ? 1 : 0, max: 1 };
    }
  },
  {
    id: "double_double",
    title: "Çift Çifte Zafer",
    description: "2v2 modunda 5 galibiyet aldın.",
    xpReward: 150,
    iconName: "Medal",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 5 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)) && m.matchFormat === 'doubles');
      
      const wins = userMatches.filter(m => {
        const isTeam1 = m.team1.includes(userId);
        return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
      });
      return { current: Math.min(wins.length, 5), max: 5 };
    }
  },
  {
    id: "persistence",
    title: "Zirve İnadı",
    description: "1v1 modunda 5 galibiyet aldın.",
    xpReward: 150,
    iconName: "Trophy",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 5 };
      const userId = state.currentUser.id;
      const userMatches = state.matches.filter(m => (!m.status || m.status === 'approved') && (m.team1.includes(userId) || m.team2.includes(userId)) && m.matchFormat === 'singles');
      
      const wins = userMatches.filter(m => {
        const isTeam1 = m.team1.includes(userId);
        return isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
      });
      return { current: Math.min(wins.length, 5), max: 5 };
    }
  },
  {
    id: "season-1-champion",
    title: "Sezon 1 Şampiyonu",
    description: "Sezon 1: Kortların Yükselişi özel görevlerinin tamamını bitirip Şampiyonluk sandığını açtın.",
    xpReward: 1000,
    iconName: "Trophy",
    calculateProgress: (state) => {
      if (!state.currentUser) return { current: 0, max: 1 };
      const claimed = state.currentUser.claimedWeeklyQuests || [];
      return { current: claimed.includes("season1-mega-chest") ? 1 : 0, max: 1 };
    }
  }
];
