"use client";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { resolveUserGender } from "@/utils/gender";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Trash2, Search, ChevronDown, UserCheck, Users } from "lucide-react";
import FriendBadge from "@/components/FriendBadge";

export default function Leaderboard() {
  const [tab, setTab] = useState<"singles" | "doubles">("singles");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const deleteUser = useStore(state => state.deleteUser);

  const allTags = Array.from(new Set(users.flatMap(u => u.tags))).sort();

  const isFriend = (userId: number | string) => {
    if (!currentUser) return false;
    return (
      currentUser.following?.includes(userId) &&
      currentUser.followers?.includes(userId)
    );
  };

  const filteredUsers = users.filter(u => {
    const matchesName = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? (u.tags || []).includes(selectedTag) : true;
    const matchesGender = genderFilter === "all" ? true : resolveUserGender(u) === genderFilter;
    return matchesName && matchesTag && matchesGender;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (tab === "singles") {
      return b.singlesRating - a.singlesRating;
    } else {
      return b.doublesRating - a.doublesRating;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 px-3 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-pb-dark dark:text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-pb-green shrink-0" /> 
          <span>Sıralama <span className="text-gray-400 dark:text-gray-500 font-medium text-base sm:text-2xl">(Leaderboard)</span></span>
        </h1>
      </div>
      
      {/* Controls Container */}
      <div className="flex flex-col gap-4">
        {/* Top Filters Strip: Match Format & Gender */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Format Tabs (Tekli / Eşli) */}
          <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-slate-700 w-full sm:w-max">
            <button 
              onClick={() => setTab("singles")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${tab === "singles" ? 'bg-pb-dark dark:bg-slate-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
            >
              Tekli (1v1)
            </button>
            <button 
              onClick={() => setTab("doubles")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${tab === "doubles" ? 'bg-pb-dark dark:bg-slate-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
            >
              Eşli (2v2)
            </button>
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-slate-700 w-full sm:w-max">
            <button 
              onClick={() => setGenderFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${genderFilter === "all" ? 'bg-pb-green text-pb-dark shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
            >
              Tümü
            </button>
            <button 
              onClick={() => setGenderFilter("female")}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${genderFilter === "female" ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
            >
              Kadınlar
            </button>
            <button 
              onClick={() => setGenderFilter("male")}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${genderFilter === "male" ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
            >
              Erkekler
            </button>
          </div>
        </div>

        {/* Search & Tag Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Tag Filter */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pb-green/30 focus:border-pb-green transition-all text-xs sm:text-sm font-medium text-pb-dark dark:text-white appearance-none cursor-pointer"
            >
              <option value="">Tüm Oyun Stilleri</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pb-green/30 focus:border-pb-green transition-all text-xs sm:text-sm font-medium text-pb-dark dark:text-white"
              placeholder="İsim ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <AnimatePresence mode="popLayout">
          {sortedUsers.map((user, index) => {
            const isMutualFriend = isFriend(user.id);
            return (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className={`flex items-center justify-between p-3.5 sm:p-5 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${currentUser?.id === user.id ? 'bg-pb-green/10 dark:bg-pb-green/20' : ''}`}
              >
                <div className="flex items-center gap-2.5 sm:gap-5 min-w-0">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-black text-xs sm:text-base rounded-full shrink-0 ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700'}`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-pb-dark dark:text-white rounded-full flex items-center justify-center font-bold text-base sm:text-xl shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link href={`/profile/${user.id}`} className="text-sm sm:text-lg font-extrabold text-pb-dark dark:text-white hover:text-pb-blue transition-colors truncate">
                        {user.name}
                      </Link>
                      <FriendBadge currentUser={currentUser} targetUser={user} />
                    </div>
                    <div className="flex gap-1.5 mt-0.5 flex-wrap">
                      {user.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] sm:text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500">Rating</span>
                    <span className="text-base sm:text-2xl font-black text-pb-green">
                      {(tab === "singles" ? user.singlesRating : user.doublesRating).toFixed(3)}
                    </span>
                  </div>
                  
                  {currentUser?.role === 'admin' && currentUser.id !== user.id && (
                    <button 
                      onClick={() => { if (confirm("Kullanıcıyı sistemden tamamen silmek istediğinize emin misiniz?")) deleteUser(user.id); }}
                      className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {sortedUsers.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
            <Search className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
            <p>Seçilen filtre ve arama kriterlerine uygun oyuncu bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
