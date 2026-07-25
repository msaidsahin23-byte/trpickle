"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Trash2, History, MessageSquare, Users, MapPin, CheckCircle, ExternalLink } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ClientTime } from "@/components/ClientTime";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useStore(state => state.currentUser);
  const matches = useStore(state => state.matches);
  const posts = useStore(state => state.posts);
  const users = useStore(state => state.users);
  const courtSubmissions = useStore(state => state.courtSubmissions || []);
  const courts = useStore(state => state.courts || []);
  const deleteMatch = useStore(state => state.deleteMatch);
  const deletePost = useStore(state => state.deletePost);
  const deleteUser = useStore(state => state.deleteUser);
  const approveCourtSubmission = useStore(state => state.approveCourtSubmission);
  const rejectCourtSubmission = useStore(state => state.rejectCourtSubmission);
  const deleteCourt = useStore(state => state.deleteCourt);
  const adminVerifyCourtToggle = useStore(state => state.adminVerifyCourtToggle);
  const togglePinPost = useStore(state => state.togglePinPost);
  const adminCreateOfficialPost = useStore(state => state.adminCreateOfficialPost);
  const adminClearOldCheckIns = useStore(state => state.adminClearOldCheckIns);
  const adminUpdateUserRole = useStore(state => state.adminUpdateUserRole);

  const getUserNamesText = (ids: (number | string)[]) => {
    return ids.map((id) => {
      const u = users.find(user => user.id === id);
      return u ? u.name : "Bilinmeyen Kullanıcı";
    }).join(" & ");
  };

  const pendingSubmissions = courtSubmissions.filter(s => s.status === 'pending');

  const [activeTab, setActiveTab] = useState<"matches" | "posts" | "users" | "courts">("courts");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "courts" || tabParam === "matches" || tabParam === "posts" || tabParam === "users") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-100">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-pb-dark tracking-tight">Moderatör Paneli</h1>
              <p className="text-gray-500 font-medium mt-1">Sistem ve topluluk yönetim merkezi</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
            <button 
              onClick={() => setActiveTab("courts")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "courts" ? 'bg-white text-pb-dark shadow-sm' : 'text-gray-500 hover:text-pb-dark'}`}
            >
              <MapPin className="w-4 h-4" /> Kort Başvuruları & Denetim
              {pendingSubmissions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("matches")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "matches" ? 'bg-white text-pb-dark shadow-sm' : 'text-gray-500 hover:text-pb-dark'}`}
            >
              <History className="w-4 h-4" /> Maç Kayıtları
            </button>
            <button 
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "posts" ? 'bg-white text-pb-dark shadow-sm' : 'text-gray-500 hover:text-pb-dark'}`}
            >
              <MessageSquare className="w-4 h-4" /> İçerik Yönetimi
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "users" ? 'bg-white text-pb-dark shadow-sm' : 'text-gray-500 hover:text-pb-dark'}`}
            >
              <Users className="w-4 h-4" /> Kullanıcı Yönetimi
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "courts" ? (
            <motion.div 
              key="courts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* SECTION A: Pending Submissions */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-pb-dark flex items-center gap-2">
                      Onay Bekleyen Kort Öneri Başvuruları
                      <span className="bg-amber-100 text-amber-700 text-sm font-black px-2.5 py-0.5 rounded-full">
                        {pendingSubmissions.length} Başvuru
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Kullanıcılar tarafından önerilen yeni kortları harita ve fotoğraf kanıtlarına göre inceleyip onaylayabilir veya reddedebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {pendingSubmissions.length === 0 && (
                    <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Şu an onay bekleyen kort başvurusu bulunmuyor.
                    </div>
                  )}

                  {pendingSubmissions.map(sub => (
                    <div key={sub.id} className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-pb-dark">{sub.name}</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 font-extrabold text-xs">
                              ONAY BEKLİYOR
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-bold mt-1">
                            📍 {sub.city} {sub.district ? `/ ${sub.district}` : ""} — Zemin: {sub.surface} — Aydınlatma: {sub.lighting ? "Var" : "Yok"}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          Başvuran: <span className="font-bold text-gray-700">{sub.submittedBy.userName}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {sub.mapsUrl && (
                          <a
                            href={sub.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Google Haritalar Konumunu İncele
                          </a>
                        )}
                        {sub.photoUrl && (
                          <a
                            href={sub.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Kort Fotoğrafını Aç
                          </a>
                        )}
                      </div>

                      {sub.evidenceNotes && (
                        <div className="p-3 rounded-xl bg-white border border-gray-100 text-xs text-gray-600 font-medium">
                          <span className="font-bold text-gray-800">Başvuru Kanıt / Açıklaması:</span> {sub.evidenceNotes}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-500/10">
                        <button
                          onClick={() => {
                            if (confirm(`"${sub.name}" başvurusunu reddetmek ve listeden kaldırmak istediğinize emin misiniz?`)) {
                              rejectCourtSubmission(sub.id, "Yönetici tarafından uygun görülmedi.");
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                        >
                          ✕ Reddet ve Sil
                        </button>
                        <button
                          onClick={() => {
                            approveCourtSubmission(sub.id);
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          ✓ Onayla ve Haritada Yayınla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: Live Courts Directory */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-pb-dark flex items-center gap-2">
                      Yayındaki Tüm Kortlar & Moderasyon
                      <span className="bg-gray-100 text-gray-600 text-sm font-black px-2.5 py-0.5 rounded-full">
                        {courts.length} Sahada
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Platformdaki sahaların doğrulama durumunu değiştirebilir, sahte veya raporlanan kortları tek tıkla silebilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      adminClearOldCheckIns();
                      alert("3 saati aşan eski check-in kayıtları temizlendi!");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    🧹 Eski Check-In&apos;leri Temizle (3+ Saat)
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {courts.map(court => {
                    const reportCount = (court.reportedBy || []).length;
                    return (
                      <div
                        key={court.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          reportCount >= 3
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-pb-dark text-sm">{court.name}</span>
                            {court.isVerified ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-extrabold text-[10px]">
                                🛡️ Resmî Doğrulanmış
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 font-bold text-[10px]">
                                ⏳ Topluluk Önerisi
                              </span>
                            )}
                            {reportCount > 0 && (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-bold text-[10px]">
                                🚩 {reportCount} Rapor
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {court.city} {court.district ? `/ ${court.district}` : ""} — Ekleyen: {court.addedBy || "Sistem"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adminVerifyCourtToggle(court.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                              court.isVerified
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {court.isVerified ? "Doğrulamayı Kaldır" : "Resmî Olarak Doğrula"}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`"${court.name}" kortunu sistemden kalıcı olarak silmek istediğinize emin misiniz?`)) {
                                deleteCourt(court.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            title="Kortu Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : activeTab === "matches" ? (
            <motion.div 
              key="matches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-extrabold text-pb-dark flex items-center gap-2">
                  Son Maç Kayıtları <span className="bg-gray-100 text-gray-500 text-sm px-2 py-0.5 rounded-full">{matches.length}</span>
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {matches.length === 0 && (
                  <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Sistemde henüz kaydedilmiş bir maç bulunmuyor.
                  </div>
                )}
                {matches.map(match => (
                  <div key={match.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <Link href={`/match/${match.id}`} className="flex items-center gap-6 flex-1 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                      <ClientTime dateString={match.date} className="text-xs font-bold text-gray-400 w-24" />
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-pb-dark w-48 text-right truncate">{getUserNamesText(match.team1)}</span>
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                          <span className="font-extrabold text-pb-dark">{match.team1Score}</span>
                          <span className="text-gray-400">-</span>
                          <span className="font-extrabold text-pb-dark">{match.team2Score}</span>
                        </div>
                        <span className="font-bold text-gray-500 w-48 truncate">{getUserNamesText(match.team2)}</span>
                      </div>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        if (confirm("Bu maçı sistemden kalıcı olarak silmek istediğinize emin misiniz? (Oyuncu puanları geri alınmaz)")) {
                          deleteMatch(match.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Maçı Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === "posts" ? (
            <motion.div 
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-extrabold text-pb-dark flex items-center gap-2">
                  Topluluk Gönderileri & Resmî Duyurular <span className="bg-gray-100 text-gray-500 text-sm px-2 py-0.5 rounded-full">{posts.length}</span>
                </h2>
              </div>

              {/* Official Announcement Publisher Box */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl p-5 mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📢</span>
                  <h3 className="font-extrabold text-pb-dark text-base">Resmî Platform Duyurusu Yayınla (Akışa Sabitlenir)</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Buradan yayınladığınız duyuru otomatik olarak akışın (feed) en üstüne &quot;📌 Resmî Sabitlenmiş Duyuru&quot; olarak eklenir.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="official-post-input"
                    placeholder="Duyuru metnini yazın..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-pb-dark outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('official-post-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        adminCreateOfficialPost(input.value.trim(), true);
                        input.value = "";
                        alert("Resmî duyuru akışın en üstüne sabitlendi!");
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl text-sm transition-colors shrink-0"
                  >
                    👑 Sabitle & Yayınla
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {posts.length === 0 && (
                  <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Sistemde henüz bir gönderi bulunmuyor.
                  </div>
                )}
                {posts.map(post => (
                  <div key={post.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-pb-green/20 rounded-full flex items-center justify-center font-bold text-pb-dark shrink-0">
                        {post.author.charAt(0)}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-pb-dark">{post.author}</span>
                          {post.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 font-bold text-[10px]">📌 Sabitli</span>
                          )}
                          <ClientTime dateString={post.time} className="text-xs text-gray-400 font-medium" />
                        </div>
                        <p className="text-gray-700 font-medium mt-1 line-clamp-2">{post.content || "Anket gönderisi"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePinPost(post.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${post.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      >
                        {post.isPinned ? "📌 Kaldır" : "📌 Sabitle"}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Bu gönderiyi kalıcı olarak silmek istediğinize emin misiniz?")) {
                            deletePost(post.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Gönderiyi Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === "users" ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-extrabold text-pb-dark flex items-center gap-2">
                  Kullanıcı Yönetimi & Yetki Ataması <span className="bg-gray-100 text-gray-500 text-sm px-2 py-0.5 rounded-full">{users.length}</span>
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {users.map(user => (
                  <div key={user.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-pb-green/20 rounded-full flex items-center justify-center font-bold text-pb-dark shrink-0">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${user.id}`} className="font-bold text-pb-dark hover:text-pb-green hover:underline">{user.name}</Link>
                          {user.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 font-extrabold text-[10px]">👑 YÖNETİCİ</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold text-[10px]">Kullanıcı</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adminUpdateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${user.role === 'admin' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        title="Rol Değiştir"
                      >
                        {user.role === 'admin' ? "Yetkiyi Al" : "👑 Admin Yap"}
                      </button>

                      {user.id !== currentUser?.id && (
                        <button 
                          onClick={() => {
                            if (confirm(`Bu kullanıcıyı (${user.name}) sistemden kalıcı olarak silmek istediğinize emin misiniz?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          title="Kullanıcıyı Sil / Yasakla"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Yönetici paneli yükleniyor...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
