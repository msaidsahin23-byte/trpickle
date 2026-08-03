import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import NotificationBanner from "@/components/NotificationBanner";
import SupabaseSyncProvider from "@/components/SupabaseSyncProvider";
import { Analytics } from '@vercel/analytics/next';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRPickle",
  description: "Türkiye'nin Pickleball Topluluğu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${spaceGrotesk.className} bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider>
          <SupabaseSyncProvider />
          <Navbar />
          <NotificationBanner />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <Toaster position="bottom-right" />
          <div className="fixed bottom-0 right-0 p-2 text-[10px] text-slate-400/30 font-mono pointer-events-none z-50">
            Beta v1.4.0
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
