"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export default function AutoSyncProvider() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // Sync function: Push our users/matches to server and get merged server state
    const runSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        const res = await fetch("/api/sync");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.users) && Array.isArray(data.matches)) {
            useStore.getState().syncServerState(data.users, data.matches, data.directMessages || []);
          }
        }
      } catch (err) {
        // Silently ignore sync errors on disconnect
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Immediate initial sync on mount
    runSync();

    // Polling interval: Every 4 seconds for fast cross-device sync
    const interval = setInterval(() => {
      runSync();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
