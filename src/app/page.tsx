"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import logoPic from "@/assets/logo.png";
import logoTextPic from "@/assets/logo-text.png";
import { Trophy, Activity, Users, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore, User, MatchRecord } from "@/store/useStore";

export default function LandingPage() {
  const users = useStore(state => state.users);
  const matches = useStore(state => state.matches);
  
  const [randomUser, setRandomUser] = useState<(User & { rank: number }) | null>(null);
  const [latestMatch, setLatestMatch] = useState<MatchRecord | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateShowcase = () => {
      const sortedUsers = [...users].sort((a, b) => b.singlesRating - a.singlesRating);
      const top20 = sortedUsers.slice(0, 20);
      if (top20.length > 0) {
        const randIdx = Math.floor(Math.random() * top20.length);
        setRandomUser({ ...top20[randIdx], rank: randIdx + 1 });
      }

      const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sortedMatches.length > 0) {
        setLatestMatch(sortedMatches[0]);
      }
    };

    updateShowcase();

    const interval = setInterval(() => {
      updateShowcase();
    }, 3000);

    return () => clearInterval(interval);
  }, [users.length, matches.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white  text-pb-dark  selection:bg-pb-green/30 transition-colors duration-300">
      
      {/* Animated Breathing Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-pb-green/10 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-pb-blue/5 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-gray-100/80 blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Landing Navbar */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-transparent -ml-2">
              <Image alt="TRPickle Logo" className="object-contain" height={64} src={logoPic} width={64} />
            </div>
            <Image alt="TRPickle.com Logo" className="object-contain" height={32} src={logoTextPic} width={203} />
          </div>
          <Link href="/auth" className="font-bold text-gray-600  hover:text-pb-dark :text-white transition-colors">
            Giriş Yap
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white  shadow-sm border border-gray-100  text-sm font-bold text-gray-600  mb-8">
              <span className="w-2 h-2 rounded-full bg-pb-green animate-pulse"></span>
              Yeni Nesil Spor Topluluğu
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6">
              Türkiye'nin Pickleball Ekosistemine <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-400  ">Hoş Geldin.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-500  font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Kortları keşfet, partner bul, skorlarını gir ve akıllı dinamik seviye algoritması ile Türkiye sıralamanı yükselt. Oyun başlasın!
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start flex-wrap">
              <Link href="/auth" className="w-full sm:w-auto px-8 py-4 bg-pb-green text-pb-dark rounded-full font-bold text-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group">
                Hemen Başla
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/welcome" className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-lime-500/15 to-emerald-500/15 border border-lime-400/60 text-pb-dark dark:text-white rounded-full font-extrabold text-base shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <span>📱 QR Karşılama Deneyimi</span>
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white  text-pb-dark  rounded-full font-bold text-lg shadow-sm border border-gray-100  hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Daha Fazla Bilgi
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Floating Elements */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[400px] lg:h-[500px] hidden md:block">
            
            {isClient && randomUser && (
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] right-[10%] bg-white/80  backdrop-blur-md border border-white/40  p-6 rounded-3xl shadow-xl w-64"
              >
                <div className="flex items-center gap-4 mb-3">
                  {randomUser.avatarUrl ? (
                    <img src={randomUser.avatarUrl} alt={randomUser.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center font-bold text-lg">
                      {randomUser.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm truncate w-32">{randomUser.name}</h4>
                    <p className="text-xs text-gray-500  font-medium">Türkiye #{randomUser.rank}</p>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-pb-dark  tracking-tighter">{randomUser.singlesRating.toFixed(2)}</span>
                  <span className="text-sm font-bold text-pb-green mb-1 flex items-center">+0.15 <Trophy className="w-3 h-3 ml-1"/></span>
                </div>
              </motion.div>
            )}

            {isClient && latestMatch && (
              <motion.div 
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] left-[0%] bg-white  p-5 rounded-3xl shadow-xl border border-gray-100  w-72"
              >
                <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Son Skor</div>
                <div className="flex justify-between items-center bg-gray-50  rounded-2xl p-4">
                  <div className="text-center w-1/3">
                    <div className="font-bold text-sm mb-1 truncate" title={users.find(u => u.id === latestMatch.team1[0])?.name || "Oyuncu 1"}>
                      {users.find(u => u.id === latestMatch.team1[0])?.name.split(' ')[0] || "Oyuncu 1"}
                    </div>
                    <div className="text-3xl font-extrabold text-pb-green">{latestMatch.team1Score}</div>
                  </div>
                  <div className="text-gray-300  font-bold px-2">-</div>
                  <div className="text-center w-1/3">
                    <div className="font-bold text-sm mb-1 truncate" title={users.find(u => u.id === latestMatch.team2[0])?.name || "Oyuncu 2"}>
                      {users.find(u => u.id === latestMatch.team2[0])?.name.split(' ')[0] || "Oyuncu 2"}
                    </div>
                    <div className="text-3xl font-extrabold text-pb-dark ">{latestMatch.team2Score}</div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* Academy Banner */}
        <div className="py-12 relative z-10 w-full mt-10 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-pb-dark text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 border border-gray-800"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Pickleball oynamayı bilmiyor musun?</h2>
              <p className="text-gray-400 font-medium text-lg">Hiç sorun değil. TRPickle Akademi ile temel kuralları, taktikleri ve vuruş tekniklerini hemen öğrenmeye başla!</p>
            </div>
            <Link href="/academy" className="shrink-0 px-8 py-4 bg-pb-green text-pb-dark rounded-full font-bold text-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              Akademiye Git
            </Link>
          </motion.div>
        </div>

        {/* Feature Showcase */}
        <div id="features" className="py-24 border-t border-gray-100/50  relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold mb-4">Her Şey Tek Bir Yerde</h2>
            <p className="text-gray-500  font-medium max-w-xl mx-auto">Pickleball deneyimini dijitale taşıyan devrimsel özellikler.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Dinamik Rating Sistemi",
                desc: "Elo algoritması ile maç sonuçlarına göre güncellenen, adil ve rekabetçi sıralama tablosu."
              },
              {
                icon: Users,
                title: "Sosyal Akış",
                desc: "Toplulukla bağını koparma. Galibiyetlerini paylaş, anketler yap ve diğer oyuncularla etkileşime geç."
              },
              {
                icon: MapPin,
                title: "Kort & Partner Bulma",
                desc: "Sana en uygun seviyedeki oyuncularla eşleş, şehrindeki kortları kolayca keşfet."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-white  p-8 rounded-3xl shadow-sm border border-gray-100  hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-gray-50  rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pb-green/10 :bg-pb-green/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-pb-dark  group-hover:text-pb-green transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500  font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
