"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Camera, Check, UserCheck, ShieldAlert, Sparkles, Users, RefreshCw, AlertCircle, Trophy, MapPin, ArrowRight } from "lucide-react";
import { useStore, User } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import jsQR from "jsqr";

interface UniversalQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MatchLobbyPayload {
  type: "match_lobby";
  format: "singles" | "doubles";
  creatorId: number;
  creatorName: string;
  date: string;
  location: string;
  team1Score: number;
  team2Score: number;
}

export default function UniversalQrScannerModal({ isOpen, onClose }: UniversalQrScannerModalProps) {
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const addMatch = useStore(state => state.addMatch);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedLobby, setScannedLobby] = useState<MatchLobbyPayload | null>(null);
  const [selectedSide, setSelectedSide] = useState<"team2_singles" | "team1_partner" | "team2_player1" | "team2_player2" | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const parseQrData = (rawData: string) => {
    if (!rawData) return;
    const trimmed = rawData.trim();

    // 1. Profile QR check
    const profileMatch = trimmed.match(/^profile:(\d+)$/) || trimmed.match(/\/profile\/(\d+)/);
    if (profileMatch && profileMatch[1]) {
      const targetUserId = parseInt(profileMatch[1], 10);
      stopCamera();
      toast.success("Kişi profiline yönlendiriliyorsunuz...");
      onClose();
      router.push(`/profile/${targetUserId}`);
      return;
    }

    // 2. JSON Payload check
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.type === "profile" && parsed.userId) {
        stopCamera();
        toast.success("Kişi profiline yönlendiriliyorsunuz...");
        onClose();
        router.push(`/profile/${parsed.userId}`);
        return;
      }
      if (parsed && parsed.type === "match_lobby") {
        stopCamera();
        setScannedLobby(parsed as MatchLobbyPayload);
        toast.success("Maç kodu okundu! Lütfen tarafınızı seçin.");
        return;
      }
    } catch (e) {
      // Not JSON
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);
    setScannedLobby(null);
    setSelectedSide(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tarayıcınız kamera erişimini desteklemiyor veya izin vermiyor.");
      setIsScanning(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        scanFrame();
      }
    } catch (err: any) {
      setIsScanning(false);
      setCameraError("Kamera açılamadı. Lütfen kamera izni verdiğinizden emin olun.");
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        parseQrData(code.data);
        return;
      }
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedLobby(null);
      setSelectedSide(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const handleConfirmMatchSide = () => {
    if (!currentUser) {
      toast.error("Maça katılmak için giriş yapmalısınız.");
      return;
    }
    if (!scannedLobby || !selectedSide) {
      toast.error("Lütfen oynamak istediğiniz tarafı seçin.");
      return;
    }

    if (currentUser.id === scannedLobby.creatorId) {
      toast.error("Maçı oluşturan kişi olarak kendi QR kodunuzu okutamazsınız.");
      return;
    }

    // Build teams based on format
    let team1: (number | string)[] = [scannedLobby.creatorId];
    let team2: (number | string)[] = [];

    if (scannedLobby.format === "singles") {
      team2 = [currentUser.id];
    } else {
      if (selectedSide === "team1_partner") {
        team1 = [scannedLobby.creatorId, currentUser.id];
        // Team2 can be filled later or marked as pending players
      } else {
        team2 = [currentUser.id];
      }
    }

    // Auto-approve match since both parties interacted via QR
    addMatch({
      date: scannedLobby.date || new Date().toISOString().split("T")[0],
      location: scannedLobby.location || "Kort Belirtilmedi",
      matchFormat: scannedLobby.format,
      team1,
      team2,
      team1Score: scannedLobby.team1Score,
      team2Score: scannedLobby.team2Score,
      eloChange: { team1Change: 0, team2Change: 0, team1Changes: [], team2Changes: [] },
      status: "approved",
      submittedBy: scannedLobby.creatorName,
      approvedBy: [scannedLobby.creatorName, currentUser.name],
    });

    toast.success("Maç otomatik olarak kaydedildi ve onaylandı! 🎾👑");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">QR Okutucu</h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Profil veya Maç QR Kodu Tara</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">
            {!scannedLobby ? (
              <>
                {/* Live Scanner View */}
                <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 shadow-inner flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {isScanning && (
                    <motion.div
                      animate={{ y: [0, 240, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
                    />
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center gap-3">
                      <AlertCircle className="w-10 h-10 text-amber-500" />
                      <p className="text-xs font-bold text-gray-300">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
                      >
                        Tekrar Deneyin
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    Kameranızı QR koda doğru tutun
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Profil QR&apos;ı okutulunca profile yönlendirilir, Maç QR&apos;ı okutulunca taraf seçtirir.
                  </p>
                </div>
              </>
            ) : (
              /* Scanned Match Lobby Side Picker */
              <div className="w-full flex flex-col gap-5">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> Maç Kodu Algılandı
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      {scannedLobby.format === "singles" ? "1v1 Tekler" : "2v2 Çiftler"}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {scannedLobby.creatorName} • Skor: {scannedLobby.team1Score} - {scannedLobby.team2Score}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {scannedLobby.location} ({scannedLobby.date})
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-gray-300">
                    Hangi Tarafta Oynadığınızı Seçin:
                  </label>

                  {scannedLobby.format === "singles" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedSide("team2_singles")}
                      className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between ${
                        selectedSide === "team2_singles"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm"
                          : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-gray-300"
                      }`}
                    >
                      <span>Rakip Oyuncu (Takım 2)</span>
                      {selectedSide === "team2_singles" && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedSide("team1_partner")}
                        className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between ${
                          selectedSide === "team1_partner"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm"
                            : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-gray-300"
                        }`}
                      >
                        <div>
                          <div className="font-extrabold">Takım 1 Partneri</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            ({scannedLobby.creatorName} ile aynı takımda)
                          </div>
                        </div>
                        {selectedSide === "team1_partner" && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSide("team2_player1")}
                        className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between ${
                          selectedSide === "team2_player1"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm"
                            : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-gray-300"
                        }`}
                      >
                        <div>
                          <div className="font-extrabold">Karşı Takım (Takım 2)</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            (Rakip takım oyuncusu olarak katıl)
                          </div>
                        </div>
                        {selectedSide === "team2_player1" && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScannedLobby(null);
                      startCamera();
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold text-xs transition-colors"
                  >
                    Yeniden Tara
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmMatchSide}
                    disabled={!selectedSide}
                    className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    Seçimi Onayla & Kaydet <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
