"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Loader2, QrCode, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const incrementQrScan = useStore(state => state.incrementQrScan);
  const addMatch = useStore(state => state.addMatch);
  
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setError("Geçersiz veya eksik QR verisi.");
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(window.atob(data)));
      const parsed = JSON.parse(decoded);
      
      if (parsed.type === "match_lobby") {
        setPayload(parsed);
      } else {
        setError("Desteklenmeyen QR kod tipi.");
      }
    } catch (err) {
      setError("QR kod çözümlenemedi. Geçersiz format.");
    }
  }, [searchParams]);

  const handleJoin = (role: "opponent" | "team1_partner" | "team2") => {
    if (!currentUser) {
      toast.error("Lütfen önce giriş yapın.");
      router.push("/auth");
      return;
    }
    
    if (currentUser.id === payload.creatorId) {
      toast.error("Kendi oluşturduğunuz maça katılamazsınız.");
      return;
    }

    setIsProcessing(true);

    // Limit kontrolü
    const currentCount = useStore.getState().qrScans[payload.qrId] || 0;
    if (currentCount >= payload.maxUses) {
      setError("Bu QR kod kullanım limitini doldurmuştur.");
      setIsProcessing(false);
      return;
    }

    incrementQrScan(payload.qrId);

    let team1 = [payload.creatorId];
    let team2: (string | number)[] = [];

    if (payload.format === "singles") {
      team2 = [currentUser.id];
    } else {
      if (role === "team1_partner") {
        team1 = [payload.creatorId, currentUser.id];
      } else {
        team2 = [currentUser.id];
      }
    }

    const matchRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      matchFormat: payload.format,
      team1,
      team2,
      team1Score: payload.team1Score,
      team2Score: payload.team2Score,
      location: payload.location,
      eventName: "QR Hızlı Maç",
      status: "approved" as const, // Otomatik onaylı
      isPending: false,
      eloChange: { team1Change: 0, team2Change: 0 },
      approvals: { [payload.creatorId]: true, [currentUser.id]: true }
    };

    addMatch(matchRecord);
    toast.success("Maç başarıyla kaydedildi!");
    router.push("/feed");
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 pb-24 flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">QR Kod Hatası</h2>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen pt-20 px-4 pb-24 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="font-bold text-slate-500">QR Kod Çözümleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 max-w-lg mx-auto">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
          <QrCode className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Maça Katıl</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
          <strong className="text-slate-900 dark:text-white">{payload.creatorName}</strong> seni bir maça davet ediyor!
        </p>

        <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Format</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {payload.format === "singles" ? "1v1 Tekler" : "2v2 Çiftler"}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Skor</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {payload.team1Score} - {payload.team2Score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Kort</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {payload.location}
            </span>
          </div>
        </div>

        {payload.format === "singles" ? (
          <button
            onClick={() => handleJoin("opponent")}
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
            Rakip Olarak Katıl ve Onayla
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => handleJoin("team1_partner")}
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center"
            >
              Takım 1&apos;e Katıl (Kurucu ile Aynı Takım)
            </button>
            <button
              onClick={() => handleJoin("team2")}
              disabled={isProcessing}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center"
            >
              Takım 2&apos;ye Katıl (Rakip Takım)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500"/></div>}>
      <ScanContent />
    </Suspense>
  );
}
