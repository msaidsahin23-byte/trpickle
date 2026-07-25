"use client";
import { useStore } from "@/store/useStore";
import { User, Shield, Download, Edit2, Bell, Palette, UserX, Unlock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditProfileModal } from "@/components/EditProfileModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const matches = useStore(state => state.matches);
  const updatePreferences = useStore(state => state.updatePreferences);
  const updateUser = useStore(state => state.updateUser);
  const unblockUser = useStore(state => state.unblockUser);
  const deleteOwnAccount = useStore(state => state.deleteOwnAccount);
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentUser) {
      router.push('/auth');
    }
  }, [currentUser, router]);

  if (!mounted || !currentUser) return null;

  const handleExportData = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.text("TRPickle Hesap Ozeti", 14, 22);
    
    // Add User Info
    doc.setFontSize(12);
    doc.text(`Isim: ${currentUser.name}`, 14, 35);
    doc.text(`Seviye: ${currentUser.level || 1}`, 14, 42);
    doc.text(`1v1 Elo: ${currentUser.singlesRating.toFixed(3)}`, 14, 49);
    doc.text(`2v2 Elo: ${currentUser.doublesRating.toFixed(3)}`, 14, 56);
    
    // Gather approved matches where user is a participant
    const userMatches = matches.filter(
      m => (!m.status || m.status === 'approved') && (m.team1.includes(currentUser.id) || m.team2.includes(currentUser.id))
    );

    // Sort chronologically
    userMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const tableData = userMatches.map(m => {
      const date = new Date(m.date).toLocaleDateString("tr-TR");
      const format = m.matchFormat === 'singles' ? 'Tekli (1v1)' : 'Esli (2v2)';
      const isTeam1 = m.team1.includes(currentUser.id);
      const won = isTeam1 ? m.team1Score > m.team2Score : m.team2Score > m.team1Score;
      const result = won ? "Galibiyet" : "Maglubiyet";
      const score = `${m.team1Score} - ${m.team2Score}`;
      return [date, format, result, score];
    });

    autoTable(doc, {
      startY: 65,
      head: [['Tarih', 'Format', 'Sonuc', 'Skor']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166] } // pb-green-ish color
    });

    doc.save(`TRPickle_Hesap_Ozeti_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
  };

  const blockedUsersDetails = (currentUser.blockedUsers || [])
    .map(bid => users.find(u => u.id === bid))
    .filter(Boolean) as typeof users;

  const notificationsEnabled = currentUser.notificationsEnabled !== false; // defaults to true
  const appTheme = currentUser.appTheme || 'light';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-pb-dark dark:text-white mb-8 tracking-tight">Ayarlar</h1>

      <div className="flex flex-col gap-10">
        
        {/* Category 1: Görünüm ve Bildirimler */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Görünüm ve Bildirimler</h2>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-700">
            
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Bildirimler</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uygulama içi bildirimleri aç veya kapat.</p>
                </div>
              </div>
              <button
                onClick={() => updatePreferences({ notificationsEnabled: !notificationsEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-pb-green' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Tema Tercihi</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aydınlık, karanlık veya sistem teması.</p>
                </div>
              </div>
              <select
                value={appTheme}
                onChange={(e) => updatePreferences({ appTheme: e.target.value as 'light' | 'dark' | 'system' })}
                className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-pb-dark dark:text-white text-sm rounded-xl focus:ring-pb-green focus:border-pb-green block p-2.5 font-bold"
              >
                <option value="light">Aydınlık (Light)</option>
                <option value="dark">Karanlık (Dark)</option>
                <option value="system">Sistem (System)</option>
              </select>
            </div>

          </div>
        </section>

        {/* Category 2: Gizlilik ve Güvenlik */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Gizlilik ve Güvenlik</h2>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pb-blue/10 flex items-center justify-center text-pb-blue">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Gönderilerimi Profilimde Göster</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Diğer kullanıcılar profilinizdeki gönderiler sekmesini görebilir.</p>
                </div>
              </div>
              <button
                onClick={() => updateUser(currentUser.id, { showPostsOnProfile: currentUser.showPostsOnProfile === false ? true : false })}
                className={`w-12 h-6 rounded-full transition-colors relative ${currentUser.showPostsOnProfile !== false ? 'bg-pb-green' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${currentUser.showPostsOnProfile !== false ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Engellenen Kullanıcılar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bu listedeki kişiler maçlarınıza veya gönderilerinize yorum yapamaz.</p>
                </div>
              </div>

              {blockedUsersDetails.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700 border-dashed">
                  <p className="text-gray-400 font-medium text-sm">Engellenen kullanıcı bulunmuyor.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-700 bg-gray-50/50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
                  {blockedUsersDetails.map(u => (
                    <li key={u.id} className="flex items-center justify-between p-4">
                      <span className="font-bold text-pb-dark dark:text-white">{u.name}</span>
                      <button
                        onClick={() => unblockUser(u.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Engeli Kaldır
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Category 3: Hesap Yönetimi ve Veri */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Hesap Yönetimi & Veri</h2>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-700">
            
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Profil Bilgileri</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 text-pb-dark dark:text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" /> Düzenle
              </button>
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Hesap Verileri</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tüm maç istatistiklerinizi içeren PDF raporunu indirin.</p>
                </div>
              </div>
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-pb-dark dark:bg-pb-green text-white dark:text-pb-dark hover:opacity-90 rounded-xl font-bold text-sm transition-opacity shadow-lg shadow-pb-dark/20 dark:shadow-none"
              >
                <Download className="w-4 h-4" /> PDF Raporu İndir
              </button>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-pb-blue">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-pb-dark dark:text-white">Cihaz & Önbellek Senkronizasyonu</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobilde veya farklı cihazda eski/hatalı veri görüyorsanız önbelleği tazeleyin.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Tarayıcınızdaki eski önbellek temizlenip sayfa yenilenecek. Devam edilsin mi?")) {
                    localStorage.removeItem("pickleball-storage");
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-pb-dark dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors"
              >
                Önbelleği Yenile
              </button>
            </div>

            {/* DANGER ZONE: DELETE ACCOUNT */}
            <div className="flex flex-col p-6 border-t border-red-100 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400">Hesabımı Kalıcı Olarak Sil</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu işlem geri alınamaz. Profiliniz ve tüm verileriniz kalıcı olarak silinir.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(!showDeleteConfirm);
                    setDeleteError("");
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0"
                >
                  {showDeleteConfirm ? "Vazgeç" : "Hesabımı Sil..."}
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/40 flex flex-col gap-3">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                    Güvenlik doğrulaması için lütfen mevcut şifrenizi giriniz:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      placeholder="Mevcut Şifreniz"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-pb-dark dark:text-white outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => {
                        try {
                          deleteOwnAccount(deletePassword);
                          router.push("/auth");
                        } catch (err: any) {
                          setDeleteError(err.message || "Hesap silinemedi.");
                        }
                      }}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-colors shrink-0"
                    >
                      Kalıcı Olarak Sil & Çıkış Yap
                    </button>
                  </div>
                  {deleteError && (
                    <p className="text-xs text-red-600 font-bold">{deleteError}</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>
        
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
