"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { 
  Activity, Trophy, MapPin, GraduationCap, 
  PlusCircle, User, LogOut, Menu, X, Bell, MessageSquare, Settings, ChevronDown, Users, Repeat, Award, Camera, QrCode
} from "lucide-react";
import logoPic from "@/assets/logo.png";
import logoTextPic from "@/assets/logo-text.png";
import QRScannerModal from "@/components/QRScannerModal";

const Avatar = ({ src, name, size = 32 }: { src?: string, name: string, size?: number }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div 
        style={{ width: size, height: size }}
        className="rounded-full bg-pb-green text-pb-dark flex items-center justify-center font-bold shadow-inner shrink-0"
      >
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={name}
      onError={() => setError(true)}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border-2 border-slate-700 shrink-0"
    />
  );
};

export default function Navbar() {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const directMessages = useStore(state => state.directMessages);
  const activeSessions = useStore(state => state.activeSessions);
  
  const users = useStore(state => state.users);
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklanırsa kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadMsgs = currentUser ? (directMessages || []).filter(m => m.receiverId === currentUser.id && !m.isRead).length : 0;
  const unreadNotifs = currentUser ? (currentUser.notifications || []).filter(n => !n.isRead).length : 0;

  const navLinks = [
    { href: "/feed", label: "Akış", icon: Activity },
    { href: "/leaderboard", label: "Sıralama", icon: Trophy },
    { href: "/courts", label: "Kortlar", icon: MapPin },
    { href: "/academy", label: "Akademi", icon: GraduationCap },
    { href: "/partners", label: "Partner Bul", icon: Users },
    { href: "/achievements", label: "Başarımlar", icon: Award },
  ];

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
      <nav className="sticky top-0 z-[100] w-full bg-[#17212f] text-white border-b border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Alanı */}
          <Link href={currentUser ? "/feed" : "/"} className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
            <Image alt="Logo" className="object-contain" height={32} width={32} src={logoPic} />
            <Image alt="TRPickle.com" className="object-contain hidden sm:block" height={20} width={130} src={logoTextPic} />
          </Link>

          {/* Orta Menü (Masaüstü) */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-6">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`py-1 text-[13px] font-semibold transition-all duration-300 border-b-2
                    ${isActive ? "text-pb-green border-pb-green" : "text-slate-400 border-transparent hover:text-white"}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Sağ Taraf */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <>
                <button
                  onClick={() => setScannerOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                >
                  <QrCode size={18} />
                  <span>QR Okut</span>
                </button>

                <Link 
                  href="/add-match" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pb-green text-[#17212f] rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                >
                  <PlusCircle size={18} />
                  <span>Maç Gir</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Mobile QR Okut Button */}
                  <button 
                    onClick={() => setScannerOpen(true)}
                    className="sm:hidden relative p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="QR Okut"
                  >
                    <QrCode size={20} />
                  </button>
                  <Link href="/messages" className="relative p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                    <MessageSquare size={20} />
                    {unreadMsgs > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#17212f]"></span>
                      </span>
                    )}
                  </Link>
                  <Link href="/notifications" className="relative p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                    <Bell size={20} />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#17212f]"></span>
                      </span>
                    )}
                  </Link>
                </div>

                {/* Profil Dropdown */}
                <div className="hidden md:block relative ml-2" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center p-0.5 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <Avatar src={currentUser.avatarUrl} name={currentUser.name} size={36} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-[#1a2332] border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                      >
                        <Link href={`/profile/${currentUser.username}`} onClick={closeMenu} className="flex items-center gap-4 px-5 py-3 font-semibold text-sm text-slate-200 hover:bg-slate-800/80 transition-colors">
                          <User size={18} className="text-slate-400" /> Profilim
                        </Link>
                        <Link href="/achievements" onClick={closeMenu} className="flex items-center gap-4 px-5 py-3 font-semibold text-sm text-slate-200 hover:bg-slate-800/80 transition-colors">
                          <Trophy size={18} className="text-yellow-500" /> Başarımlar
                        </Link>
                        <Link href="/settings" onClick={closeMenu} className="flex items-center gap-4 px-5 py-3 font-semibold text-sm text-slate-200 hover:bg-slate-800/80 transition-colors">
                          <Settings size={18} className="text-slate-400" /> Ayarlar
                        </Link>
                        
                        <div className="h-px bg-slate-700/50 my-1 mx-3"></div>
                        
                        <button onClick={() => { logout(); closeMenu(); }} className="w-full flex items-center gap-4 px-5 py-3 font-semibold text-sm text-red-400 hover:bg-slate-800/80 transition-colors text-left">
                          <LogOut size={18} /> Çıkış Yap
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/auth" className="hidden md:flex px-5 py-2 bg-pb-green text-[#17212f] rounded-full font-bold text-sm hover:brightness-110 transition-colors">
                Giriş Yap
              </Link>
            )}

            <button 
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-700 bg-[#17212f] overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold ${
                      isActive ? "bg-pb-green/10 text-pb-green" : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {currentUser ? (
                <>
                  <Link href="/add-match" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg text-sm font-semibold bg-pb-green/10 text-pb-green">
                    <PlusCircle size={20} />
                    <span>Yeni Maç Ekle</span>
                  </Link>
                  <div className="h-px bg-slate-700 my-2 mx-1"></div>
                  <Link href={`/profile/${currentUser.username}`} onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                    <User size={20} className="text-slate-400" />
                    <span>Profilime Git</span>
                  </Link>
                  <Link href="/settings" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                    <Settings size={20} className="text-slate-400" />
                    <span>Hesap Ayarları</span>
                  </Link>
                  
                  <div className="h-px bg-slate-700 my-2 mx-1"></div>

                  <button onClick={() => { logout(); closeMenu(); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 text-left w-full">
                    <LogOut size={20} />
                    <span>Çıkış Yap</span>
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={closeMenu} className="flex items-center justify-center gap-2 px-3 py-3 mt-2 rounded-lg text-sm font-bold bg-pb-green text-[#17212f]">
                  Giriş Yap
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </nav>
  );
}
