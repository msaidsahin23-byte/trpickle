"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { MessageSquare, Bell, X, UserPlus, Heart, Award } from "lucide-react";
import Image from "next/image";

type ToastAlert = {
  id: string;
  title: string;
  subtitle?: string;
  type: "message" | "notification";
  avatarUrl?: string;
  link?: string;
};

export default function NotificationBanner() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const directMessages = useStore((state) => state.directMessages);

  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialMountRef = useRef(true);

  // Mark all currently existing unread items on initial mount so we don't toast historical unread items
  useEffect(() => {
    if (!currentUser) return;
    if (initialMountRef.current) {
      initialMountRef.current = false;
      (directMessages || []).forEach((msg) => {
        seenIdsRef.current.add(msg.id);
      });
      (currentUser.notifications || []).forEach((notif) => {
        seenIdsRef.current.add(String(notif.id));
      });
    }
  }, [currentUser, directMessages]);

  useEffect(() => {
    if (!currentUser || initialMountRef.current) return;

    const newToasts: ToastAlert[] = [];

    // Check for new Direct Messages
    (directMessages || []).forEach((msg) => {
      if (
        msg.receiverId === currentUser.id &&
        !msg.isRead &&
        !seenIdsRef.current.has(msg.id)
      ) {
        seenIdsRef.current.add(msg.id);
        const sender = users.find((u) => u.id === msg.senderId);
        newToasts.push({
          id: msg.id,
          title: `${sender ? sender.name : "Bir kullanıcı"}'dan yeni mesaj var!`,
          subtitle: msg.content.length > 40 ? msg.content.slice(0, 40) + "..." : msg.content,
          type: "message",
          avatarUrl: sender?.avatarUrl,
          link: "/messages",
        });
      }
    });

    // Check for new Notifications
    (currentUser.notifications || []).forEach((notif) => {
      const notifIdStr = String(notif.id);
      if (!notif.isRead && !seenIdsRef.current.has(notifIdStr)) {
        seenIdsRef.current.add(notifIdStr);
        newToasts.push({
          id: notifIdStr,
          title: "Yeni Bildirim",
          subtitle: notif.message,
          type: "notification",
          link: "/notifications",
        });
      }
    });

    if (newToasts.length > 0) {
      setToasts((prev) => {
        const combined = [...newToasts, ...prev];
        const unique: ToastAlert[] = [];
        const seenSubtitle = new Set<string>();
        combined.forEach((t) => {
          const key = `${t.title}-${t.subtitle}`;
          if (!seenSubtitle.has(key)) {
            seenSubtitle.add(key);
            unique.push(t);
          }
        });
        return unique.slice(0, 3);
      });
    }
  }, [directMessages, currentUser, users]);

  // Auto-dismiss each toast after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(0, prev.length - 1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 120, scale: 0.85, rotate: 5 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => {
              removeToast(toast.id);
              if (toast.link) router.push(toast.link);
            }}
            className="pointer-events-auto cursor-pointer group relative overflow-visible bg-slate-900/95 backdrop-blur-xl border border-pb-green/30 hover:border-pb-green shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),_0_0_20px_rgba(200,245,96,0.15)] rounded-2xl p-4 flex items-center gap-3 transition-all duration-300"
          >
            {/* The Bouncing Pickleball */}
            <motion.div 
               initial={{ y: -80, opacity: 0, rotate: -180 }}
               animate={{ y: [0, -20, 0, -8, 0], opacity: 1, rotate: 0 }}
               transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
               className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-pb-green shadow-[0_0_20px_rgba(200,245,96,0.8)] flex items-center justify-center border-[3px] border-slate-900 z-10 overflow-hidden"
            >
               {/* Ball holes pattern */}
               <div className="w-full h-full flex flex-wrap items-center justify-center gap-[1px] opacity-40 p-[2px]">
                 {[...Array(6)].map((_, i) => (
                   <span key={i} className="w-1 h-1 rounded-full bg-slate-900" />
                 ))}
               </div>
            </motion.div>

            {/* Subtle Court Lines Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white" />
              <div className="absolute top-0 left-1/2 w-[2px] h-full bg-white" />
              <div className="absolute top-3 left-3 right-3 bottom-3 border-2 border-white rounded" />
            </div>

            {/* Glowing left edge */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pb-green to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Icon or Avatar */}
            <div className="flex-shrink-0 ml-2 z-10">
              {toast.avatarUrl ? (
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-pb-green/50 group-hover:border-pb-green transition-colors">
                  <Image
                    src={toast.avatarUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : toast.type === "message" ? (
                <div className="w-11 h-11 rounded-full bg-pb-green/20 text-pb-green flex items-center justify-center border-2 border-pb-green/50 group-hover:border-pb-green transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6 z-10">
              <p className="text-sm font-black text-white tracking-wide truncate group-hover:text-pb-green transition-colors drop-shadow-md">
                {toast.title}
              </p>
              {toast.subtitle && (
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {toast.subtitle}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 hover:scale-110 transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
