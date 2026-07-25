"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const theme = currentUser?.appTheme || "light";
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = (e?: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e ? e.matches : mediaQuery.matches;
        root.classList.remove("light", "dark");
        root.classList.add(isDark ? "dark" : "light");
      };
      
      applySystemTheme(mediaQuery);

      const listener = (e: MediaQueryListEvent) => applySystemTheme(e);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    root.classList.add(theme);
  }, [mounted, currentUser?.appTheme]);

  return <>{children}</>;
}
