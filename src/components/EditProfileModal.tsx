"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { resizeImage } from "@/lib/image-utils";

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const currentUser = useStore((state) => state.currentUser);
  const updateProfileImages = useStore((state) => state.updateProfileImages);
  const updateProfileDetails = useStore((state) => state.updateProfileDetails);

  const THEME_COLORS = ['#cfff50', '#3b82f6', '#f97316', '#8b5cf6', '#64748b'];

  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatarUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentUser?.bannerUrl || null);
  const [accentColor, setAccentColor] = useState<string>(currentUser?.accentColor || '#cfff50');
  const [paddle, setPaddle] = useState<string>(currentUser?.paddle || '');
  const [favoriteCourt, setFavoriteCourt] = useState<string>(currentUser?.favoriteCourt || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const [birthdate, setBirthdate] = useState<string>(currentUser?.birthdate || '');
  const [isSaving, setIsSaving] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const maxWidth = type === "avatar" ? 300 : 800;
      const maxHeight = type === "avatar" ? 300 : 300;
      const dataUrl = await resizeImage(file, maxWidth, maxHeight, 0.8);
      
      // Convert dataUrl to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, file.name);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Yükleme başarısız.");
      const { url } = await uploadRes.json();
      
      if (type === "avatar") {
        setAvatarPreview(url);
      } else {
        setBannerPreview(url);
      }
    } catch (err) {
      console.error("Görsel yüklenirken hata oluştu", err);
      alert("Görsel işlenirken bir hata oluştu.");
    }
  };

  const handleSave = () => {
    if (!birthdate) {
      alert('Lütfen geçerli bir doğum tarihi giriniz.');
      return;
    }

    const inputDate = new Date(birthdate);
    const today = new Date();
    const minDate = new Date('1920-01-01');

    if (isNaN(inputDate.getTime()) || inputDate > today || inputDate < minDate) {
      alert('Lütfen geçerli bir doğum tarihi giriniz.');
      return;
    }

    setIsSaving(true);
    updateProfileImages(currentUser.id, avatarPreview || undefined, bannerPreview || undefined);
    updateProfileDetails(currentUser.id, { 
      accentColor, 
      paddle: paddle.trim() || undefined, 
      favoriteCourt: favoriteCourt.trim() || undefined,
      bio: bio.trim() || undefined,
      birthdate: birthdate || undefined
    });
    
    // Simulate slight delay for UX
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-dark/20 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-extrabold text-pb-dark dark:text-white">Profili Düzenle</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-8 overflow-y-auto max-h-[70vh]">
            
            {/* Banner Section */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Kapak Fotoğrafı</span>
              <div 
                className="w-full h-40 bg-gray-50 dark:bg-slate-700 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm font-bold">Kapak yükle</span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-pb-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                
                <input 
                  type="file" 
                  ref={bannerInputRef} 
                  onChange={(e) => handleFileChange(e, "banner")} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Profil Fotoğrafı</span>
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group cursor-pointer shrink-0 shadow-sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-gray-300">{currentUser.name.charAt(0)}</span>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-pb-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-pb-dark dark:text-white font-bold rounded-xl text-sm transition-colors border border-gray-200 dark:border-slate-600 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Fotoğraf Seç
                  </button>
                  <p className="text-xs font-medium text-gray-400">Önerilen: Kare görsel (Maks 300x300).</p>
                </div>

                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={(e) => handleFileChange(e, "avatar")} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
          </div>

            <hr className="border-gray-100 dark:border-slate-700" />

            {/* Profile Details Section */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tema Rengi</span>
                <div className="flex items-center gap-3">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-10 h-10 rounded-full transition-transform ${accentColor === color ? 'scale-110 ring-4 ring-offset-2 ring-gray-200 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Raketim (Opsiyonel)</span>
                <input 
                  type="text" 
                  value={paddle}
                  onChange={(e) => setPaddle(e.target.value)}
                  placeholder="Örn: Selkirk Vanguard Power Air"
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:border-pb-blue focus:ring-1 focus:ring-pb-blue transition-colors font-medium text-pb-dark dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Favori Kort (Opsiyonel)</span>
                <input 
                  type="text" 
                  value={favoriteCourt}
                  onChange={(e) => setFavoriteCourt(e.target.value)}
                  placeholder="Örn: Kalamış Parkı Kortu"
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:border-pb-blue focus:ring-1 focus:ring-pb-blue transition-colors font-medium text-pb-dark dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Doğum Tarihi</span>
                <input type="date" min="1926-01-01" max="2026-12-31" 
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:border-pb-blue focus:ring-1 focus:ring-pb-blue transition-colors font-medium text-pb-dark dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Biyografi</span>
                  <span className={`text-xs font-bold ${bio.length === 160 ? 'text-red-500' : 'text-gray-400'}`}>{bio.length}/160</span>
                </div>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  placeholder="Kendinizden ve oyun stilinizden kısaca bahsedin..."
                  maxLength={160}
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:border-pb-blue focus:ring-1 focus:ring-pb-blue transition-colors font-medium text-pb-dark dark:text-white min-h-[100px] resize-none"
                />
              </div>
            </div>
            
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900 flex justify-end gap-3 mt-auto shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              disabled={isSaving}
            >
              İptal
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl font-bold text-pb-dark bg-pb-green hover:bg-pb-green/90 transition-colors shadow-sm disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
