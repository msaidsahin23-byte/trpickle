"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, CourtRecord } from "@/store/useStore";
import { MapPin, Plus, Search, Filter, CheckCircle2, Users, ExternalLink, Sparkles, Navigation, Flame, Zap, ShieldCheck, Sun, DollarSign, Award, X, AlertCircle, Crown } from "lucide-react";
import Link from "next/link";
import { getCourtMayor } from "@/lib/auras-and-mayors";

const CITIES = ["Tümü", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Muğla"];

export default function CourtsPage() {
  const courts = useStore(state => state.courts || []);
  const matches = useStore(state => state.matches || []);
  const users = useStore(state => state.users || []);
  const currentUser = useStore(state => state.currentUser);
  const checkInCourt = useStore(state => state.checkInCourt);
  const checkOutCourt = useStore(state => state.checkOutCourt);
  const submitCourtApplication = useStore(state => state.submitCourtApplication);
  const verifyCourtVote = useStore(state => state.verifyCourtVote);
  const reportCourt = useStore(state => state.reportCourt);
  const deleteCourt = useStore(state => state.deleteCourt);

  const [selectedCity, setSelectedCity] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPartnerOnly, setFilterPartnerOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  // Check-In modal state
  const [checkingInCourtId, setCheckingInCourtId] = useState<number | string | null>(null);

  // New Court form state
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtCity, setNewCourtCity] = useState("İstanbul");
  const [newCourtDistrict, setNewCourtDistrict] = useState("");
  const [newCourtSurface, setNewCourtSurface] = useState<'Akrilik' | 'Sert Zemin' | 'Sentetik Çim' | 'Parke (Kapalı)'>("Akrilik");
  const [newCourtLighting, setNewCourtLighting] = useState(true);
  const [newCourtPublic, setNewCourtPublic] = useState(true);
  const [newCourtMapsUrl, setNewCourtMapsUrl] = useState("");
  const [newCourtPhotoUrl, setNewCourtPhotoUrl] = useState("");
  const [newCourtEvidence, setNewCourtEvidence] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredCourts = courts.filter(court => {
    // Hide courts reported >= 3 times by community
    if ((court.reportedBy || []).length >= 3) return false;

    const matchesCity = selectedCity === "Tümü" || court.city === selectedCity;
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (court.district && court.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      court.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPartner = !filterPartnerOnly || (court.checkedInUsers && court.checkedInUsers.some(u => u.lookingForPartner));

    return matchesCity && matchesSearch && matchesPartner;
  });

  const activeCourtsCount = courts.filter(c => (c.checkedInUsers || []).length > 0).length;
  const totalCheckedInPlayers = courts.reduce((acc, c) => acc + (c.checkedInUsers || []).length, 0);

  const handleCreateCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim() || !newCourtCity.trim()) {
      setErrorMsg("Kort adı ve şehir zorunludur.");
      return;
    }
    if (!newCourtMapsUrl.trim()) {
      setErrorMsg("Doğrulama ve güvenlik için Google Haritalar linki zorunludur.");
      return;
    }
    submitCourtApplication({
      name: newCourtName.trim(),
      city: newCourtCity.trim(),
      district: newCourtDistrict.trim() || undefined,
      surface: newCourtSurface,
      lighting: newCourtLighting,
      isPublic: newCourtPublic,
      courtCount: 2,
      mapsUrl: newCourtMapsUrl.trim(),
      photoUrl: newCourtPhotoUrl.trim() || undefined,
      evidenceNotes: newCourtEvidence.trim() || undefined,
      submittedBy: currentUser ? { userId: currentUser.id, userName: currentUser.name } : { userId: 0, userName: "Misafir Oyuncu" }
    });
    setShowAddModal(false);
    setNewCourtName("");
    setNewCourtDistrict("");
    setNewCourtMapsUrl("");
    setNewCourtPhotoUrl("");
    setNewCourtEvidence("");
    setErrorMsg("");
    setSuccessBanner("Başvurunuz alındı! Yönetici (Admin) tarafından konum, harita ve fotoğraf denetimi yapıldıktan sonra rehbere eklenecektir.");
  };

  const handleCheckIn = (courtId: number | string, lookingForPartner: boolean) => {
    checkInCourt(courtId, lookingForPartner);
    setCheckingInCourtId(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto flex flex-col gap-8"
      >
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-500/20">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold w-fit">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                CANLI KORT RADARI & REHBERİ
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Türkiye Pickleball Kort Haritası & &quot;Şu An Korttayım&quot;
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Nerede oynayabilirsin ve şu an kortta kimler var? Başlangıç çekirdek listesi ve Türkiye&apos;nin dört bir yanından oyuncuların eklediği kortlarla canlı radar! Korta gittiğinde tek tıkla check-in yap, partner aradığını tüm akışa duyur.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition-all self-start md:self-center whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Yeni Kort Başvurusu Yap
            </button>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black">{courts.length}</div>
                <div className="text-xs text-gray-400 font-medium">Kayıtlı Kort</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black">{activeCourtsCount}</div>
                <div className="text-xs text-gray-400 font-medium">Aktif Kort</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black">{totalCheckedInPlayers}</div>
                <div className="text-xs text-gray-400 font-medium">Şu An Kortta Oyuncu</div>
              </div>
            </div>
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-extrabold">Yönetici (Admin) Yetkisi Aktif: </span>
                Gelen yeni kort başvurularını, harita & fotoğraf kanıtlarını denetleyebilirsiniz.
              </div>
            </div>
            <Link
              href="/admin?tab=courts"
              className="px-4 py-2 bg-white text-emerald-900 rounded-xl font-extrabold text-xs hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              👑 Denetim Paneline Git
            </Link>
          </div>
        )}

        {successBanner && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold">{successBanner}</span>
            <button
              onClick={() => setSuccessBanner("")}
              className="p-1 hover:bg-emerald-200/40 rounded-full text-emerald-700 dark:text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          {/* City Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCity === city
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search Input & Partner Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kort veya ilçe ara..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 text-gray-800 dark:text-white"
              />
            </div>

            <button
              onClick={() => setFilterPartnerOnly(!filterPartnerOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                filterPartnerOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sadece Partner Arayanlar
            </button>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => {
            const checkedInList = court.checkedInUsers || [];
            const isCheckedInHere = currentUser && checkedInList.some(u => u.userId === currentUser.id);
            const lookingForPartnerCount = checkedInList.filter(u => u.lookingForPartner).length;
            const mayorInfo = getCourtMayor(court.name, matches, users);

            return (
              <motion.div
                key={court.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border transition-all flex flex-col justify-between gap-5 shadow-sm hover:shadow-md ${
                  isCheckedInHere
                    ? 'border-emerald-500/80 dark:border-emerald-500/80 ring-2 ring-emerald-500/20'
                    : checkedInList.length > 0
                    ? 'border-amber-400/60 dark:border-amber-500/50'
                    : 'border-gray-100 dark:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-extrabold">
                        {court.city}
                      </span>
                      {court.district && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          {court.district}
                        </span>
                      )}
                    </div>

                    {checkedInList.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-xs font-extrabold animate-pulse">
                        <Flame className="w-3.5 h-3.5" />
                        {checkedInList.length} Oyuncu Kortta
                      </span>
                    )}
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-2">
                    {court.isVerified !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Doğrulanmış Resmî Kort
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-black">
                        ⏳ Topluluk Önerisi (Onay Bekliyor)
                      </span>
                    )}
                  </div>

                  {/* Court Title */}
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug mt-1">
                    {court.name}
                  </h3>

                  {/* Ayın Lideri (Court Mayor) */}
                  <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-400/40 dark:border-amber-500/40 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm shrink-0">
                        <Crown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider truncate">
                          👑 AYIN LİDERİ ({mayorInfo.monthName.toUpperCase()} AYI)
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {mayorInfo.user ? (
                            <>
                              {mayorInfo.user.name}
                              <span className="ml-1 text-amber-600 dark:text-amber-400 font-black">
                                🏆 {mayorInfo.winsThisMonth} Galibiyet
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Bu Ay Henüz Lider Yok</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div
                      className="p-1 rounded-full text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-help transition-colors shrink-0 ml-2"
                      title="Bu unvan her ayın 1'inde sıfırlanır. Ayın Lideri olmak için bu kortta maç kazan!"
                    >
                      <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-amber-500/20">ℹ️</span>
                    </div>
                  </div>

                  {/* Checked In Users List */}
                  {checkedInList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/80 flex flex-col gap-2">
                      <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                        Şu An Korttaki Oyuncular:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {checkedInList.map((cu) => (
                          <div
                            key={cu.userId}
                            className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/60 rounded-xl px-3 py-2 border border-gray-100 dark:border-slate-700/60"
                          >
                            <Link
                              href={`/profile/${cu.userId}`}
                              className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 hover:text-emerald-500 transition-colors"
                            >
                              {cu.userName}
                            </Link>
                            {cu.lookingForPartner ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-black">
                                🏓 Partner Arıyor
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium">Antrenman/Maçta</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-gray-100 dark:border-slate-700/80">
                  <div className="flex items-center justify-between gap-2">
                    {court.mapsUrl && (
                      <a
                        href={court.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Haritada Aç
                      </a>
                    )}
                    {court.addedBy && (
                      <span className="text-[11px] text-gray-400">
                        Ekleyen: <span className="font-semibold">{court.addedBy}</span>
                      </span>
                    )}
                  </div>

                  {court.isVerified === false && currentUser && (
                    <div className="flex items-center justify-between gap-2 py-1.5 px-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        Bu kortu doğruladınız mı?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyCourtVote(court.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg transition-colors"
                          title="Gerçek bir kort, burada oynadım"
                        >
                          ✓ Doğrula (+1)
                        </button>
                        <button
                          onClick={() => reportCourt(court.id)}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-lg transition-colors"
                          title="Hatalı veya sahte kort"
                        >
                          🚩 Raporla
                        </button>
                      </div>
                    </div>
                  )}

                  {currentUser ? (
                    isCheckedInHere ? (
                      <button
                        onClick={() => checkOutCourt(court.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                      >
                        📍 Korttan Çıkış Yap
                      </button>
                    ) : (
                      <button
                        onClick={() => setCheckingInCourtId(court.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                      >
                        📍 Korttayım (Check-in Yap)
                      </button>
                    )
                  ) : (
                    <Link
                      href="/auth"
                      className="w-full text-center py-2.5 px-4 rounded-xl font-bold text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                    >
                      Check-in için Giriş Yap
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCourts.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-700 flex flex-col items-center gap-4">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <div>
              <h3 className="text-lg font-black text-gray-800 dark:text-white">Aradığınız kriterde kort bulunamadı</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Farklı bir şehir/filtre seçebilir veya hemen sağ üstten yeni kort ekleyebilirsiniz!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-emerald-500 transition-all"
            >
              + Yeni Kort Ekle
            </button>
          </div>
        )}
      </motion.div>

      {/* Check-In Choice Modal */}
      <AnimatePresence>
        {checkingInCourtId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Korta Check-in Yap
                </h3>
                <button
                  onClick={() => setCheckingInCourtId(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Kortta bulunuş amacınızı seçin. Partner arıyorum seçeneği diğer oyunculara bildirim ve akış duyurusu olarak gönderilecektir!
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleCheckIn(checkingInCourtId, true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black p-4 rounded-2xl shadow-md hover:scale-[1.02] transition-transform text-left"
                >
                  <Sparkles className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <div className="text-base">Korttayım & Partner Arıyorum! 🏓</div>
                    <div className="text-xs text-amber-100 font-medium">
                      Akışta duyuru yayınlanır, yakındaki oyuncular haberdar olur
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleCheckIn(checkingInCourtId, false)}
                  className="flex items-center gap-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold p-4 rounded-2xl transition-colors text-left"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="text-base">Sadece Korttayım (Antrenman/Maç)</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      Sessiz check-in, sadece kort kartında adınız görünür
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Court Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    Yeni Kort Öner & Başvuru Yap
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Başvurunuz sahte içerik önlemi olarak yöneticiler (Admin) tarafından onaylandıktan sonra yayınlanacaktır.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateCourt} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Kort / Tesis Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourtName}
                    onChange={e => setNewCourtName(e.target.value)}
                    placeholder="Örn: Caddebostan Sahil Kortları"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                      Şehir *
                    </label>
                    <select
                      value={newCourtCity}
                      onChange={e => setNewCourtCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                    >
                      {CITIES.filter(c => c !== "Tümü").map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                      İlçe / Semt
                    </label>
                    <input
                      type="text"
                      value={newCourtDistrict}
                      onChange={e => setNewCourtDistrict(e.target.value)}
                      placeholder="Örn: Kadıköy"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>



                <div>
                  <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Google Haritalar Konum Linki (Zorunlu) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newCourtMapsUrl}
                    onChange={e => setNewCourtMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-medium text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Kort Fotoğrafı URL (İsteğe bağlı)
                  </label>
                  <input
                    type="url"
                    value={newCourtPhotoUrl}
                    onChange={e => setNewCourtPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-medium text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Yönetici İçin Not / Kanıt Açıklaması
                  </label>
                  <textarea
                    rows={2}
                    value={newCourtEvidence}
                    onChange={e => setNewCourtEvidence(e.target.value)}
                    placeholder="Örn: Kulüp içinde yeni açıldı, haftanın 7 günü halka açıktır..."
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-medium text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                  >
                    Kort Başvurusunu Gönder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
