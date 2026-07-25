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
    <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => {
              removeToast(toast.id);
              if (toast.link) router.push(toast.link);
            }}
            className="pointer-events-auto cursor-pointer group relative overflow-hidden bg-slate-900/95 backdrop-blur-md border border-slate-700/80 hover:border-pb-green/60 shadow-2xl rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300"
          >
            {/* Subtle glow accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pb-green to-emerald-500" />

            {/* Icon or Avatar */}
            <div className="flex-shrink-0 ml-1">
              {toast.avatarUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-600">
                  <Image
                    src={toast.avatarUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : toast.type === "message" ? (
                <div className="w-10 h-10 rounded-full bg-pb-green/15 text-pb-green flex items-center justify-center border border-pb-green/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Bell className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-bold text-white tracking-wide truncate group-hover:text-pb-green transition-colors">
                {toast.title}
              </p>
              {toast.subtitle && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
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
              className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
