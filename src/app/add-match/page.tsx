"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, User as UserIcon, CheckCircle2, AlertCircle, Trophy, Activity, Check, ChevronDown, Search, Loader2, QrCode, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import { calculateNewRatings } from "@/lib/rating-engine";
import { useStore, User } from "@/store/useStore";
import MatchLobbyQrCreateModal from "@/components/MatchLobbyQrCreateModal";

function PlayerSelect({ value, onChange, placeholder, matchFormat, disabledPlayerIds = [] }: { 
  value: User | null;
  onChange: (p: User) => void;
  placeholder: string;
  matchFormat: "singles" | "doubles";
  disabledPlayerIds?: (number | string)[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const users = useStore(state => state.users);
  
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) && 
    (!disabledPlayerIds.includes(u.id) || (value && u.id === value.id))
  );
  
  const getRating = (u: User) => matchFormat === "singles" ? u.singlesRating : u.doublesRating;

  return (
    <div className="relative">
      <div 
        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-pb-dark dark:text-white cursor-pointer flex items-center justify-between shadow-sm hover:border-pb-blue/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="w-6 h-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-pb-dark dark:text-gray-300 mb-2 opacity-50" />
          </div>
        </div>
        {value ? (
          <div className="flex items-center gap-2">
            <span className="font-bold">{value.name}</span>
            <span className="text-xs bg-pb-green/20 text-pb-dark dark:text-white px-2 py-0.5 rounded-md font-bold">{getRating(value).toFixed(3)}</span>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto"
          >
            <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700 z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Oyuncu ara..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-pb-blue/50 text-pb-dark dark:text-white font-medium"
                />
              </div>
            </div>
            <div className="py-1">
              {filtered.map(u => (
                <div 
                  key={u.id}
                  onClick={() => { onChange(u); setIsOpen(false); setSearch(""); }}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-pb-dark dark:text-white text-sm">{u.name}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{getRating(u).toFixed(3)}</span>
                </div>
              ))}
              {filtered.length === 0 && <div className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Oyuncu bulunamadı</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddMatchPage() {
  const [matchFormat, setMatchFormat] = useState<"singles" | "doubles">("singles");
  const [scoringSystem, setScoringSystem] = useState<"classic" | "rally">("classic");
  
  const [team1Players, setTeam1Players] = useState<(User | null)[]>([null]);
  const [team2Players, setTeam2Players] = useState<(User | null)[]>([null]);
  
  const [team1Score, setTeam1Score] = useState<string>("");
  const [team2Score, setTeam2Score] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSelectedFormat, setHasSelectedFormat] = useState(false);
  const [showMatchLobbyQrModal, setShowMatchLobbyQrModal] = useState(false);
  const [showCourtAutocomplete, setShowCourtAutocomplete] = useState(false);
  
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const courts = useStore(state => state.courts || []);

  useEffect(() => {
    if (currentUser) {
      setTeam1Players(prev => {
        if (prev[0] === null) {
          const newArr = [...prev];
          newArr[0] = currentUser;
          return newArr;
        }
        return prev;
      });
    }
  }, [currentUser]);

  let allSelectedPlayerIds = [...team1Players, ...team2Players]
    .filter(p => p !== null)
    .map(p => p!.id);

  if (currentUser?.blockedUsers) {
    allSelectedPlayerIds = [...allSelectedPlayerIds, ...currentUser.blockedUsers];
  }

  const handleFormatChange = (format: "singles" | "doubles") => {
    setHasSelectedFormat(true);
    setMatchFormat(format);
    if (format === "singles") {
      setTeam1Players([team1Players[0] || null]);
      setTeam2Players([team2Players[0] || null]);
    } else {
      setTeam1Players([team1Players[0] || null, team1Players[1] || null]);
      setTeam2Players([team2Players[0] || null, team2Players[1] || null]);
    }
  };

  const handlePlayerScanned = (scannedUser: User, doublesRole?: "team1_partner" | "team2") => {
    if (matchFormat === "singles") {
      setTeam2Players([scannedUser]);
    } else {
      if (doublesRole === "team1_partner") {
        setTeam1Players([team1Players[0] || null, scannedUser]);
      } else {
        if (!team2Players[0]) {
          setTeam2Players([scannedUser, team2Players[1] || null]);
        } else {
          setTeam2Players([team2Players[0] || null, scannedUser]);
        }
      }
    }
  };

  const validateScore = (allowEmptyPlayers = false) => {
    const s1 = parseInt(team1Score);
    const s2 = parseInt(team2Score);

    if (isNaN(s1) || isNaN(s2)) return "Lütfen her iki takımın da skorunu giriniz.";
    if (s1 === s2) return "Kural İhlali: Pickleball maçları berabere bitemez.";
    
    if (!allowEmptyPlayers && (team1Players.includes(null) || team2Players.includes(null))) {
      setError("Lütfen her iki takım için de tüm oyuncuları seçin.");
      setIsSubmitting(false);
      return "Lütfen takımlardaki tüm oyuncuları seçiniz.";
    }

    const w = Math.max(s1, s2);
    const l = Math.min(s1, s2);
    
    const targetScore = scoringSystem === "classic" ? 11 : 21;
    const rulesetName = scoringSystem === "classic" ? "Pickleball" : "Ralli";
    
    if (w < targetScore) return `Kural İhlali: Maçın bitmesi için en az ${targetScore} sayıya ulaşılmalıdır.`;
    if (w - l < 2) return "Kural İhlali: Galibiyet için en az 2 sayı fark olmalıdır.";
    
    if (w - l > 2 && w > targetScore) {
      const expectedW = Math.max(targetScore, l + 2);
      return `Geçersiz Skor: ${rulesetName} kurallarına göre maç ${expectedW}-${l}'de bitmiş olmalıydı. Lütfen skoru kontrol edin.`;
    }
    
    return null;
  };

  const handleCreateQrLobby = () => {
    if (!location.trim()) {
      setError("Lütfen maçın oynandığı konum / kort adını girin veya kayıtlı kortlardan seçin.");
      return;
    }
    if (!team1Score || !team2Score) {
      setError("Lütfen maç skorunu eksiksiz girin.");
      return;
    }
    const validationError = validateScore(true);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setShowMatchLobbyQrModal(true);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    if (!location.trim()) {
      setError("Lütfen maçın oynandığı konum / kort adını girin veya kayıtlı kortlardan seçin.");
      setIsSubmitting(false);
      return;
    }

    const validationError = validateScore();
    if (!team1Score || !team2Score) {
      setError("Lütfen maç skorunu eksiksiz girin.");
      setIsSubmitting(false);
      return;
    }
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }
    if (parseInt(team1Score) < 0 || parseInt(team2Score) < 0) {
      setError("Skor eksi (-) değer olamaz.");
      setIsSubmitting(false);
      return;
    }

    setError(null);
    
    const addMatch = useStore.getState().addMatch;

    const matchRecord: any = {
      id: Date.now(),
      date: new Date().toISOString(),
      matchFormat,
      team1: team1Players.map(p => p!.id),
      team2: team2Players.map(p => p!.id),
      team1Score: parseInt(team1Score),
      team2Score: parseInt(team2Score),
      eloChange: { team1Change: 0, team2Change: 0, team1Changes: [], team2Changes: [] },
      status: 'pending',
      submittedBy: currentUser?.name || 'Bilinmeyen Kullanıcı',
      approvedBy: [currentUser?.name || 'Bilinmeyen Kullanıcı'],
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(eventName.trim() ? { eventName: eventName.trim() } : {})
    };
    
    addMatch(matchRecord);

    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/feed" className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-pb-dark dark:text-white shadow-sm hover:text-pb-blue transition-colors">
            <Trophy className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-pb-dark dark:text-white tracking-tight">Yeni Maç Skoru</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Oynadığın maçı sisteme kaydet ve algoritmayı başlat.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-16 shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-pb-dark mb-6">
                <Check className="w-12 h-12 stroke-[3px]" />
              </div>
              <h2 className="text-3xl font-extrabold text-pb-dark dark:text-white mb-2">Onay Bekleniyor!</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-8">Maç skoru sisteme girildi. Ancak Anti-Hile kuralı gereği, Elo puanlarının güncellenmesi için maçtaki diğer tüm oyuncuların bu skoru onaylaması gerekmektedir.</p>

              <Link href="/feed" className="px-8 py-4 bg-gray-100 dark:bg-slate-700 text-pb-dark dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Akışa Dön
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              
              {/* Step 1: Match Format */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Adım 1: Maç Formatı</h3>
                  {!hasSelectedFormat && (
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30 animate-pulse">
                      👆 Önce Seçim Yapın
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button 
                    onClick={() => handleFormatChange("singles")}
                    className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 font-bold text-lg ${matchFormat === "singles" ? 'border-pb-green bg-pb-green/5 dark:bg-pb-green/10 text-pb-dark dark:text-white' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'}`}
                  >
                    <UserIcon className="w-8 h-8" />
                    Tekli Maç (1v1)
                    {matchFormat === "singles" && (
                      <motion.div layoutId="formatActive" className="absolute inset-0 border-2 border-pb-green rounded-2xl" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleFormatChange("doubles")}
                    className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 font-bold text-lg ${matchFormat === "doubles" ? 'border-pb-green bg-pb-green/5 dark:bg-pb-green/10 text-pb-dark dark:text-white' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'}`}
                  >
                    <Users className="w-8 h-8" />
                    Eşli Maç (2v2)
                    {matchFormat === "doubles" && (
                      <motion.div layoutId="formatActive" className="absolute inset-0 border-2 border-pb-green rounded-2xl" />
                    )}
                  </button>
                </div>
              </div>

              {!hasSelectedFormat ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border-2 border-lime-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 shadow-xl"
                >
                  <div className="w-14 h-14 rounded-2xl bg-lime-500/20 text-lime-400 flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white">Lütfen Önce 1v1 mi 2v2 mi Olduğunu Seçin</h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md font-medium">
                    QR kod okutma özelliği ve oyuncu seçimi kilitlidir. Yukarıdaki butonlardan maç türünü seçtiğinizde QR okuyucu açılacaktır.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Step 2: Scoring System */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Adım 2: Puanlama Sistemi</h3>
                    <div className="flex bg-gray-50 dark:bg-slate-700 p-2 rounded-2xl relative">
                      <button 
                        onClick={() => setScoringSystem("classic")}
                        className={`flex-1 py-3 text-center font-bold rounded-xl transition-colors relative z-10 ${scoringSystem === "classic" ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
                      >
                        Klasik Puanlama (Side-out)
                      </button>
                      <button 
                        onClick={() => setScoringSystem("rally")}
                        className={`flex-1 py-3 text-center font-bold rounded-xl transition-colors relative z-10 ${scoringSystem === "rally" ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white'}`}
                      >
                        Ralli Puanlama (Rally)
                      </button>
                      <motion.div 
                        initial={false}
                        animate={{ x: scoringSystem === "classic" ? 0 : "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-2 bottom-2 left-2 w-[calc(50%-0.5rem)] bg-pb-dark dark:bg-slate-600 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Step 4: Scoring Engine */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Adım 3: Akıllı Skor Motoru</h3>
                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-gray-500 dark:text-gray-400">1. Takım Skoru</span>
                    <input 
                      type="number" 
                      min="0"
                      value={team1Score}
                      onChange={(e) => { setTeam1Score(e.target.value); setError(null); }}
                      className="w-24 h-24 text-center text-4xl font-extrabold text-pb-dark dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-3xl outline-none focus:ring-2 focus:ring-pb-blue/30 focus:border-pb-blue transition-all"
                    />
                  </div>
                  <div className="text-4xl font-extrabold text-gray-300 dark:text-gray-600">-</div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-gray-500 dark:text-gray-400">2. Takım Skoru</span>
                    <input 
                      type="number" 
                      min="0"
                      value={team2Score}
                      onChange={(e) => { setTeam2Score(e.target.value); setError(null); }}
                      className="w-24 h-24 text-center text-4xl font-extrabold text-pb-dark dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-3xl outline-none focus:ring-2 focus:ring-pb-blue/30 focus:border-pb-blue transition-all"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 5: Court & Context */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Adım 4: Konum & Kort Seçimi (Zorunlu)
                  </h3>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                    Zorunlu Alan *
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>Konum / Kort Adı <span className="text-red-500">*</span></span>
                      </span>
                      <span className="text-xs font-medium text-gray-400">Yazmaya başladığınızda kayıtlı kortlar önerilir</span>
                    </label>

                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Örn: Caddebostan Sahil Kortları veya Levent Tenis Kulübü..."
                        value={location}
                        onFocus={() => setShowCourtAutocomplete(true)}
                        onBlur={() => setTimeout(() => setShowCourtAutocomplete(false), 200)}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setShowCourtAutocomplete(true);
                        }}
                        className={`w-full bg-gray-50 dark:bg-slate-700/80 border rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-pb-blue/30 focus:border-pb-blue transition-all font-bold text-pb-dark dark:text-white ${
                          !location.trim() ? "border-amber-300 dark:border-amber-500/40" : "border-emerald-400 dark:border-emerald-500/60"
                        }`}
                      />

                      {/* Oto-Tamamlama Açılır Öneri Listesi (Scrollbarsız, Şık ve Temiz) */}
                      <AnimatePresence>
                        {showCourtAutocomplete && courts.length > 0 && (
                          (() => {
                            const q = location.trim().toLocaleLowerCase("tr-TR");
                            const matchingCourts = courts
                              .filter((court) => {
                                if (!q) return true;
                                const full = `${court.name} ${court.city || ""}`.toLocaleLowerCase("tr-TR");
                                return full.includes(q);
                              })
                              .slice(0, 6);

                            if (matchingCourts.length === 0) return null;

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-2 flex flex-col gap-1"
                              >
                                <div className="px-3 py-1.5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                  <span>ÖNERİLEN KORTLAR</span>
                                  <span>{matchingCourts.length} Sonuç</span>
                                </div>
                                {matchingCourts.map((court) => {
                                  const courtLabel = `${court.name}${court.city ? ` (${court.city})` : ""}`;
                                  const isSelected = location === courtLabel;
                                  return (
                                    <button
                                      key={court.id}
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setLocation(courtLabel);
                                        setShowCourtAutocomplete(false);
                                      }}
                                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 group ${
                                        isSelected
                                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                                          : "hover:bg-gray-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-gray-200 font-semibold"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                          <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="truncate">
                                          <div className="text-sm truncate">{court.name}</div>
                                          {court.city && (
                                            <div className="text-[11px] text-gray-400 font-medium">{court.city}</div>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 shrink-0">
                                        Seç
                                      </span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            );
                          })()
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                      Etkinlik / Turnuva Adı (İsteğe Bağlı)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Yaz Turnuvası 2026"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pb-blue/30 focus:border-pb-blue transition-all font-medium text-pb-dark dark:text-white"
                    />
                  </div>
                </div>

                {/* QR Oluştur & Oyuncular Taraftan Katılsın */}
                <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-blue-500/15 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shrink-0">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-base">
                        QR Kod Oluştur (Kişi Seçmeden Hızlı Kayıt)
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Kişi seçmeden bu QR&apos;ı oluşturun. Okutan oyuncular tarafını seçip maçı otomatik onaylı kaydetsin!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateQrLobby}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Oluştur</span>
                  </button>
                </div>

                {/* Step 3: Players */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Adım 5: Oyuncular</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Team 1 */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                    <h4 className="font-extrabold text-pb-dark dark:text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pb-blue"></span> 1. Takım</h4>
                    <div className="flex flex-col gap-3">
                      {team1Players.map((player, index) => (
                        index === 0 && currentUser ? (
                          <div key={`t1-${index}-locked`} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 flex justify-between items-center opacity-80 cursor-not-allowed">
                            <span className="font-bold text-pb-dark dark:text-white text-sm">{currentUser.name} <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">(Sen)</span></span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{(matchFormat === 'singles' ? currentUser.singlesRating : currentUser.doublesRating)?.toFixed(3)}</span>
                          </div>
                        ) : (
                          <PlayerSelect 
                            key={`t1-${index}`}
                            placeholder="Oyuncu Seç..."
                            value={player}
                            matchFormat={matchFormat}
                            disabledPlayerIds={allSelectedPlayerIds}
                            onChange={(p) => {
                              const newArr = [...team1Players];
                              newArr[index] = p;
                              setTeam1Players(newArr);
                            }}
                          />
                        )
                      ))}
                    </div>
                  </div>
                  
                  {/* Team 2 */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                    <h4 className="font-extrabold text-pb-dark dark:text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> 2. Takım</h4>
                    <div className="flex flex-col gap-3">
                      {team2Players.map((player, index) => (
                        <PlayerSelect 
                          key={`t2-${index}`}
                          placeholder="Oyuncu Seç..."
                          value={player}
                          matchFormat={matchFormat}
                          disabledPlayerIds={allSelectedPlayerIds}
                          onChange={(p) => {
                            const newArr = [...team2Players];
                            newArr[index] = p;
                            setTeam2Players(newArr);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-2xl font-extrabold text-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4 ${
                    isSubmitting ? 'bg-pb-green/70 text-pb-dark cursor-not-allowed' : 'bg-pb-green text-pb-dark hover:bg-pb-green/90 hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Kaydediliyor... Lütfen Bekleyin
                    </>
                  ) : (
                    <>Manuel Maçı Kaydet</>
                  )}
                </button>
                </div>
              </>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        <MatchLobbyQrCreateModal
          isOpen={showMatchLobbyQrModal}
          onClose={() => setShowMatchLobbyQrModal(false)}
          payloadJSON={JSON.stringify({
            type: "match_lobby",
            format: matchFormat,
            creatorId: currentUser?.id || 0,
            creatorName: currentUser?.name || "Oyuncu",
            date: new Date().toISOString().split("T")[0],
            location: location.trim() || "Kort Belirtilmedi",
            team1Score: parseInt(team1Score) || 11,
            team2Score: parseInt(team2Score) || 8,
            qrId: Math.random().toString(36).substring(2, 15),
            maxUses: matchFormat === "singles" ? 1 : 3,
          })}
          format={matchFormat}
          team1Score={parseInt(team1Score) || 11}
          team2Score={parseInt(team2Score) || 8}
          location={location.trim() || "Kort Belirtilmedi"}
        />
      </div>
    </div>
  );
}
