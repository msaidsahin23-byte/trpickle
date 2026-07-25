"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Camera, Check, UserPlus, ShieldAlert, Sparkles, Users, RefreshCw, AlertCircle } from "lucide-react";
import { User } from "@/store/useStore";
import toast from "react-hot-toast";
import jsQR from "jsqr";

interface QrMatchScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchFormat: "singles" | "doubles";
  allUsers: User[];
  alreadySelectedIds: (number | string)[];
  onPlayerScanned: (user: User, doublesRole?: "team1_partner" | "team2") => void;
}

export default function QrMatchScannerModal({
  isOpen,
  onClose,
  matchFormat,
  allUsers,
  alreadySelectedIds,
  onPlayerScanned
}: QrMatchScannerModalProps) {
  const [scannedUserForDecision, setScannedUserForDecision] = useState<User | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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

  const parseScannedUserId = (rawData: string): number | null => {
    if (!rawData) return null;
    const urlMatch = rawData.match(/\/profile\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
      return parseInt(urlMatch[1], 10);
    }
    if (/^\d+$/.test(rawData.trim())) {
      return parseInt(rawData.trim(), 10);
    }
    try {
      const obj = JSON.parse(rawData);
      if (obj && obj.id) return Number(obj.id);
    } catch(e) {}
    return null;
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tarayıcınız kamera erişimini desteklemiyor veya SSL/HTTPS gerektiriyor.");
      setIsScanning(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
        });
      } catch (err) {
        // Fallback to default front/webcam camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        scanLoop();
      }
    } catch (err: any) {
      setCameraError("Kameraya erişim izni verilmedi veya kamera meşgul.");
      setIsScanning(false);
    }
  };

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        const detectedId = parseScannedUserId(code.data);
        if (detectedId) {
          const foundUser = allUsers.find(u => u.id === detectedId);
          if (foundUser) {
            stopCamera();
            if (navigator.vibrate) try { navigator.vibrate(100); } catch(e) {}
            handleTriggerUserScan(foundUser);
            return;
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop);
  };

  const handleImageFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data) {
          const detectedId = parseScannedUserId(code.data);
          if (detectedId) {
            const foundUser = allUsers.find(u => u.id === detectedId);
            if (foundUser) {
              toast.success("Fotoğraftan QR kod başarıyla algılandı!");
              stopCamera();
              handleTriggerUserScan(foundUser);
              return;
            } else {
              toast.error("QR koddaki oyuncu sistemde bulunamadı.");
            }
          } else {
            toast.error("Geçerli bir TRPickle QR kodu bulunamadı.");
          }
        } else {
          toast.error("Seçilen fotoğrafta QR kod algılanamadı. Lütfen net bir QR fotoğrafı seçin.");
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (isOpen && !scannedUserForDecision) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scannedUserForDecision]);

  if (!isOpen) return null;

  const handleTriggerUserScan = (user: User) => {
    if (alreadySelectedIds.includes(user.id)) {
      toast.error(`${user.name} zaten bu maçta seçili!`);
      if (isOpen && !scannedUserForDecision) startCamera();
      return;
    }

    if (matchFormat === "singles") {
      onPlayerScanned(user);
      toast.success(`🎾 ${user.name} karşı takıma (Rakip) eklendi!`);
      stopCamera();
      onClose();
    } else {
      stopCamera();
      setScannedUserForDecision(user);
    }
  };

  const handleDoublesChoice = (role: "team1_partner" | "team2") => {
    if (!scannedUserForDecision) return;
    onPlayerScanned(scannedUserForDecision, role);
    toast.success(
      role === "team1_partner"
        ? `🤝 ${scannedUserForDecision.name} takım arkadaşınız olarak eklendi!`
        : `⚔️ ${scannedUserForDecision.name} rakip takıma eklendi!`
    );
    setScannedUserForDecision(null);
    onClose();
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-500/20 text-lime-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Canlı QR Kamera Tarayıcısı</h3>
                <p className="text-xs text-gray-400">
                  {matchFormat === "singles"
                    ? "1v1 Tekler • Okutulan oyuncu direkt rakip seçilir"
                    : "2v2 Çiftler • Okutulduğunda takım konumu sorulur"}
                </p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {scannedUserForDecision ? (
              /* 2v2 Karar Ekranı */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5 py-4"
              >
                <div className="relative">
                  <img
                    src={scannedUserForDecision.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                    alt={scannedUserForDecision.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-lime-400 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-lime-400 text-black px-2 py-0.5 rounded-full text-xs font-black">
                    ⭐ {(scannedUserForDecision.doublesRating || 3.5).toFixed(2)}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-black text-white">{scannedUserForDecision.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Bu oyuncuyu hangi konuma eklemek istiyorsunuz?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
                  <button
                    onClick={() => handleDoublesChoice("team1_partner")}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-500/40 text-emerald-300 transition-all font-black"
                  >
                    <UserPlus className="w-6 h-6 text-emerald-400" />
                    <span>🤝 Takım Arkadaşım</span>
                    <span className="text-[11px] font-normal text-gray-400">Takım 1 (2. Oyuncu)</span>
                  </button>

                  <button
                    onClick={() => handleDoublesChoice("team2")}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border-2 border-red-500/40 text-red-300 transition-all font-black"
                  >
                    <Users className="w-6 h-6 text-red-400" />
                    <span>⚔️ Rakip Takıma Ekle</span>
                    <span className="text-[11px] font-normal text-gray-400">Takım 2 Oyuncusu</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setScannedUserForDecision(null);
                  }}
                  className="mt-2 text-xs font-bold text-gray-400 hover:text-white underline"
                >
                  Geri Dön / Başka QR Okut
                </button>
              </motion.div>
            ) : (
              /* Gerçek HTML5 Kamera Viewfinder */
              <div className="flex flex-col items-center gap-5">
                {/* Real Live Video Frame */}
                <div className="relative w-72 h-72 rounded-3xl bg-black border-2 border-lime-500/50 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                  {cameraError ? (
                    <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-10 h-10 text-amber-400" />
                      <p className="text-xs text-amber-200 font-bold max-w-[200px]">
                        {cameraError}
                      </p>
                      <button
                        onClick={startCamera}
                        className="mt-2 px-4 py-1.5 rounded-xl bg-lime-400 text-black font-black text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Kamerayı Yeniden Dene</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Laser Line Overlay */}
                      <motion.div
                        animate={{ y: [-130, 130] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent shadow-[0_0_15px_#84cc16] z-10"
                      />

                      {/* Scanner Frame Corners */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-lime-400 rounded-tl-lg z-10 pointer-events-none" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-lime-400 rounded-tr-lg z-10 pointer-events-none" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-lime-400 rounded-bl-lg z-10 pointer-events-none" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-lime-400 rounded-br-lg z-10 pointer-events-none" />

                      <div className="absolute bottom-2 left-0 right-0 text-center z-10 bg-black/60 py-1 px-2">
                        <span className="text-[11px] font-extrabold text-lime-400 tracking-wide">
                          Kamerayı QR Karta Tutun
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* HTTPS / SSL Olmadan Test & Fotoğraftan QR Okuma */}
                <div className="w-full">
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-lime-500/20 via-emerald-500/20 to-teal-500/20 hover:from-lime-500/30 hover:to-teal-500/30 border border-lime-500/40 text-lime-300 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-md text-center">
                    <Camera className="w-4 h-4 text-lime-400 shrink-0" />
                    <span>🖼️ Fotoğraf / Ekran Görüntüsü ile QR Okut (HTTPS Gerektirmez)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileScan}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Hızlı Seçim Listesi (Masaüstü ve Yedek Okutma İçin) */}
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs font-black text-gray-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                      Yedek Hızlı Oyuncu Seçimi (Kamera Dışı)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {allUsers.map((u) => {
                      const isSelected = alreadySelectedIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          disabled={isSelected}
                          onClick={() => handleTriggerUserScan(u)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                            isSelected
                              ? "bg-slate-800/40 border-slate-800 text-gray-500 cursor-not-allowed"
                              : "bg-slate-800/80 hover:bg-lime-500/15 border-slate-700/80 hover:border-lime-500/40 text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                              alt={u.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-extrabold text-xs truncate">{u.name}</div>
                              <div className="text-[10px] text-gray-400">
                                ⭐ {(matchFormat === "singles" ? u.singlesRating : u.doublesRating)?.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-lime-500/20 text-lime-400 text-[10px] font-black shrink-0">
                            {isSelected ? "Seçili" : "Seç"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
