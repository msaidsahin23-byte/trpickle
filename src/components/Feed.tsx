"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, X, PlusCircle, ImageIcon, BarChart2, Trash2, CheckCircle2, Trophy, MapPin, Share2, User as UserIcon, Users, Zap, Hash, AtSign, Search, Wand2, Lock, Crown } from "lucide-react";
import { getProxyUrl } from '@/lib/imageProxy';
import { useState, useEffect, useRef } from "react";
import { useStore, Post, Comment } from "@/store/useStore";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import CommentDrawer from "@/components/CommentDrawer";
import { AuthModal } from "@/components/AuthModal";
import { ClientTime } from "@/components/ClientTime";
import { resizeImage } from "@/lib/image-utils";
import FriendBadge from "@/components/FriendBadge";
import { getUserMayorCourts } from "@/lib/auras-and-mayors";
import { checkTextSafety } from "@/lib/contentFilter";
import toast from "react-hot-toast";
function EmbeddedMatchCard({ matchId }: { matchId: number | string }) {
  const matches = useStore(state => state.matches);
  const users = useStore(state => state.users);
  const match = matches.find(m => m.id === matchId);

  if (!match) return null;

  const getTeamName = (ids: (number | string)[]) => ids.map(id => users.find(u => u.id === id)?.name || "Kullanıcı").join(" & ");

  return (
    <Link href={`/match/${match.id}`} className="mt-4 block bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 hover:border-gray-200 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-1/3 text-right">
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm md:text-base">{getTeamName(match.team1)}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-700 px-4 py-1 rounded-xl mx-4 shadow-sm border border-gray-200 dark:border-slate-600 shrink-0">
          <span className="font-black text-xl text-gray-900 dark:text-white">{match.team1Score}</span>
          <span className="text-gray-400 font-bold">-</span>
          <span className="font-black text-xl text-gray-900 dark:text-white">{match.team2Score}</span>
        </div>

        <div className="flex flex-col w-1/3 text-left">
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm md:text-base">{getTeamName(match.team2)}</span>
        </div>
      </div>
      {(match.location || match.eventName) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          {match.eventName && <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-500" /> {match.eventName}</span>}
          {match.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-pb-blue" /> {match.location}</span>}
        </div>
      )}
    </Link>
  );
}

function PostCard({ post, onRequireAuth, onClickPost, isModal, onOpenComments }: { post: Post; onRequireAuth: () => void; onClickPost?: () => void; isModal?: boolean; onOpenComments?: () => void }) {
  const currentUser = useStore(state => state.currentUser);
  const toggleLikeStore = useStore(state => state.toggleLike);
const votePollStore = useStore(state => state.votePoll);
  const deletePost = useStore(state => state.deletePost);
  const togglePinPost = useStore(state => state.togglePinPost);
  const users = useStore(state => state.users);

  const authorUser = users.find(u => u.id === post.authorId);
  const courts = useStore(state => state.courts || []);
  const matches = useStore(state => state.matches || []);
  const authorMayors = authorUser ? getUserMayorCourts(authorUser.id, courts, matches, users) : [];

  const isLiked = currentUser ? (post.likedBy || []).map(String).includes(String(currentUser.id)) : false;
const handleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    toggleLikeStore(post.id, currentUser.id);
  };

  const handleVote = (e: React.MouseEvent, optionIndex: number) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    votePollStore(post.id, optionIndex, currentUser.id);
  };

  const submitComment = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }



  };

  return (
    <motion.div 
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={onClickPost}
      className={`rounded-3xl shadow-sm overflow-hidden transition-all duration-300 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 ${
        post.isPinned ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20' : ''
      } ${onClickPost ? 'cursor-pointer hover:border-pb-blue/50 hover:shadow-md transition-all' : ''}`}
    >
      {post.isPinned && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-4 sm:px-6 py-2 flex items-center gap-2">
          <span>📌</span> RESMÎ DUYURU — SABİTLENMİŞ GÖNDERİ
        </div>
      )}

      <div className="p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {authorUser?.avatarUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src={getProxyUrl(authorUser.avatarUrl)} alt={post.author} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-pb-dark dark:text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              {post.author.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.authorId !== -1 ? (
                <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-lg text-pb-dark dark:text-white leading-tight hover:text-pb-blue transition-colors cursor-pointer">{post.author}</h3>
                </Link>
              ) : (
                <h3 className="font-bold text-lg text-pb-dark dark:text-white leading-tight">{post.author}</h3>
              )}
              {((currentUser?.role === 'admin' && authorUser?.role === 'admin') || post.isOfficial) && (
                <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                  👑 YÖNETİCİ
                </span>
              )}
              {authorMayors.length > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase shadow-sm"
                  title={`👑 ${authorMayors.map(m => m.courtName).join(', ')} Ayın Kort Fatihi (${authorMayors[0].winsThisMonth} Galibiyet)`}
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>KORT FATİHİ ({authorMayors[0].courtName})</span>
                </span>
              )}
              <FriendBadge currentUser={currentUser} targetUser={authorUser} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              {authorUser ? (
                <>
                  <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md" title="1v1 Elo">
                    <UserIcon size={14} />
                    {authorUser.singlesRating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md" title="2v2 Elo">
                    <Users size={14} />
                    {authorUser.doublesRating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200" title={`Seviye ${authorUser.level || 1}`}>
                    <Zap size={14} className="fill-purple-500" />
                    {authorUser.level || 1}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-md">
                  Sistem
                </span>
              )}
              <ClientTime dateString={post.time} className="text-xs font-medium text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentUser?.role === 'admin' && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePinPost(post.id); }}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors ${post.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Sabitle / Kaldır"
            >
              {post.isPinned ? "📌 Kaldır" : "📌 Sabitle"}
            </button>
          )}
          {(currentUser?.role === 'admin' || currentUser?.id === post.authorId) && (
            <button 
              onClick={(e) => { e.stopPropagation(); if(confirm("Gönderiyi kalıcı olarak silmek istediğinize emin misiniz?")) deletePost(post.id); }}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
              title={currentUser?.role === 'admin' && currentUser?.id !== post.authorId ? "Admin Olarak Sil" : "Gönderiyi Sil"}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tagged Court, Category & Tagged Users Badges Strip */}
      {(post.taggedCourt || post.categoryBadge || (post.taggedUsers && post.taggedUsers.length > 0)) && (
        <div className="px-6 pb-3 flex items-center flex-wrap gap-2">
          {post.categoryBadge && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20 shadow-sm">
              {post.categoryBadge}
            </span>
          )}
          {post.taggedCourt && (
            <Link
              href={`/courts?search=${encodeURIComponent(post.taggedCourt.name)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs transition-all shadow-sm group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>📍 {post.taggedCourt.name}</span>
              {post.taggedCourt.city && (
                <span className="text-gray-400 dark:text-gray-400 font-semibold">({post.taggedCourt.city})</span>
              )}
              <span className="ml-1 underline font-bold opacity-80 text-[11px]">Kortu İncele →</span>
            </Link>
          )}
          {post.taggedUsers && post.taggedUsers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400">👥 Birlikte:</span>
              {post.taggedUsers.map(u => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 hover:bg-pb-blue/15 border border-gray-200 dark:border-slate-600 text-xs font-bold text-pb-dark dark:text-gray-200 transition-colors shadow-2xs"
                >
                  {u.avatarUrl ? (
                    <img src={getProxyUrl(u.avatarUrl)} alt={u.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-pb-blue text-white flex items-center justify-center text-[9px] shrink-0 font-black">
                      {u.name.charAt(0)}
                    </span>
                  )}
                  <span>@{u.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-6 pb-6 text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
        {post.content}

        {/* Şık Maç Skoru / Rating Kartı */}
        {post.matchScoreCard && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-700 shadow-md dark:shadow-xl text-slate-900 dark:text-white relative overflow-hidden transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-lime-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-lime-400 uppercase tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                {post.matchScoreCard.matchType === '1v1' ? '1v1 Tekler Maç Sonucu' : '2v2 Çiftler Maç Sonucu'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-lime-500/20 text-emerald-700 dark:text-lime-300 text-[10px] font-extrabold border border-emerald-500/30 dark:border-lime-500/30">
                RESMÎ SKOR KARTI
              </span>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 py-2">
              <div className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${post.matchScoreCard.winner === 1 ? 'bg-amber-500/15 border border-amber-500/40 shadow-sm' : 'bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50'}`}>
                {post.matchScoreCard.winner === 1 && (
                  <span className="text-sm mb-1" title="Kazanan">👑</span>
                )}
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-gray-100 line-clamp-1">
                  {post.matchScoreCard.team1Name}
                </span>
                {post.matchScoreCard.winner === 1 && (
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wide">KAZANAN</span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-black/50 px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-inner">
                  <span className={`text-2xl sm:text-3xl font-black ${post.matchScoreCard.winner === 1 ? 'text-emerald-600 dark:text-lime-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {post.matchScoreCard.team1Score}
                  </span>
                  <span className="text-gray-400 font-bold">-</span>
                  <span className={`text-2xl sm:text-3xl font-black ${post.matchScoreCard.winner === 2 ? 'text-emerald-600 dark:text-lime-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {post.matchScoreCard.team2Score}
                  </span>
                </div>
              </div>

              <div className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${post.matchScoreCard.winner === 2 ? 'bg-amber-500/15 border border-amber-500/40 shadow-sm' : 'bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50'}`}>
                {post.matchScoreCard.winner === 2 && (
                  <span className="text-sm mb-1" title="Kazanan">👑</span>
                )}
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-gray-100 line-clamp-1">
                  {post.matchScoreCard.team2Name}
                </span>
                {post.matchScoreCard.winner === 2 && (
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wide">KAZANAN</span>
                )}
              </div>
            </div>
          </div>
        )}

        {post.imageUrl && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <img src={getProxyUrl(post.imageUrl)} alt="Gönderi görseli" className="w-full max-h-[500px] object-cover rounded-2xl border border-gray-100" />
          </div>
        )}
        
        {post.linkedMatchId && (
          <div onClick={(e) => e.stopPropagation()}>
            <EmbeddedMatchCard matchId={post.linkedMatchId} />
          </div>
        )}
        
        {post.poll && (
          <div className="mt-4 flex flex-col gap-3">
            {post.poll.options.map((opt, i) => {
              const isVoted = currentUser && (opt.votedBy || []).includes(currentUser.id);
              const totalVotes = post.poll!.options.reduce((acc, curr) => acc + curr.votes, 0);
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              
              return (
                <button 
                  key={i} 
                  onClick={(e) => handleVote(e, i)}
                  className={`relative overflow-hidden w-full text-left border p-3 rounded-xl font-semibold transition-colors shadow-sm ${isVoted ? 'border-pb-green text-pb-dark dark:text-white' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200'}`}
                >
                  {/* Progress Bar Background */}
                  {totalVotes > 0 && (
                    <div 
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${isVoted ? 'bg-pb-green/30' : 'bg-gray-200/60'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative z-10 flex justify-between items-center px-1">
                    <span>{opt.text}</span>
                    {totalVotes > 0 && <span className="text-sm font-bold">{percentage}%</span>}
                  </div>
                </button>
              );
            })}
            <div className="text-right text-xs text-gray-400 font-medium">
              Toplam oy: {post.poll.options.reduce((acc, curr) => acc + curr.votes, 0)}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700 p-4 bg-gray-50/50 dark:bg-slate-800 flex gap-6 relative z-10">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 font-semibold transition-colors ${isLiked ? 'text-pb-green' : 'text-gray-500 dark:text-gray-400 hover:text-pb-green'}`}
        >
          <Heart className="w-5 h-5 stroke-[2px]" fill={isLiked ? "currentColor" : "none"} /> {post.likedBy?.length || 0}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); if (onOpenComments) onOpenComments(); }}
          className="flex items-center gap-2 font-semibold text-gray-500 dark:text-gray-400 hover:text-pb-blue transition-colors"
        >
          <MessageCircle className="w-5 h-5 stroke-[2px]" /> Yorumlar ({post?.comments?.length || 0})
        </button>
      </div>

      
    </motion.div>
  );
}

export default function Feed({ filterUserId }: { filterUserId?: number | string }) {
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | number | null>(null);
  const router = useRouter();
  const allPosts = useStore(state => state.posts);
  const posts = filterUserId ? allPosts.filter(p => p.authorId === filterUserId) : allPosts;
  const addPost = useStore(state => state.addPost);
  const currentUser = useStore(state => state.currentUser);
  const login = useStore(state => state.login);
  const matches = useStore(state => state.matches);
  const approveMatch = useStore(state => state.approveMatch);
  const rejectMatch = useStore(state => state.rejectMatch);
  const courts = useStore(state => state.courts);

  const users = useStore(state => state.users);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [taggedCourtId, setTaggedCourtId] = useState<number | string | null>(null);
  const [showCourtPicker, setShowCourtPicker] = useState(false);
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Tagged Users (Maç Arkadaşı / Co-Author) State
  const [selectedUserIds, setSelectedUserIds] = useState<(number | string)[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);

  // Match Score Card State (Geçmiş Maç Seçimi)
  const [showMatchPicker, setShowMatchPicker] = useState(false);
  const [showScoreCardForm, setShowScoreCardForm] = useState(false);
  const [scoreTeam1Name, setScoreTeam1Name] = useState("");
  const [scoreTeam2Name, setScoreTeam2Name] = useState("");
  const [scoreTeam1, setScoreTeam1] = useState<number>(11);
  const [scoreTeam2, setScoreTeam2] = useState<number>(8);
  const [scoreMatchType, setScoreMatchType] = useState<'1v1' | '2v2'>('1v1');
  const [scoreWinner, setScoreWinner] = useState<1 | 2>(1);

  const HASHTAG_SUGGESTIONS = [
    "#PartnerArıyorum",
    "#TurnuvaHazırlığı",
    "#EkipmanÖnerisi",
    "#KortDurumu",
    "#MaçSonucu",
    "#PickleballTR",
    "#GününMaçı",
  ];
  
  const blockedUsers = currentUser?.blockedUsers || [];

  const pendingMatches = matches.filter(m => 
    m.status === 'pending' && 
    currentUser && 
    (m.team1.includes(currentUser.id) || m.team2.includes(currentUser.id)) &&
    !(m.approvedBy || []).includes(currentUser.name) &&
    !m.team1.some(id => blockedUsers.includes(id)) &&
    !m.team2.some(id => blockedUsers.includes(id))
  );
  
  const filteredPosts = posts
    .filter(post => !blockedUsers.includes(post.authorId))
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const getUserNames = (ids: number[]) => {
    return ids.map(id => {
      const u = users.find(user => user.id === id);
      return u ? u.name : "Bilinmeyen Kullanıcı";
    }).join(' & ');
  };
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [modalPostId, setModalPostId] = useState<number | string | null>(null);

  useEffect(() => {
    const postIdParam = searchParams.get('postId');
    if (postIdParam) {
      setModalPostId(postIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('postId');
      setModalPostId(id ? id : null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openModal = (id: number | string) => {
    setModalPostId(id);
    window.history.pushState(null, '', `${pathname}?postId=${id}`);
  };

  const closeModal = () => {
    setModalPostId(null);
    window.history.pushState(null, '', pathname);
  };

  const modalPost = posts.find(p => p.id.toString() === modalPostId?.toString());
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState("");

  // Active Word Detection for # and @ Autocomplete Popover
  const words = newPost.split(/\s+/);
  const currentWord = words[words.length - 1] || "";
  const isTypingHashtag = currentWord.startsWith("#");
  const hashtagQuery = isTypingHashtag ? currentWord.slice(1).toLowerCase() : "";
  const isTypingMention = currentWord.startsWith("@");
  const mentionQuery = isTypingMention ? currentWord.slice(1).toLowerCase() : "";

  const normHashQuery = hashtagQuery.toLocaleLowerCase('tr-TR').trim();
  const filteredHashtags = HASHTAG_SUGGESTIONS.filter(t => {
    if (!normHashQuery) return true;
    const tagLower = t.toLocaleLowerCase('tr-TR');
    if (normHashQuery.length === 1) {
      return tagLower.startsWith('#' + normHashQuery) || tagLower.startsWith(normHashQuery);
    }
    return tagLower.includes(normHashQuery) || t.toLowerCase().includes(hashtagQuery.toLowerCase());
  });

  const normMentionQuery = mentionQuery.toLocaleLowerCase('tr-TR').trim();
  const filteredMentionUsers = users
    .filter(u => u.id !== currentUser?.id)
    .filter(u => {
      if (!normMentionQuery) return true;
      const nameLowerTr = u.name.toLocaleLowerCase('tr-TR');
      const nameLowerEn = u.name.toLowerCase();
      const wordsTr = nameLowerTr.split(/\s+/);
      const wordsEn = nameLowerEn.split(/\s+/);

      // Check if any word (First name or Last name) starts with the query
      const startsWithWord = wordsTr.some(w => w.startsWith(normMentionQuery)) || 
                             wordsEn.some(w => w.startsWith(mentionQuery.toLowerCase()));
      
      if (normMentionQuery.length === 1) {
        return startsWithWord;
      }
      return startsWithWord || nameLowerTr.includes(normMentionQuery) || nameLowerEn.includes(mentionQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aLower = a.name.toLocaleLowerCase('tr-TR');
      const bLower = b.name.toLocaleLowerCase('tr-TR');
      const aStarts = aLower.startsWith(normMentionQuery) ? 0 : 1;
      const bStarts = bLower.startsWith(normMentionQuery) ? 0 : 1;
      return aStarts - bStarts;
    });

  const handleInsertHashtag = (tag: string) => {
    const arr = newPost.split(/\s+/);
    if (arr.length > 0 && arr[arr.length - 1].startsWith("#")) {
      arr.pop();
    }
    const updated = [...arr, tag, ""].join(" ").trimStart();
    setNewPost(updated);
    setSelectedCategory(tag);
    textareaRef.current?.focus();
  };

  const handleInsertMention = (user: { id: number | string; name: string }) => {
    const arr = newPost.split(/\s+/);
    if (arr.length > 0 && arr[arr.length - 1].startsWith("@")) {
      arr.pop();
    }
    const cleanName = user.name.replace(/\s+/g, "");
    const updated = [...arr, `@${cleanName}`, ""].join(" ").trimStart();
    setNewPost(updated);
    if (!selectedUserIds.includes(user.id)) {
      setSelectedUserIds([...selectedUserIds, user.id]);
    }
    textareaRef.current?.focus();
  };

  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const PROMPTS = [
    "En sık kullandığın kort bahanesi nedir?",
    "Bugün en iyi vuruşun hangisiydi?",
    "Kortta bugün kimi yendin?",
    "Yeni raketin nasıl hissettiriyor?",
    "Dinker mısın yoksa banger mı?",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  
  useEffect(() => {
    setIsSwapping(true);
    setNewPost("");
    setPostImagePreview(null);
    const timer = setTimeout(() => {
      setIsSwapping(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [currentUser?.id]);
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Poll State
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (indexToRemove: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, index) => index !== indexToRemove));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 1024, 1024, 0.8);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, file.name);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Yükleme başarısız");
      const { url } = await uploadRes.json();
      setPostImagePreview(url);
    } catch (err) {
      console.error(err);
      alert("Görsel yüklenirken hata oluştu.");
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!newPost.trim() && !postImagePreview) return;

    if (!checkTextSafety(newPost)) {
      toast.error("Gönderiniz uygunsuz içerik barındırdığı için paylaşılamadı.", { style: { borderRadius: '12px', background: '#333', color: '#fff' } });
      return;
    }

    const post: Post = {
      id: Date.now(),
      author: currentUser.name,
      authorId: currentUser.id,
      rating: currentUser.singlesRating.toFixed(3),
      content: newPost,
      time: new Date().toISOString(),
      likedBy: [],
      comments: [],
      imageUrl: postImagePreview || undefined,
    };

    if (isPollActive) {
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        alert("Anket en az 2 geçerli seçenek içermelidir.");
        return;
      }
      post.poll = { options: validOptions.map(text => ({ text, votes: 0 })) };
    }

    if (taggedCourtId) {
      const foundCourt = courts.find(c => c.id === taggedCourtId);
      if (foundCourt) {
        post.taggedCourt = { id: foundCourt.id, name: foundCourt.name, city: foundCourt.city };
      }
    }

    if (selectedCategory) {
      post.categoryBadge = selectedCategory;
    }

    if (selectedUserIds.length > 0) {
      post.taggedUsers = selectedUserIds
        .map(id => users.find(u => u.id === id))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
        .map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl }));
    }

    if (showScoreCardForm) {
      post.matchScoreCard = {
        team1Name: scoreTeam1Name.trim() || currentUser.name,
        team2Name: scoreTeam2Name.trim() || "Rakip Takım",
        team1Score: Number(scoreTeam1) || 0,
        team2Score: Number(scoreTeam2) || 0,
        matchType: scoreMatchType,
        winner: scoreWinner
      };
    }

    addPost(post);
    setNewPost("");
    setPostImagePreview(null);
    setTaggedCourtId(null);
    setSelectedCategory("");
    setShowCourtPicker(false);
    setSelectedUserIds([]);
    setShowUserPicker(false);
    setShowMatchPicker(false);
    setShowScoreCardForm(false);
    setScoreTeam1Name("");
    setScoreTeam2Name("");
    setScoreTeam1(11);
    setScoreTeam2(8);
    setIsPostModalOpen(false);
    setIsPollActive(false);
    setPollOptions(["", ""]);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Deep-Linked Post Modal */}
      <AnimatePresence>
        {modalPost && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shrink-0">
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <Share2 className="w-4 h-4" /> {copiedLink ? "Kopyalandı!" : "Bağlantıyı Kopyala"}
                </button>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto no-scrollbar">
                <PostCard post={modalPost} onRequireAuth={() => setShowAuthModal(true)} isModal={true} onOpenComments={() => setActiveCommentPostId(modalPost.id)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Post Social Composer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentUser?.avatarUrl ? (
            <img 
              src={getProxyUrl(currentUser.avatarUrl)} 
              alt={currentUser.name || ""} 
              className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm" 
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pb-green to-lime-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : "🎾"}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="flex-1 text-left px-4.5 py-3 rounded-2xl bg-gray-100/80 dark:bg-slate-900/80 hover:bg-gray-200/80 dark:hover:bg-slate-900 text-gray-500 dark:text-gray-400 font-bold text-xs sm:text-sm transition-all border border-transparent hover:border-pb-green/40 truncate"
          >
            Kortta neler oldu? Deneyimini, fotoğrafını veya maç skorunu paylaş...
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-pb-green text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 hover:scale-105 active:scale-95 shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Paylaş</span>
        </button>
      </motion.div>

      {/* Post Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pb-dark/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shrink-0">
                <h2 className="text-xl font-bold text-pb-dark dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-pb-green rounded-full inline-block"></span>
                  Yeni Bir Şey Paylaş
                </h2>
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 hover:text-pb-dark dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <form id="post-form" onSubmit={handlePostSubmit} className="flex flex-col gap-4">
                  {/* Floating # Hashtag Autocomplete Popover */}
                  {isTypingHashtag && filteredHashtags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-blue-500/10 dark:bg-blue-900/30 rounded-2xl border border-blue-500/30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-300 shrink-0 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" /> Önerilenler:
                      </span>
                      {filteredHashtags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertHashtag(tag)}
                          className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xs shrink-0"
                        >
                          {tag}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Floating @ Mention Autocomplete Popover */}
                  {isTypingMention && filteredMentionUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-purple-500/10 dark:bg-purple-900/30 rounded-2xl border border-purple-500/30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-300 shrink-0 flex items-center gap-1">
                        <AtSign className="w-3.5 h-3.5" /> Kişi Seç:
                      </span>
                      {filteredMentionUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleInsertMention(u)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all shadow-2xs shrink-0"
                        >
                          {u.avatarUrl ? (
                            <img src={getProxyUrl(u.avatarUrl)} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-pb-blue text-white flex items-center justify-center text-[9px] font-black">
                              {u.name.charAt(0)}
                            </span>
                          )}
                          <span>@{u.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <textarea
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 outline-none resize-none min-h-[128px] max-h-[300px] focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark dark:text-white"
                    placeholder={PROMPTS[promptIndex]}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    autoFocus
                  />
                  
                  {postImagePreview && (
                    <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-100">
                      <img src={getProxyUrl(postImagePreview)} alt="Preview" className="w-full max-h-[400px] object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPostImagePreview(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {isPollActive && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                      {pollOptions.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder={`Seçenek ${index + 1}`} 
                            value={opt} 
                            onChange={(e) => handlePollOptionChange(index, e.target.value)} 
                            className="flex-1 border border-gray-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-pb-blue/30 font-medium text-pb-dark dark:text-white text-sm shadow-sm" 
                          />
                          {pollOptions.length > 2 && (
                            <button type="button" onClick={() => handleRemovePollOption(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {pollOptions.length < 5 && (
                        <button type="button" onClick={handleAddPollOption} className="mt-2 text-sm font-bold text-pb-blue hover:text-pb-dark transition-colors text-left flex items-center gap-1 w-max">
                          <PlusCircle className="w-4 h-4" /> Seçenek Ekle
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Seçili Özet Badges (Kompakt / Temiz Görünüm) */}
                  {(taggedCourtId || selectedCategory || selectedUserIds.length > 0) && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      {taggedCourtId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          📍 {courts.find(c => c.id === taggedCourtId)?.name}
                          <button type="button" onClick={() => setTaggedCourtId(null)} className="text-emerald-800 hover:text-red-500 font-extrabold ml-0.5">×</button>
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
                          {selectedCategory}
                          <button type="button" onClick={() => setSelectedCategory("")} className="text-blue-800 hover:text-red-500 font-extrabold ml-0.5">×</button>
                        </span>
                      )}
                      {selectedUserIds.map(id => {
                        const usr = users.find(u => u.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/30">
                            @{usr?.name || id}
                            <button type="button" onClick={() => setSelectedUserIds(selectedUserIds.filter(item => item !== id))} className="text-purple-800 hover:text-red-500 font-extrabold ml-0.5">×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Şık ve Arama Yapılabilir Kort Seçim Alanı */}
                  {showCourtPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700"
                    >
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="🔍 Kort Adı veya Şehir Ara..."
                          value={courtSearchQuery}
                          onChange={(e) => setCourtSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 text-pb-dark dark:text-white"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto flex flex-col gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {courts
                          .filter(c => c.name.toLowerCase().includes(courtSearchQuery.toLowerCase()) || (c.city && c.city.toLowerCase().includes(courtSearchQuery.toLowerCase())))
                          .map((court) => (
                            <button
                              key={court.id}
                              type="button"
                              onClick={() => {
                                setTaggedCourtId(court.id);
                                setShowCourtPicker(false);
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs font-bold ${
                                taggedCourtId === court.id
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : "bg-white dark:bg-slate-800 hover:bg-emerald-500/10 text-pb-dark dark:text-gray-200"
                              }`}
                            >
                              <span>🎾 {court.name}</span>
                              <span className="text-gray-400 text-[10px] font-medium">{court.city}</span>
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Geçmiş Maç Seçimi (Kendi Maçlarımızdan Seç) */}
                  {/* Geçmiş Maç Seçimi (Kendi Maçlarımızdan Seç) */}
                  {showMatchPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 p-3 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-lg"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-lime-400 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-400" /> GEÇMİŞ MAÇLARINDAN SKOR SEÇ:
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          Resmî Skorlar Değiştirilemez
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {(() => {
                          const myMatches = matches.filter(m => currentUser && (m.team1.includes(currentUser.id) || m.team2.includes(currentUser.id)));
                          if (myMatches.length === 0) {
                            return (
                              <div className="p-4 text-center text-xs text-gray-400 font-medium">
                                Henüz kayıtlı bir maçın bulunmuyor. Maç ekledikten sonra skorunu buradan paylaşabilirsin!
                              </div>
                            );
                          }
                          return myMatches.map(m => {
                            const t1Name = m.team1.map(id => users.find(u => u.id === id)?.name || "Oyuncu").join(" & ");
                            const t2Name = m.team2.map(id => users.find(u => u.id === id)?.name || "Oyuncu").join(" & ");
                            const s1 = m.team1Score ?? 11;
                            const s2 = m.team2Score ?? 8;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setScoreTeam1Name(t1Name);
                                  setScoreTeam2Name(t2Name);
                                  setScoreTeam1(s1);
                                  setScoreTeam2(s2);
                                  setScoreWinner(s1 >= s2 ? 1 : 2);
                                  setShowScoreCardForm(true);
                                  setShowMatchPicker(false);
                                }}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs font-bold"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-gray-100">{t1Name} vs {t2Name}</span>
                                  <span className="text-[10px] text-gray-400">{m.date} • {m.location || (m.matchFormat === 'singles' ? '1v1' : '2v2')}</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-lime-500/20 text-lime-400 font-black">
                                  {s1} - {s2}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </motion.div>
                  )}

                  {/* Resmî (Salt Okunur / Değiştirilemez) Skor Kartı Önizlemesi */}
                  {showScoreCardForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3 p-4 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white rounded-2xl border border-emerald-200/80 dark:border-slate-700 shadow-md dark:shadow-lg transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-700 dark:text-lime-400 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" /> RESMÎ MAÇ SKORU KARTI
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            ✔ Doğrulandı
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowScoreCardForm(false);
                              setShowMatchPicker(true);
                            }}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            🔄 Değiştir
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowScoreCardForm(false)}
                            className="text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold px-1.5 text-base"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${scoreWinner === 1 ? 'bg-amber-500/15 border-amber-500/40 shadow-sm' : 'bg-gray-100 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">TAKIM 1</span>
                            {scoreWinner === 1 && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                👑 KAZANAN
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate py-1">
                            {scoreTeam1Name || "Takım 1"}
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-200 dark:border-slate-700/60">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Skor:</span>
                            <div className="px-3.5 py-1.5 bg-white dark:bg-slate-950 text-emerald-600 dark:text-lime-400 font-black text-base rounded-xl border border-gray-200 dark:border-slate-700/80 shadow-sm dark:shadow-inner select-none">
                              {scoreTeam1}
                            </div>
                          </div>
                        </div>

                        <div className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${scoreWinner === 2 ? 'bg-amber-500/15 border-amber-500/40 shadow-sm' : 'bg-gray-100 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">TAKIM 2</span>
                            {scoreWinner === 2 && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                👑 KAZANAN
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate py-1">
                            {scoreTeam2Name || "Takım 2"}
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-200 dark:border-slate-700/60">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Skor:</span>
                            <div className="px-3.5 py-1.5 bg-white dark:bg-slate-950 text-emerald-600 dark:text-lime-400 font-black text-base rounded-xl border border-gray-200 dark:border-slate-700/80 shadow-sm dark:shadow-inner select-none">
                              {scoreTeam2}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-400 hover:text-pb-blue bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full transition-colors" title="Fotoğraf Ekle">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => setIsPollActive(!isPollActive)} className={`p-2 rounded-full transition-colors ${isPollActive ? 'text-pb-green bg-pb-green/10' : 'text-gray-400 hover:text-pb-blue bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'}`} title="Anket Oluştur">
                    <BarChart2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourtPicker(!showCourtPicker);
                      setShowMatchPicker(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      taggedCourtId || showCourtPicker
                        ? "text-emerald-600 bg-emerald-500/15"
                        : "text-gray-400 hover:text-emerald-500 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600"
                    }`}
                    title="Kort Etiketle (Ara)"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = newPost + (newPost.endsWith(" ") || newPost === "" ? "#" : " #");
                      setNewPost(updated);
                      textareaRef.current?.focus();
                    }}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    title="Hashtag (#) Ekle"
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = newPost + (newPost.endsWith(" ") || newPost === "" ? "@" : " @");
                      setNewPost(updated);
                      textareaRef.current?.focus();
                    }}
                    className="p-2 rounded-full text-gray-400 hover:text-purple-500 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    title="Kişi Etiketle (@)"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMatchPicker(!showMatchPicker);
                      setShowCourtPicker(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      showScoreCardForm || showMatchPicker
                        ? "text-amber-500 bg-amber-500/15"
                        : "text-gray-400 hover:text-amber-500 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600"
                    }`}
                    title="Geçmiş Maç / Skor Seç"
                  >
                    <Trophy className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  type="submit"
                  form="post-form"
                  className="bg-pb-green text-pb-dark px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  Paylaş <Send className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {isSwapping ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <div className="w-32 h-4 bg-gray-100 dark:bg-slate-700 rounded-full" />
                      <div className="w-20 h-3 bg-gray-100 dark:bg-slate-700 rounded-full" />
                    </div>
                  </div>
                  <div className="w-full h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl mt-2" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {filteredPosts.map((post) => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onRequireAuth={() => setShowAuthModal(true)} 
                    onClickPost={() => openModal(post.id)} 
                    onOpenComments={() => setActiveCommentPostId(post.id)}
                  />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Intercept Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CommentDrawer isOpen={!!activeCommentPostId} onClose={() => setActiveCommentPostId(null)} postId={activeCommentPostId || ""} />
    </div>
  );
}
