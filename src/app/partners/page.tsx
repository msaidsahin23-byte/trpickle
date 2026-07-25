"use client";
import React, { useState } from "react";
import { useStore, User } from "@/store/useStore";
import { resolveUserGender } from "@/utils/gender";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  Search, 
  Trophy, 
  Filter,
  ShieldCheck
} from "lucide-react";
import FriendBadge, { isMutualFriend } from "@/components/FriendBadge";

export default function PartnerMatchmakingPage() {
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const toggleFollow = useStore(state => state.toggleFollow);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");

  const isFollowing = (userId: number | string) => {
    if (!currentUser) return false;
    return currentUser.following?.includes(userId) || false;
  };

  const isMutualFriend = (userId: number | string) => {
    if (!currentUser) return false;
    return (
      currentUser.following?.includes(userId) &&
      currentUser.followers?.includes(userId)
    );
  };

  const calculateCompatibility = (user: User) => {
    if (!currentUser) return 80;
    const isSameCity =
      Boolean(user.city && currentUser.city) &&
      user.city?.trim().toLowerCase() === currentUser.city?.trim().toLowerCase();

    const diff = Math.abs(user.singlesRating - currentUser.singlesRating);
    const eloBonus = Math.max(0, 19 - Math.round(diff * 12));

    if (isSameCity) {
      return Math.min(99, 80 + eloBonus);
    } else {
      return Math.min(54, 35 + eloBonus);
    }
  };

  const allCities = Array.from(
    new Set(users.map(u => u.city).filter(Boolean) as string[])
  );

  const normSearch = searchQuery.toLocaleLowerCase('tr-TR').trim();
  const potentialPartners = users
    .filter(u => u.id !== currentUser?.id)
    .filter(u => {
      let matchesName = true;
      if (normSearch) {
        const nameLowerTr = u.name.toLocaleLowerCase('tr-TR');
        const nameLowerEn = u.name.toLowerCase();
        const wordsTr = nameLowerTr.split(/\s+/);
        const wordsEn = nameLowerEn.split(/\s+/);
        const startsWithWord = wordsTr.some(w => w.startsWith(normSearch)) || wordsEn.some(w => w.startsWith(searchQuery.toLowerCase()));
        if (normSearch.length === 1) {
          matchesName = startsWithWord;
        } else {
          matchesName = startsWithWord || nameLowerTr.includes(normSearch) || nameLowerEn.includes(searchQuery.toLowerCase()) || Boolean(u.bio?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
      }
      const matchesCity = selectedCity === "all" ? true : u.city?.trim().toLowerCase() === selectedCity?.trim().toLowerCase();
      const matchesGender = genderFilter === "all" ? true : resolveUserGender(u) === genderFilter;
      return matchesName && matchesCity && matchesGender;
    })
    .sort((a, b) => {
      if (normSearch) {
        const aStarts = a.name.toLocaleLowerCase('tr-TR').startsWith(normSearch) ? 0 : 1;
        const bStarts = b.name.toLocaleLowerCase('tr-TR').startsWith(normSearch) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
      }
      return calculateCompatibility(b) - calculateCompatibility(a);
    });

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pb-green" />
            Akıllı Partner Bul & Eşleşme
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base font-medium">
            Seviyene en uygun oyuncuları keşfet. Karşılıklı takipleştiğin oyuncular <span className="text-lime-600 dark:text-lime-400 font-bold">Arkadaş 🤝</span> sayılır ve birbirinizle DM mesajlaşabilirsiniz!
          </p>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
          {/* Gender Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 w-full sm:w-max">
            <button
              onClick={() => setGenderFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                genderFilter === "all"
                  ? "bg-pb-green text-pb-dark shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setGenderFilter("female")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                genderFilter === "female"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kadınlar
            </button>
            <button
              onClick={() => setGenderFilter("male")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                genderFilter === "male"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Erkekler
            </button>
          </div>

          {/* City Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 sm:justify-end">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Tüm Şehirler</option>
              {allCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="İsim veya biyografide ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-pb-green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {potentialPartners.map((user) => {
            const compat = calculateCompatibility(user);
            const following = isFollowing(user.id);
            const mutual = isMutualFriend(user.id);

            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Avatar + Match Percentage */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-pb-green/40 flex items-center justify-center font-black text-2xl text-pb-dark dark:text-white overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/profile/${user.id}`}
                            className="font-extrabold text-lg text-slate-900 dark:text-white hover:text-pb-green transition-colors"
                          >
                            {user.name}
                          </Link>
                          <FriendBadge currentUser={currentUser} targetUser={user} />
                        </div>
                        {user.city && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-pb-green" /> {user.city}
                            </span>
                            {currentUser?.city && user.city.trim().toLowerCase() === currentUser.city.trim().toLowerCase() && (
                              <span className="px-1.5 py-0.5 rounded-full bg-pb-green/20 text-pb-green text-[10px] font-black">
                                Aynı Şehir
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Uyum</span>
                      <span className="text-sm font-black px-2.5 py-1 rounded-full bg-lime-500/15 text-lime-600 dark:text-lime-400 border border-lime-400/30">
                        %{compat}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Tags */}
                  <div className="mt-4 flex items-center justify-between py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Tekli Rating</span>
                      <span className="text-base font-black text-pb-green">{user.singlesRating.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Eşli Rating</span>
                      <span className="text-base font-black text-slate-700 dark:text-slate-200">{user.doublesRating.toFixed(2)}</span>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium italic">
                      "{user.bio}"
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {user.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  {mutual ? (
                    <>
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-lime-500/15 text-lime-700 dark:text-lime-400 border border-lime-400/30 font-black text-xs">
                        <UserCheck className="w-4 h-4" /> Arkadaşsınız
                      </div>
                      <Link
                        href={`/messages?user=${user.id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-pb-green text-pb-dark font-black text-xs hover:scale-105 transition-transform shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" /> Mesaj At
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          alert("Takip etmek için giriş yapmalısınız.");
                          return;
                        }
                        toggleFollow(user.id);
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs transition-all ${
                        following
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
                          : "bg-pb-green text-pb-dark shadow-sm hover:scale-[1.01]"
                      }`}
                    >
                      {following ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-500" /> Takip Ediliyor (İstek Gitti)
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" /> Takip İsteği / Takip Et
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {potentialPartners.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">Aranan kriterlerde oyuncu bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
