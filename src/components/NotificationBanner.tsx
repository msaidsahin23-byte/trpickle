"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { MessageSquare, X, UserPlus, Award } from "lucide-react";
import Image from "next/image";

type ToastAlert = {
  id: string;
  title: string;
  subtitle?: string;
  type: "message" | "notification" | "follow";
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

  // Auto-mark existing items so we don't spam toasts on load
  useEffect(() => {
    if (!currentUser) return;
    if (initialMountRef.current) {
      initialMountRef.current = false;
      (directMessages || []).forEach((msg) => {
        seenIdsRef.current.add(String(msg.id));
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
      const msgIdStr = String(msg.id);
      if (
        String(msg.receiverId) === String(currentUser.id) &&
        !msg.isRead &&
        !seenIdsRef.current.has(msgIdStr)
      ) {
        seenIdsRef.current.add(msgIdStr);
        const sender = users.find((u) => String(u.id) === String(msg.senderId));
        newToasts.push({
          id: msgIdStr,
          title: sender ? sender.name : "Yeni Mesaj",
          subtitle: msg.content.length > 30 ? msg.content.slice(0, 30) + "..." : msg.content,
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
        
        let title = "Yeni Bildirim";
        let type: ToastAlert["type"] = "notification";
        
        if (notif.type === 'new_follower') {
          title = "Yeni Takipçi!";
          type = "follow";
        } else if (notif.type === 'like') {
          title = "Yeni Beğeni";
        }

        newToasts.push({
          id: notifIdStr,
          title: title,
          subtitle: notif.message,
          type: type,
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
    <div className="fixed top-4 left-0 right-0 sm:left-auto sm:right-6 z-[9999] flex flex-col items-center sm:items-end gap-3 px-4 pointer-events-none w-full sm:w-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.8, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-3 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-3 rounded-2xl w-full max-w-[340px] cursor-pointer hover:bg-white/30 dark:hover:bg-slate-900/60 transition-colors"
            onClick={() => {
              removeToast(toast.id);
              if (toast.link) router.push(toast.link);
            }}
          >
            {/* Animated Icon Container */}
            <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-pb-green to-emerald-400 shadow-inner">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeOut"
                }}
                className="w-full h-full flex items-center justify-center"
              >
                {toast.type === "message" ? (
                  <MessageSquare className="w-5 h-5 text-slate-900" />
                ) : toast.type === "follow" ? (
                  <UserPlus className="w-5 h-5 text-slate-900" />
                ) : (
                  <Award className="w-5 h-5 text-slate-900" />
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {toast.title}
              </h4>
              {toast.subtitle && (
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                  {toast.subtitle}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 shrink-0 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
