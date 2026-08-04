"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Trophy, MapPin, Sparkles, Check, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface MatchLobbyQrCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  payloadJSON: string;
  format: "singles" | "doubles";
  team1Score: number;
  team2Score: number;
  location: string;
}

export default function MatchLobbyQrCreateModal({
  isOpen,
  onClose,
  payloadJSON,
  format,
  team1Score,
  team2Score,
  location,
}: MatchLobbyQrCreateModalProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trpickle.com';
  const qrUrl = `${baseUrl}/scan?data=${typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(payloadJSON))) : ''}`;
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Maç Lobisi QR Kodu</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Oyuncular okutarak tarafını seçebilir</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">
            <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <span>{format === "singles" ? "1v1 Tekler Maçı" : "2v2 Çiftler Maçı"}</span>
              <span className="text-slate-900 dark:text-white font-extrabold">Skor: {team1Score} - {team2Score}</span>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-xl border-4 border-emerald-500/20 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={220}
                fgColor="#047857"
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

            <div className="text-center flex flex-col gap-1.5">
              <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                Oyuncuların QR Tara ile okutması yeterli!
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Okutan kullanıcılar tarafını seçip onayladığında maç otomatik olarak kaydedilir ve onay istemez.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
