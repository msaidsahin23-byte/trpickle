"use client";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Trophy as TrophyIcon, ArrowLeft, Share2, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { ClientTime } from "@/components/ClientTime";

function getInitials(name: string) {
  return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().substring(0, 2);
}

export default function MatchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const matches = useStore(state => state.matches);
  const users = useStore(state => state.users);
  const shareMatchToFeed = useStore(state => state.shareMatchToFeed);
  const currentUser = useStore(state => state.currentUser);

  const matchId = parseInt(params.id);
  const match = matches.find(m => m.id === matchId);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState("");

  if (!match) return <div className="min-h-screen bg-[#0f172a] p-20 text-center text-white font-bold text-2xl flex items-center justify-center">Maç bulunamadı</div>;

  const t1Users = match.team1.map(id => users.find(u => u.id === id)).filter(Boolean) as any[];
  const t2Users = match.team2.map(id => users.find(u => u.id === id)).filter(Boolean) as any[];

  const handleShare = (e: any) => {
    e.preventDefault();
    if (!shareCaption.trim()) return;
    shareMatchToFeed(match.id, shareCaption);
    setShowShareModal(false);
    setShareCaption("");
    router.push("/feed");
  };

  const renderAvatars = (teamUsers: any[], side: 'left'|'right') => {
    return (
      <div className="flex justify-center items-center">
        {teamUsers.map((u, i) => (
          <div 
            key={u.id} 
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-[8px] border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden z-10 shadow-xl relative"
            style={{ 
              marginLeft: i > 0 ? '-2rem' : '0',
              zIndex: 10 - i 
            }}
          >
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl md:text-6xl font-extrabold text-gray-500 dark:text-gray-400">{getInitials(u.name)}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center pt-24 pb-20 px-4 relative overflow-hidden font-sans selection:bg-[#cfff50] selection:text-[#0f172a]">


      <div className="w-full max-w-5xl z-10">
        <Link href="/" onClick={(e) => { e.preventDefault(); router.back(); }} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-12 text-sm font-bold tracking-widest uppercase">
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
        
        <div className="flex flex-col items-center mb-16">
           <span className="px-6 py-2 bg-[#cfff50]/20 border border-[#cfff50]/50 rounded-full text-sm font-extrabold text-slate-800 dark:text-white tracking-widest uppercase mb-6 shadow-sm">
             {match.matchFormat === 'doubles' ? 'Eşli Maç Sonucu' : 'Tekli Maç Sonucu'}
           </span>
           <ClientTime dateString={match.date} className="text-gray-500 font-bold tracking-widest uppercase text-sm" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full mb-16">
           <div className="flex flex-col items-center">
             {renderAvatars(t1Users, 'left')}
             <div className="flex flex-col items-center mt-6">
                {t1Users.map(u => (
                  <Link href={`/profile/${u.id}`} key={u.id} className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide hover:opacity-70 transition-opacity">{u.name}</Link>
                ))}
             </div>
           </div>

           <div className="bg-gradient-to-r from-gray-400 dark:from-gray-600 to-[#cfff50] bg-clip-text text-transparent font-black text-6xl md:text-8xl italic tracking-tighter select-none drop-shadow-sm">
             VS
           </div>

           <div className="flex flex-col items-center">
             {renderAvatars(t2Users, 'right')}
             <div className="flex flex-col items-center mt-6">
                {t2Users.map(u => (
                  <Link href={`/profile/${u.id}`} key={u.id} className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide hover:opacity-70 transition-opacity">{u.name}</Link>
                ))}
             </div>
           </div>
        </div>

        <div className="flex flex-col items-center justify-center mb-16">
          <div className="flex items-center justify-center gap-8 md:gap-16 bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 px-12 md:px-24 py-8 md:py-16 rounded-[3rem] md:rounded-[4rem] w-full max-w-3xl">
             <span className={`text-7xl md:text-[120px] leading-none font-black ${match.team1Score > match.team2Score ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{match.team1Score}</span>
             <span className="text-5xl md:text-[80px] text-gray-300 dark:text-gray-600 font-black">-</span>
             <span className={`text-7xl md:text-[120px] leading-none font-black ${match.team2Score > match.team1Score ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{match.team2Score}</span>
          </div>

          {match.status === 'approved' && match.eloChange && (
            <div className="flex items-center gap-12 md:gap-32 mt-8">
               <div className={`text-xl md:text-3xl font-black flex items-center gap-2 ${match.team1Score > match.team2Score ? 'text-green-600' : 'text-red-500'}`}>
                 <span className={`px-4 py-2 rounded-2xl border ${match.team1Score > match.team2Score ? 'bg-green-100/50 border-green-200' : 'bg-red-100/50 border-red-200'}`}>
                   {match.team1Score > match.team2Score ? '+' : ''}{(match.eloChange.team1Change).toFixed(3)}
                 </span>
               </div>
               <div className={`text-xl md:text-3xl font-black flex items-center gap-2 ${match.team2Score > match.team1Score ? 'text-green-600' : 'text-red-500'}`}>
                 <span className={`px-4 py-2 rounded-2xl border ${match.team2Score > match.team1Score ? 'bg-green-100/50 border-green-200' : 'bg-red-100/50 border-red-200'}`}>
                   {match.team2Score > match.team1Score ? '+' : ''}{(match.eloChange.team2Change).toFixed(3)}
                 </span>
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 dark:border-slate-700 pt-10 mt-10 gap-8">
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {match.eventName && (
                <div className="flex items-center gap-3 text-sm md:text-lg font-extrabold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest bg-yellow-100 dark:bg-yellow-900/30 px-6 py-3 rounded-2xl border border-yellow-200 dark:border-yellow-700/50">
                  <TrophyIcon className="w-5 h-5" /> {match.eventName}
                </div>
              )}
              {match.location && (
                <div className="flex items-center gap-3 text-sm md:text-lg font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-700/50">
                  <MapPin className="w-5 h-5 text-blue-500" /> {match.location}
                </div>
              )}
           </div>

           {currentUser && (
             <button 
               onClick={() => setShowShareModal(true)}
               className="flex items-center justify-center gap-3 bg-[#cfff50] text-gray-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#b8e640] transition-colors shadow-xl w-full md:w-auto"
             >
               <Share2 className="w-6 h-6" /> Akışta Paylaş
             </button>
           )}
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pb-blue" /> Maçı Akışta Paylaş
                </h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full transition-colors shadow-sm border border-gray-100 dark:border-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleShare} className="p-6 flex flex-col gap-4">
                <textarea 
                  value={shareCaption}
                  onChange={e => setShareCaption(e.target.value)}
                  placeholder="Bu maç hakkında ne düşünüyorsun? (Örn: İnanılmaz bir geri dönüştü!)"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-pb-green focus:bg-white dark:focus:bg-slate-800 transition-colors placeholder-gray-400 dark:placeholder-gray-500 resize-none font-medium"
                  autoFocus
                />
                <button 
                  type="submit" 
                  disabled={!shareCaption.trim()}
                  className="w-full bg-[#cfff50] text-gray-900 font-black py-4 rounded-xl hover:bg-[#b8e640] transition-colors shadow-md disabled:opacity-50 disabled:hover:bg-[#cfff50] disabled:shadow-none"
                >
                  Paylaş
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
