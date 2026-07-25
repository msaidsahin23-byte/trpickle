"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logoPic from "@/assets/logo.png";
import logoTextPic from "@/assets/logo-text.png";
import { 
  Sparkles, 
  Users, 
  Smile, 
  ChevronRight, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Zap,
  CheckCircle2
} from "lucide-react";

export default function WelcomeQRPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExploding, setIsExploding] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synthesize realistic Pickleball Paddle "POP!" Hit Sound using Web Audio API
  const playPopSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 1. Crisp Paddle Surface Impact (High-frequency burst)
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 3200;
      bandpass.Q.value = 1.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.75, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.035);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Polymer Ball Hollow Body Resonance (Thwack / Pop pitch drop)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.055);

      oscGain.gain.setValueAtTime(0.8, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      noise.stop(ctx.currentTime + 0.04);
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Trigger Confetti Burst
  const triggerConfetti = async () => {
    try {
      const confettiModule = await import("canvas-confetti");
      const confetti = confettiModule.default;
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#84cc16", "#a3e635", "#fed7aa", "#fbcfe8", "#38bdf8"],
        startVelocity: 42,
        gravity: 0.9,
      });
    } catch (err) {
      console.log("Confetti module not loaded, fallback explosion animation only.");
    }
  };

  const handleHitBall = () => {
    if (isExploding) return;
    playPopSound();
    triggerConfetti();
    setIsExploding(true);

    setTimeout(() => {
      setStep(2);
      setIsExploding(false);
    }, 700);
  };

  const handleReset = () => {
    setStep(1);
    setIsExploding(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-lime-400/30 transition-colors duration-500">
      
      {/* 🌸 MENTOLLÜ YEŞİL, ŞEFTALİ & UÇUK PEMBE SOYUT SULU BOYA BULUTLARI (PARALLAX EFFECT) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Mint Green Watercolor Cloud */}
        <motion.div
          animate={{
            x: [0, 45, -25, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-20 w-[85vw] max-w-[600px] h-[85vw] max-h-[600px] rounded-full bg-gradient-to-br from-emerald-200/80 via-teal-100/60 to-lime-200/70 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-lime-500/15 blur-[110px]"
        />

        {/* Peach Watercolor Cloud */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.2, 1.05, 1],
          }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] -right-24 w-[90vw] max-w-[650px] h-[90vw] max-h-[650px] rounded-full bg-gradient-to-tl from-orange-200/80 via-amber-100/70 to-rose-200/60 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-rose-500/15 blur-[120px]"
        />

        {/* Soft Rose / Pastel Pink Watercolor Cloud */}
        <motion.div
          animate={{
            x: [0, 35, -35, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 left-[15%] w-[85vw] max-w-[600px] h-[85vw] max-h-[600px] rounded-full bg-gradient-to-tr from-pink-200/75 via-rose-100/65 to-emerald-100/60 dark:from-pink-500/15 dark:via-rose-500/10 dark:to-emerald-500/15 blur-[115px]"
        />

        {/* Subtle watercolor paper grain overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 max-w-6xl mx-auto w-full px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center -ml-1.5 transition-transform group-hover:scale-105">
            <Image alt="TRPickle Logo" src={logoPic} width={44} height={44} className="object-contain" />
          </div>
          <Image alt="TRPickle.com" src={logoTextPic} width={138} height={26} className="object-contain hidden sm:block" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Step Indicator Pills */}
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-800 shadow-sm">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === s 
                    ? "w-6 bg-lime-500 shadow-sm shadow-lime-500/50" 
                    : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                title={`${s}. Ekrana Geç`}
              />
            ))}
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            Siteye Geç →
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ========================================================
              SCREEN 1: HERO VIEW - "İLK VURUŞ"
             ======================================================== */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-lime-400/40 dark:border-lime-500/30 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 shadow-sm mb-6 sm:mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-lime-500 animate-ping" />
                <span className="text-lime-600 dark:text-lime-400 font-black">QR ÖZEL</span> • Topluluğa Hoş Geldin
              </motion.div>

              {/* CENTER 3D FLOATING BALL (ANTIGRAVITY EFFECT) */}
              <div className="relative my-4 sm:my-8 flex flex-col items-center justify-center">
                
                {/* Neon Glow Behind Ball */}
                <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-lime-400/40 dark:bg-lime-500/30 blur-2xl pointer-events-none animate-pulse" />

                {/* Floating Ball Container */}
                <motion.div
                  animate={
                    isExploding
                      ? { scale: [1, 4.2], opacity: [1, 0], rotate: 180 }
                      : {
                          y: [-14, 14, -14],
                          rotate: [-5, 5, -5],
                        }
                  }
                  transition={
                    isExploding
                      ? { duration: 0.65, ease: "easeIn" }
                      : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
                  }
                  onClick={handleHitBall}
                  className="relative cursor-pointer select-none group"
                >
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center drop-shadow-[0_20px_25px_rgba(132,204,22,0.45)] transition-transform group-hover:scale-105">
                    <Image
                      alt="3D Neon Pickleball Topu"
                      src={logoPic}
                      width={192}
                      height={192}
                      priority
                      className="object-contain w-full h-full"
                    />
                  </div>
                </motion.div>

                {/* Dynamic Shadow Below Floating Ball */}
                {!isExploding && (
                  <motion.div
                    animate={{
                      scale: [1, 0.75, 1],
                      opacity: [0.6, 0.25, 0.6],
                    }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 sm:w-32 h-3 sm:h-4 rounded-full bg-slate-400/40 dark:bg-black/60 blur-md mt-4"
                  />
                )}
              </div>

              {/* VURUCU BAŞLIK */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.12] mt-4 mb-4 text-slate-900 dark:text-white"
              >
                Yeni Hobini <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 dark:from-lime-400 dark:via-emerald-400 dark:to-teal-400">
                  Öğrenmeye Hazır Mısın?
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed"
              >
                Dünyanın en hızlı büyüyen sporuyla tanış. Her yaşa, her kondisyona uygun eşsiz bir sosyal heyecan.
              </motion.p>

              {/* İNTERAKTİF AKSİYON BUTONU */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHitBall}
                disabled={isExploding}
                className="relative group overflow-hidden px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-black text-lg sm:text-xl shadow-xl shadow-lime-500/30 flex items-center justify-center gap-3 transition-all duration-300 border border-lime-300/50"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Topa Vur ve Başla! 🚀
                </span>
                <div className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
              </motion.button>

              <p className="mt-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                👆 Topa veya butona dokunduğunda raket sesi eşliğinde başlarsın
              </p>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 2: NEDEN PICKLEBALL? (3 ADIMDA HİPNOZ)
             ======================================================== */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl mx-auto flex flex-col items-center my-auto"
            >
              {/* Top Step Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm mb-4">
                <Sparkles className="w-4 h-4 text-lime-500" />
                <span>3 Adımda Pickleball Hipnozu</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-center tracking-tight mb-3 text-slate-900 dark:text-white">
                Neden Pickleball?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-center font-medium max-w-xl mx-auto mb-8 sm:mb-12">
                Hem tenis kadar heyecanlı, hem masa tenisi kadar dinamik. İşte milyonların bağımlısı olduğu 3 neden:
              </p>

              {/* 3 CLEAN MINIMALIST CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mb-10">
                
                {/* KART 1: KOLAYLIK */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-between group hover:border-lime-400/70 transition-all"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-lime-400/20 dark:bg-lime-400/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase text-lime-600 dark:text-lime-400 mb-1.5 block">
                      01 • Kolaylık
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5">
                      Kolayca Öğren.
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                      Yıllarca ders almana gerek yok, kolayca öğrenip arkadaşlarınla maç yapabilecek seviyeye gelebilirsin!
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-lime-500" /> İlk gün maç keyfi
                  </div>
                </motion.div>

                {/* KART 2: SOSYAL */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -6 }}
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-between group hover:border-emerald-400/70 transition-all relative overflow-hidden"
                >
                  {/* Subtle logo badge */}
                  <div className="absolute top-4 right-4 opacity-15 dark:opacity-10 pointer-events-none">
                    <Image alt="Logo" src={logoPic} width={52} height={52} />
                  </div>

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 dark:bg-emerald-400/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-1.5 block">
                      02 • Sosyal Ağ
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5">
                      Kortta Muhabbet Dönüyor.
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                      Alan dar, herkes yakın. Sadece bir spor değil, tam bir sosyal ağ ve yeni arkadaşlıklar!
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Partner & Rakip Bulma
                  </div>
                </motion.div>

                {/* KART 3: ERİŞİLEBİLİRLİK */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -6 }}
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-between group hover:border-teal-400/70 transition-all"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-400/20 dark:bg-teal-400/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Smile className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase text-teal-600 dark:text-teal-400 mb-1.5 block">
                      03 • Herkes İçin
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5">
                      Kondisyon Şart Değil.
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                      Yaş, kilo, deneyim fark etmez. Korta çıkan herkes eğlenir ve anında oyuna dahil olur.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" /> Yaş & Seviye Sınırı Yok
                  </div>
                </motion.div>

              </div>

              {/* NEXT BUTTON */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-base sm:text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2.5"
                >
                  <span>Büyük Kapanışı Gör</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Vuruşu Tekrarla
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 3: BÜYÜK KAPANIŞ VE ÇAĞRI (CTA)
             ======================================================== */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-3xl mx-auto flex flex-col items-center text-center my-auto"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-lime-500/30 mb-6">
                <Image alt="Logo" src={logoPic} width={64} height={64} className="object-contain" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                Sokakta kalma, korta çık.
              </h2>

              <p className="text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
                TRPickle ile şehrindeki oyuncuları bul, maçını ayarla ve Türkiye sıralamanda yükselmeye başla.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto flex-1 px-8 py-5 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-black text-lg shadow-xl shadow-lime-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <span>Topluluğa Adım At</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-base border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all flex items-center justify-center"
                >
                  Ana Sayfaya Göz At
                </Link>
              </div>

              {/* Feature Highlights bottom strip */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-lg">
                <div className="text-center">
                  <span className="block text-lg font-black text-lime-600 dark:text-lime-400">100%</span>
                  <span className="text-xs font-bold text-slate-500">Ücretsiz Üyelik</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">81 İl</span>
                  <span className="text-xs font-bold text-slate-500">Oyuncu & Kort Ağı</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-black text-teal-600 dark:text-teal-400">Canlı Puan</span>
                  <span className="text-xs font-bold text-slate-500">Dinamik Seviye</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Karşılama Ekranını Baştan Oyna
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER MINI BAR */}
      <footer className="relative z-20 max-w-6xl mx-auto w-full px-5 sm:px-8 py-4 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-900/60">
        <div>© {new Date().getFullYear()} TRPickle. Türkiye'nin Pickleball Topluluğu.</div>
        <div className="flex items-center gap-4">
          <Link href="/academy" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Akademi
          </Link>
          <Link href="/leaderboard" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Sıralama
          </Link>
        </div>
      </footer>
    </div>
  );
}
