import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import NotificationBanner from "@/components/NotificationBanner";
import SupabaseSyncProvider from "@/components/SupabaseSyncProvider";

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
          <div className="fixed bottom-2 right-2 text-[10px] font-bold text-gray-400 opacity-50 pointer-events-none z-[9999]">
            Beta v1.0.1
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
