"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthModal({ isOpen, onClose, title = "Hesaplar", description }: { isOpen: boolean, onClose: () => void, title?: string, description?: string }) {
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  const login = useStore(state => state.login);
  const switchAccount = useStore(state => state.switchAccount);
  const activeSessions = useStore(state => state.activeSessions) || [];
  const currentUser = useStore(state => state.currentUser);
  
  const router = useRouter();

  const [view, setView] = useState<'list' | 'login'>('list');

  useEffect(() => {
    if (isOpen) {
      setView(activeSessions.length > 0 ? 'list' : 'login');
      setAuthError("");
    }
  }, [isOpen, activeSessions.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        throw new Error("Giriş başarısız: " + error.message);
      }

      setAuthEmail("");
      setAuthPassword("");
      onClose();
      router.refresh();
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-pb-dark/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col"
          >
            <div className="flex items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shrink-0">
              {view === 'login' && activeSessions.length > 0 && (
                <button 
                  onClick={() => setView('list')} 
                  className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-bold text-pb-dark dark:text-white flex-1">
                {view === 'list' ? title : "Giriş Yap"}
              </h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-0">
              {view === 'list' ? (
                <div className="flex flex-col py-2">
                  {activeSessions.map((user) => (
                    <button 
                      key={user.id}
                      onClick={() => { switchAccount(user.id); onClose(); }} 
                      className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-600 shadow-sm" 
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 text-pb-dark dark:text-white rounded-full flex items-center justify-center font-bold text-lg border border-gray-200 dark:border-slate-600">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-pb-dark dark:text-white">{user.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                        </div>
                      </div>
                      {currentUser?.id === user.id && (
                        <div className="w-6 h-6 rounded-full bg-pb-green flex items-center justify-center text-white dark:text-pb-dark">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                  
                  <hr className="border-gray-100 dark:border-slate-700 my-2 mx-6" />

                  <button 
                    onClick={() => {
                      onClose();
                      router.push('/auth?addAccount=true');
                    }} 
                    className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-12 h-12 border-2 border-dashed border-emerald-500 rounded-full flex items-center justify-center text-emerald-500">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-pb-dark dark:text-white">Sıfırdan Yeni Hesap Aç</span>
                      <span className="text-xs text-gray-500">Kayıt ol ve yeni hesap oluştur</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setView('login');
                      setAuthEmail("");
                      setAuthPassword("");
                      setAuthError("");
                    }} 
                    className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-t border-gray-100 dark:border-slate-700/60"
                  >
                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-pb-dark dark:text-white">Mevcut Hesaba Giriş Yap</span>
                      <span className="text-xs text-gray-500">Var olan bir hesabınla giriş yap</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {description && activeSessions.length === 0 && (
                      <p className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-2">
                        {description}
                      </p>
                    )}
                    
                    <input 
                      type="email" 
                      placeholder="E-posta Adresi" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark dark:text-white"
                      required
                    />
                    
                    <div>
                      <input 
                        type="password" 
                        placeholder="Şifre" 
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark dark:text-white"
                        required
                      />
                      <div className="flex justify-end mt-2">
                        <button type="button" onClick={() => alert("Şifre sıfırlama yakında eklenecektir!")} className="text-xs font-bold text-pb-blue hover:underline">
                          Şifremi Unuttum
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 font-bold text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 text-center mt-1">
                        {authError}
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      className="w-full bg-pb-dark dark:bg-pb-green text-white dark:text-pb-dark py-4 rounded-xl font-bold hover:bg-black dark:hover:bg-green-400 transition-colors mt-2"
                    >
                      Giriş Yap
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => {
                        onClose();
                        router.push('/auth?addAccount=true');
                      }}
                      className="text-pb-blue font-bold text-sm hover:underline"
                    >
                      Hesabın yok mu? Sıfırdan Kayıt Ol
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
