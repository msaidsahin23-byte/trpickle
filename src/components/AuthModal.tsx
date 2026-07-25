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
  
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setAuthError("");
    }
  }, [isOpen]);

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
              <h2 className="text-xl font-bold text-pb-dark dark:text-white flex-1">
                Giriş Yap
              </h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-pb-dark dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-0">
                <div className="p-6">
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
