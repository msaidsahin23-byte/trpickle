import React from "react";

export type AuraIdType =
  | 'win-streak'
  | 'giant-slayer'
  | 'early-bird'
  | 'social-butterfly'
  | 'active-player'
  | 'last-laugh'
  | 'ice-cold';

export function getCardAuraWrapperClass(auraId?: AuraIdType): string {
  if (!auraId) return "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm";
  switch (auraId) {
    case 'win-streak':
      return "bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/80 text-white border-2 border-orange-500/80 shadow-[0_0_25px_rgba(249,115,22,0.35)] group-hover:border-orange-400 group-hover:shadow-[0_0_60px_rgba(249,115,22,0.85),inset_0_0_35px_rgba(239,68,68,0.25)] transition-all duration-500";
    case 'ice-cold':
      return "bg-gradient-to-br from-slate-900 via-cyan-950/60 to-slate-900 text-white border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:border-cyan-300 group-hover:shadow-[0_0_60px_rgba(186,230,253,0.9),inset_0_0_40px_rgba(6,182,212,0.35)] transition-all duration-500";
    case 'giant-slayer':
      return "bg-gradient-to-br from-slate-900 via-blue-950/70 to-slate-900 text-white border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:border-blue-400 group-hover:shadow-[0_0_60px_rgba(59,130,246,0.9),inset_0_0_35px_rgba(6,182,212,0.3)] transition-all duration-500";
    case 'last-laugh':
      return "bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 text-white border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] group-hover:border-amber-300 group-hover:shadow-[0_0_60px_rgba(245,158,11,0.85),inset_0_0_35px_rgba(251,191,36,0.25)] transition-all duration-500";
    case 'active-player':
      return "bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 text-white border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:border-emerald-400 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.85),inset_0_0_35px_rgba(52,211,153,0.25)] transition-all duration-500";
    case 'social-butterfly':
      return "bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 text-white border-2 border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.35)] group-hover:border-pink-400 group-hover:shadow-[0_0_60px_rgba(236,72,153,0.85),inset_0_0_35px_rgba(192,132,252,0.25)] transition-all duration-500";
    case 'early-bird':
      return "bg-gradient-to-br from-slate-900 via-yellow-950/50 to-slate-900 text-white border-2 border-yellow-400/80 shadow-[0_0_25px_rgba(250,204,21,0.35)] group-hover:border-yellow-300 group-hover:shadow-[0_0_60px_rgba(250,204,21,0.85),inset_0_0_35px_rgba(251,191,36,0.25)] transition-all duration-500";
    default:
      return "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm";
  }
}

export function PostAuraVisuals({ auraId }: { auraId?: AuraIdType }) {
  if (!auraId) return null;

  return (
    <>
      {/* 1. 🔥 ALEV (GALİBİYET SERİSİ) - Sabit gerçekçi alevler + İmleç üstüne gelince ALEV ALEV YANMA animasyonu */}
      {auraId === 'win-streak' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          {/* Sabit Alt Alev Katmanı */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-600/40 via-orange-500/10 to-transparent group-hover:from-orange-600/70 group-hover:via-red-500/30 transition-all duration-700" />

          {/* Gerçekçi SVG Alev Dilleri (Sabit + Hoverda şaha kalkan alevler) */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between items-end px-4 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
            {/* Sol Alev */}
            <svg className="w-20 h-20 text-orange-500 animate-flame-dance filter drop-shadow-[0_0_12px_#f97316]" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C40 30 10 50 20 85 C25 98 45 100 50 100 C55 100 75 98 80 85 C90 50 60 30 50 0 Z" opacity="0.85" />
              <path d="M50 25 C45 45 25 60 33 88 C36 96 46 98 50 98 C54 98 64 96 67 88 C75 60 55 45 50 25 Z" fill="#facc15" opacity="0.95" />
            </svg>

            {/* Orta Sol Alev */}
            <svg className="w-16 h-16 text-red-500 animate-flame-dance filter drop-shadow-[0_0_10px_#ef4444]" style={{ animationDelay: '0.4s' }} viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C35 35 15 55 25 85 C30 98 45 100 50 100 C55 100 70 98 75 85 C85 55 65 35 50 0 Z" />
              <path d="M50 30 C43 50 28 65 35 88 C38 96 46 98 50 98 C54 98 62 96 65 88 C72 65 57 50 50 30 Z" fill="#fde047" />
            </svg>

            {/* Orta Alev */}
            <svg className="w-24 h-24 text-orange-500 animate-flame-dance filter drop-shadow-[0_0_15px_#f97316]" style={{ animationDelay: '0.8s' }} viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C38 28 10 48 20 85 C25 98 45 100 50 100 C55 100 75 98 80 85 C90 48 62 28 50 0 Z" opacity="0.9" />
              <path d="M50 20 C42 42 22 58 32 88 C36 96 46 98 50 98 C54 98 64 96 68 88 C78 58 58 42 50 20 Z" fill="#fef08a" />
            </svg>

            {/* Sağ Alev */}
            <svg className="w-20 h-20 text-orange-500 animate-flame-dance filter drop-shadow-[0_0_12px_#f97316]" style={{ animationDelay: '0.2s' }} viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C40 30 10 50 20 85 C25 98 45 100 50 100 C55 100 75 98 80 85 C90 50 60 30 50 0 Z" opacity="0.85" />
              <path d="M50 25 C45 45 25 60 33 88 C36 96 46 98 50 98 C54 98 64 96 67 88 C75 60 55 45 50 25 Z" fill="#facc15" opacity="0.95" />
            </svg>
          </div>

          {/* Uçuşan Közler & Kıvılcımlar */}
          <div className="absolute inset-0">
            <span className="absolute bottom-4 left-[12%] w-2 h-2 rounded-full bg-amber-400 blur-[0.5px] animate-ember-rise shadow-[0_0_8px_#f59e0b]" />
            <span className="absolute bottom-6 left-[28%] w-2.5 h-2.5 rounded-full bg-orange-400 blur-[0.5px] animate-ember-rise shadow-[0_0_10px_#f97316]" style={{ animationDelay: '0.7s' }} />
            <span className="absolute bottom-3 left-[48%] w-2 h-2 rounded-full bg-yellow-300 blur-[0.5px] animate-ember-rise shadow-[0_0_10px_#facc15]" style={{ animationDelay: '1.2s' }} />
            <span className="absolute bottom-5 left-[70%] w-2.5 h-2.5 rounded-full bg-red-400 blur-[0.5px] animate-ember-rise shadow-[0_0_12px_#ef4444]" style={{ animationDelay: '0.4s' }} />
            <span className="absolute bottom-2 left-[85%] w-2 h-2 rounded-full bg-amber-300 blur-[0.5px] animate-ember-rise shadow-[0_0_8px_#fbbf24]" style={{ animationDelay: '1.8s' }} />
          </div>

          {/* Hover (İmleç Gelince) Alev Alev Yanma Parlaması */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}

      {/* 2. ❄️ BUZ GİBİ (KUSURSUZ ZAFER) - İmleç üstüne gelince BUZ KESME animasyonu */}
      {auraId === 'ice-cold' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          {/* Sabit Kristal Buz Çerçeve */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/15" />

          {/* Köşelerdeki Kalıcı Buz Kristalleri */}
          <div className="absolute top-2 left-3 text-cyan-300 text-2xl font-black opacity-80 filter drop-shadow-[0_0_8px_#06b6d4] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
            ❄️
          </div>
          <div className="absolute top-2 right-3 text-cyan-300 text-2xl font-black opacity-80 filter drop-shadow-[0_0_8px_#06b6d4] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
            ❄️
          </div>
          <div className="absolute bottom-2 left-3 text-cyan-300 text-2xl font-black opacity-80 filter drop-shadow-[0_0_8px_#06b6d4] group-hover:scale-125 transition-transform duration-500">
            ❄️
          </div>
          <div className="absolute bottom-2 right-3 text-cyan-300 text-2xl font-black opacity-80 filter drop-shadow-[0_0_8px_#06b6d4] group-hover:scale-125 transition-transform duration-500">
            ❄️
          </div>

          {/* İmleç Üstüne Gelince BUZ KESME (Donma Sis Dalgası & Kristalize Efekt) */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-sky-300/20 to-blue-600/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
            <div className="text-cyan-200/40 font-black text-6xl tracking-widest uppercase select-none filter drop-shadow-[0_0_15px_#06b6d4] animate-pulse">
              BUZ KESTİ
            </div>
          </div>
        </div>
      )}

      {/* 3. ⚡ DEV AVCISI (SÜRPRİZ ZAFER) - Elektrik Mavisi Şimşekler ve Yüksek Voltaj */}
      {auraId === 'giant-slayer' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 animate-lightning-arc" />
          <div className="absolute top-0 right-8 w-40 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] group-hover:h-[3px] group-hover:shadow-[0_0_25px_#22d3ee] transition-all" />
          <div className="absolute bottom-0 left-8 w-48 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] group-hover:h-[3px] group-hover:shadow-[0_0_25px_#60a5fa] transition-all" />
          <div className="absolute top-4 right-4 text-cyan-400 text-3xl filter drop-shadow-[0_0_10px_#06b6d4] group-hover:scale-125 transition-transform">
            ⚡
          </div>
        </div>
      )}

      {/* 4. 🏆 ALTIN KUPA (SON MAÇ GALİBİ) - Kraliyet Altını Parlama */}
      {auraId === 'last-laugh' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0 animate-gold-sweep">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-yellow-400/10 to-amber-600/20 group-hover:from-amber-500/35 transition-all duration-500" />
          <div className="absolute top-3 right-4 text-amber-400 text-3xl filter drop-shadow-[0_0_12px_#f59e0b] group-hover:scale-125 transition-transform">
            👑
          </div>
        </div>
      )}

      {/* 5. 🌿 NANE FERAHLIĞI (AKTİF OYUNCU) - Emerald Aurora & Yaprak Esintisi */}
      {auraId === 'active-player' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-600/20 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute bottom-3 right-4 text-emerald-400 text-3xl filter drop-shadow-[0_0_10px_#10b981] group-hover:scale-125 transition-transform">
            🌿
          </div>
        </div>
      )}

      {/* 6. 🎉 KONFETİ (SOSYAL KELEBEK) - Festival Kutlaması */}
      {auraId === 'social-butterfly' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-indigo-500/15 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute top-3 right-4 text-pink-400 text-3xl filter drop-shadow-[0_0_10px_#ec4899] group-hover:scale-125 transition-transform">
            🎉
          </div>
        </div>
      )}

      {/* 7. 🌅 GÜNEŞ IŞILTISI (ERKEN KUŞ) - Gün Doğumu Parlaması */}
      {auraId === 'early-bird' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 via-amber-400/10 to-transparent group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute top-3 right-4 text-yellow-400 text-3xl filter drop-shadow-[0_0_12px_#eab308] group-hover:scale-125 group-hover:rotate-45 transition-transform duration-700">
            ☀️
          </div>
        </div>
      )}
    </>
  );
}
