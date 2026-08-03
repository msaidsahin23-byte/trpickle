"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { User } from "@/store/useStore";

export function isMutualFriend(userA?: User | null, userB?: User | null): boolean {
  if (!userA || !userB || userA.id === userB.id) return false;
  const aFollowsB = (Array.isArray(userA.following) ? userA.following : []).includes(userB.id) || (Array.isArray(userB.followers) ? userB.followers : []).includes(userA.id);
  const bFollowsA = (Array.isArray(userB.following) ? userB.following : []).includes(userA.id) || (Array.isArray(userA.followers) ? userA.followers : []).includes(userB.id);
  return aFollowsB && bFollowsA;
}

interface FriendBadgeProps {
  currentUser?: User | null;
  targetUser?: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FriendBadge({
  currentUser,
  targetUser,
  size = "sm",
  className = "",
}: FriendBadgeProps) {
  if (!isMutualFriend(currentUser, targetUser)) return null;

  if (size === "lg") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold tracking-tight shadow-sm ${className}`}
        title="Karşılıklı Takipleşiyorsunuz (Arkadaş)"
      >
        <UserCheck className="w-4 h-4 stroke-[2.5]" />
        Arkadaş
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold tracking-tight shrink-0 ${className}`}
      title="Karşılıklı Takipleşiyorsunuz (Arkadaş)"
    >
      <UserCheck className="w-3 h-3 stroke-[2.5]" />
      Arkadaş
    </span>
  );
}
