import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import PushNotificationManager from "@/components/PushNotificationManager";
import NotificationBanner from "@/components/NotificationBanner";
import SupabaseSyncProvider from "@/components/SupabaseSyncProvider";
import { Analytics } from '@vercel/analytics/next';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://trpickle.com.tr'),
  title: {
    default: "TRPickle | Türkiye Pickleball Topluluğu",
    template: "%s | TRPickle"
  },
  description: "Türkiye'nin ilk ve tek Pickleball topluluk platformu. Maç yapacak partner bulun, kortları keşfedin, skorlarınızı kaydedin ve Pickleball seviyenizi yükseltin.",
  keywords: ["trpickle", "pickleball", "pickleball türkiye", "türkiye pickleball topluluğu", "pickleball kortları", "pickleball maçları", "istanbul pickleball", "pickleball oyna", "pickleball kuralları", "pickleball tr"],
  authors: [{ name: "TRPickle" }],
  creator: "TRPickle",
  publisher: "TRPickle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "TRPickle | Türkiye Pickleball Topluluğu",
    description: "Türkiye'nin Pickleball topluluğuna katılın! Kortları bulun, partner bulun ve maçlarınızı kaydederek seviyenizi yükseltin.",
    url: "https://trpickle.com.tr",
    siteName: "TRPickle",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRPickle | Türkiye Pickleball Topluluğu",
    description: "Türkiye'nin Pickleball topluluğuna katılın! Kortları bulun, partner bulun ve maçlarınızı kaydederek seviyenizi yükseltin.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
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
          <PushNotificationManager />
          <div className="fixed bottom-0 right-0 p-2 text-[10px] text-slate-400/30 font-mono pointer-events-none z-50">
            Beta v1.4.2
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
