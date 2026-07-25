"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, UserCheck, UserPlus, MapPin, Trophy, Search } from "lucide-react";
import { useStore, User } from "@/store/useStore";
import Link from "next/link";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  targetUser: User;
}

export function FollowersModal({ isOpen, onClose, initialTab, targetUser }: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const users = useStore((state) => state.users);
  const currentUser = useStore((state) => state.currentUser);
  const toggleFollow = useStore((state) => state.toggleFollow);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const followerIds = targetUser.followers || [];
  const followingIds = targetUser.following || [];

  const followerUsers = users.filter((u) => followerIds.includes(u.id));
  const followingUsers = users.filter((u) => followingIds.includes(u.id));

  const listToDisplay = activeTab === "followers" ? followerUsers : followingUsers;

  const filteredList = listToDisplay.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.city && u.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-dark/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-extrabold text-pb-dark dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-pb-green" />
                {targetUser.name}
              </h2>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
                Ağ ve Bağlantılar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-pb-dark dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-700 px-6 pt-3 bg-gray-50/50 dark:bg-slate-800/50 gap-2">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex items-center gap-2 pb-3 px-3 font-extrabold text-sm border-b-2 transition-all ${
                activeTab === "followers"
                  ? "border-pb-green text-pb-dark dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <span>Takipçiler</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "followers"
                  ? "bg-pb-green text-pb-dark"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
              }`}>
                {followerIds.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("following")}
              className={`flex items-center gap-2 pb-3 px-3 font-extrabold text-sm border-b-2 transition-all ${
                activeTab === "following"
                  ? "border-pb-green text-pb-dark dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <span>Takip Edilenler</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "following"
                  ? "bg-pb-green text-pb-dark"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
              }`}>
                {followingIds.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="İsim veya şehir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-pb-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pb-green"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-50 dark:divide-slate-700/50">
            {filteredList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-medium text-sm">
                {searchQuery
                  ? "Aramanızla eşleşen kullanıcı bulunamadı."
                  : activeTab === "followers"
                  ? "Henüz takipçi bulunmuyor."
                  : "Henüz takip edilen kimse bulunmuyor."}
              </div>
            ) : (
              filteredList.map((user) => {
                const isMe = currentUser?.id === user.id;
                const isFollowing = Boolean(currentUser?.following?.includes(user.id));
                const isFriend = Boolean(
                  currentUser &&
                    currentUser.following?.includes(user.id) &&
                    user.following?.includes(currentUser.id)
                );

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between pt-3 first:pt-0 gap-3 hover:bg-gray-50/60 dark:hover:bg-slate-700/40 p-2 rounded-2xl transition-colors"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-pb-green to-emerald-400 p-0.5 shrink-0 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full bg-white dark:bg-slate-800"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-pb-dark text-pb-green flex items-center justify-center font-black text-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-pb-dark dark:text-white truncate">
                            {user.name}
                          </span>
                          {isFriend && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-lime-500/15 text-lime-600 dark:text-lime-400 border border-lime-400/30 text-[10px] font-black">
                              🤝 Arkadaş
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          {user.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-pb-green" />
                              {user.city}
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-bold text-pb-dark dark:text-gray-300">
                            Elo: {user.singlesRating}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Action button */}
                    {!isMe && currentUser && (
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          isFollowing
                            ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            : "bg-pb-green text-pb-dark hover:brightness-105 shadow-sm"
                        }`}
                      >
                        {isFollowing ? "Takipte" : "Takip Et"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
