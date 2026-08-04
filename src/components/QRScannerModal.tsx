"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertCircle, Loader2 } from "lucide-react";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const requestRef = useRef<number>();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setIsScanning(true);
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        setError("Kamera izni alınamadı veya kamera bulunamadı.");
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code) {
          handleScan(code.data);
          return; // Stop scanning once found
        }
      }
    }
    
    if (isOpen) {
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  const handleScan = (data: string) => {
    try {
      const url = new URL(data);
      if (url.pathname.startsWith('/profile/')) {
        toast.success("Profil bulundu, yönlendiriliyor...");
        onClose();
        router.push(url.pathname);
      } else if (url.pathname === '/scan') {
        const payloadData = url.searchParams.get('data');
        if (payloadData) {
          toast.success("QR başarıyla okundu!");
          onClose();
          router.push(`/scan?data=${encodeURIComponent(payloadData)}`);
        } else {
          toast.error("Geçersiz maç QR kodu.");
        }
      } else {
        toast.error("Trpickle ile uyumlu olmayan bir QR kod.");
      }
    } catch (e) {
      toast.error("Geçersiz QR kod formatı.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800"
        >
          {/* Header */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-900/80 to-transparent">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Camera className="w-5 h-5" />
              <span>QR Okuyucu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative aspect-[3/4] w-full bg-black flex items-center justify-center">
            {error ? (
              <div className="flex flex-col items-center gap-3 text-red-400 p-6 text-center">
                <AlertCircle className="w-10 h-10" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            ) : !isScanning ? (
              <div className="flex flex-col items-center gap-3 text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-bold">Kamera Açılıyor...</p>
              </div>
            ) : null}

            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay (Scanner Frame) */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative">
                <div className="absolute -inset-1 border-4 border-emerald-500/20 rounded-3xl animate-pulse" />
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl" />
                {/* Scanning line */}
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-4 right-4 h-0.5 bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
                />
              </div>
            </div>
          </div>
          
          <div className="p-5 text-center bg-slate-900 border-t border-slate-800">
            <p className="text-sm font-medium text-gray-400">
              Maç veya Profil QR Kodunu çerçevenin içine hizalayın
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
