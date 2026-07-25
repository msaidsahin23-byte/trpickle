"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, MapPin, CheckCircle2, X, BellRing, Heart, MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ClientTime } from "@/components/ClientTime";

export default function NotificationsPage() {
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const matches = useStore(state => state.matches);
  const users = useStore(state => state.users);
  const approveMatch = useStore(state => state.approveMatch);
  const rejectMatch = useStore(state => state.rejectMatch);
  const markNotificationsAsRead = useStore(state => state.markNotificationsAsRead);

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth");
    } else {
      markNotificationsAsRead(currentUser.id);
    }
  }, [currentUser?.id, router, markNotificationsAsRead]);

  if (!currentUser) return null;

  const blockedUsers = currentUser?.blockedUsers || [];

  const pendingMatches = matches.filter(m => 
    m.status === 'pending' && 
    (m.team1.includes(currentUser.id) || m.team2.includes(currentUser.id)) &&
    !(m.approvedBy || []).includes(currentUser.name) &&
    !m.team1.some(id => blockedUsers.includes(id)) &&
    !m.team2.some(id => blockedUsers.includes(id))
  );

  const getUserNames = (ids: (number | string)[]) => {
    return ids.map(id => {
      const u = users.find(user => user.id === id);
      return u ? u.name : "Bilinmeyen Kullanıcı";
    }).join(' & ');
  };

  const interactions = useMemo(() => {
    return [...(currentUser.notifications || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [currentUser.notifications]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto flex flex-col gap-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-pb-dark dark:text-white shadow-sm border border-transparent dark:border-slate-700">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-pb-dark dark:text-white tracking-tight">Bildirimler</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Onayınızı bekleyen işlemler</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/80 flex flex-col gap-4 transition-colors">
          <h2 className="text-xl font-extrabold text-pb-dark dark:text-white flex items-center gap-2 mb-2">
            Onayınızı Bekleyen Maçlar <span className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 text-sm px-2 py-0.5 rounded-full">{pendingMatches.length}</span>
          </h2>

          <AnimatePresence>
            {pendingMatches.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="p-12 text-center flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                  <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-300">Tüm maçlar onaylandı</h3>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-400 mt-1">Şu anda onayınızı bekleyen herhangi bir maç skoru bulunmuyor.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4">
                {pendingMatches.map(m => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {m.matchFormat === 'singles' ? '1v1 Tekli Maç' : '2v2 Eşli Maç'}
                      </span>
                      <div className="font-extrabold text-pb-dark dark:text-white mt-1 flex items-center gap-2 justify-center sm:justify-start text-lg">
                        <span>{getUserNames(m.team1)}</span>
                        <span className="text-gray-300 dark:text-gray-500 font-bold px-2">vs</span>
                        <span>{getUserNames(m.team2)}</span>
                      </div>
                      
                      {(m.location || m.eventName) && (
                        <div className="flex items-center gap-4 mt-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 justify-center sm:justify-start uppercase tracking-wide">
                          {m.eventName && (
                            <span className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" /> {m.eventName}
                            </span>
                          )}
                          {m.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-pb-blue" /> {m.location}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="text-sm font-extrabold text-pb-dark dark:text-white mt-3 bg-gray-50 dark:bg-slate-800 py-1.5 px-4 rounded-full self-center sm:self-start inline-block border border-gray-100 dark:border-slate-700">
                        Skor: {m.team1Score} - {m.team2Score}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      <button 
                        onClick={() => approveMatch(m.id, currentUser.name)}
                        className="flex-1 sm:flex-none bg-pb-green text-pb-dark px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pb-green/90 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Onayla
                      </button>
                      <button 
                        onClick={() => rejectMatch(m.id)}
                        className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-red-500 border border-red-200 dark:border-red-900/50 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" /> Reddet
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Etkileşimler (Social Notifications) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/80 flex flex-col gap-4 mt-2 transition-colors">
          <h2 className="text-xl font-extrabold text-pb-dark dark:text-white flex items-center gap-2 mb-2">
            Etkileşimler <span className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 text-sm px-2 py-0.5 rounded-full">{interactions.length}</span>
          </h2>

          <AnimatePresence>
            {interactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-10 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
              >
                <MessageCircle className="w-10 h-10 mb-3 text-gray-200 dark:text-gray-700" />
                <p className="font-medium">Henüz bir etkileşim bulunmuyor.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                {interactions.map(n => {
                  const mentionedUser = users.find(u => u.name && u.id !== currentUser.id && n.message?.toLowerCase().includes(u.name.toLowerCase()));
                  const href = n.postId 
                    ? `/feed?postId=${n.postId}` 
                    : mentionedUser 
                      ? `/profile/${mentionedUser.id}` 
                      : "/feed";

                  return (
                    <Link href={href} key={n.id}>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                      >
                        <div className="mt-0.5 shrink-0">
                          {mentionedUser?.avatarUrl ? (
                            <img src={mentionedUser.avatarUrl} alt={mentionedUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : mentionedUser ? (
                            <div className="w-10 h-10 rounded-full bg-pb-blue/10 text-pb-blue font-bold flex items-center justify-center">
                              {mentionedUser.name.charAt(0)}
                            </div>
                          ) : n.type === 'like' ? (
                            <Heart className="w-6 h-6 text-red-500 fill-red-50" />
                          ) : (
                            <MessageCircle className="w-6 h-6 text-pb-blue fill-pb-blue/10" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-pb-dark dark:text-white text-[15px] leading-snug">
                            {n.message}
                          </span>
                          <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                            <ClientTime dateString={n.createdAt} />
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
