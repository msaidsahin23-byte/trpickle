"use client";

import { useEffect, useState } from "react";
import { getTimeAgo } from "@/lib/time-utils";

interface ClientTimeProps {
  dateString: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const ClientTime = ({ dateString, className = "", fallback = null }: ClientTimeProps) => {
  const [mounted, setMounted] = useState(false);
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    setTimeText(getTimeAgo(dateString));
    setMounted(true);

    // Optional: Refresh the time every minute so it updates dynamically without reloading
    const interval = setInterval(() => {
      setTimeText(getTimeAgo(dateString));
    }, 60000);

    return () => clearInterval(interval);
  }, [dateString]);

  if (!mounted) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <span className={`inline-block min-w-[50px] opacity-0 ${className}`}>
        Yükleniyor...
      </span>
    );
  }

  return <span className={className}>{timeText}</span>;
};
