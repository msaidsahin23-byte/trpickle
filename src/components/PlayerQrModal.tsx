"use client";
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Sparkles, QrCode, Share2, Lightbulb, Trophy, Palette } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface PlayerQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const QR_THEMES = [
  {
    id: "emerald",
    name: "TRPickle Yeşil",
    fgColor: "#84cc16",
    bgGradient: "from-black via-zinc-950 to-black",
    cardBorder: "border-lime-500/40",
    badgeBg: "bg-lime-500/20 text-lime-400 border-lime-500/30",
    accentText: "text-lime-400"
  },
  {
    id: "gold",
    name: "Şampiyon Altın",
    fgColor: "#d97706",
    bgGradient: "from-amber-950 via-slate-900 to-slate-950",
    cardBorder: "border-amber-500/40",
    badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    accentText: "text-amber-400"
  },
  {
    id: "blue",
    name: "Turnuva Mavisi",
    fgColor: "#2563eb",
    bgGradient: "from-blue-950 via-slate-900 to-slate-950",
    cardBorder: "border-blue-500/40",
    badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    accentText: "text-blue-400"
  },
  {
    id: "ruby",
    name: "Kort Kırmızısı",
    fgColor: "#dc2626",
    bgGradient: "from-red-950 via-slate-900 to-slate-950",
    cardBorder: "border-red-500/40",
    badgeBg: "bg-red-500/20 text-red-400 border-red-500/30",
    accentText: "text-red-400"
  }
];

export default function PlayerQrModal({ isOpen, onClose, user }: PlayerQrModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(QR_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !user) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trpickle.com';
  const inviteUrl = `${baseUrl}/profile/${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://trpickle.com/profile/${user.id}`);
    setCopied(true);
    toast.success("Profil bağlantısı panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `trpickle-profil-qr-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Profil QR Kartı başarıyla indirildi!");
    } catch (err) {
      toast.error("Görsel oluşturulamadı.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Profil QR Kartım</h3>
                <p className="text-xs font-medium text-slate-400">Bu QR kod okutulduğunda doğrudan profilinize yönlendirir</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex flex-col items-center gap-6 overflow-y-auto">
            
            {/* Downloadable QR Card Capture Area */}
            <div
              ref={cardRef}
              className={`w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b ${selectedTheme.bgGradient} border-2 ${selectedTheme.cardBorder} shadow-2xl relative overflow-hidden flex flex-col items-center text-center`}
            >
              {/* Decorative Glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* TRPickle Brand Header */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-1.5 font-black text-xs tracking-wider text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>TRPICKLE TÜRKİYE</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${selectedTheme.badgeBg}`}>
                  PROFİL QR KARTI
                </span>
              </div>

              {/* Player Avatar & Info */}
              <div className="flex items-center gap-3.5 w-full bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 mb-5 text-left">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shrink-0 bg-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl border-2 border-white/20 shrink-0 bg-slate-800/80 flex items-center justify-center text-white font-bold text-xl uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-white text-base truncate">{user.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-medium mt-0.5">
                    <span>📍 {user.city || "İstanbul"}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-pb-green font-extrabold">Tek: {(user.singlesRating || 2.5).toFixed(3)}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-purple-400 font-extrabold">Eş: {(user.doublesRating || 2.5).toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The QR Code Container */}
              <div className="p-5 bg-white rounded-3xl shadow-xl border-4 border-white flex flex-col items-center justify-center relative group">
                <QRCodeSVG
                  value={inviteUrl}
                  size={196}
                  fgColor={selectedTheme.fgColor}
                  bgColor="#ffffff"
                  level="H"
                  imageSettings={{
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>

              {/* Footer Tagline */}
              <div className="mt-4 text-center">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#84cc16] drop-shadow-md">
                  trpickle.com
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadImage}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Kartı İndir (PNG)</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-gray-200 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Kopyalandı!" : "Link Kopyala"}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
