import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reelixx — AI Ad Generator",
  description:
    "AI short-form ad generator for TikTok, Reels, and Shorts. Generate script, storyboard, end-card, and MP4 preview instantly.",
  openGraph: {
    title: "Reelixx — AI Ad Generator",
    description:
      "Generate 9:16 ads in minutes. Script, storyboard, and MP4 preview — powered by FastAPI + Next.js.",
    url: "https://reelixx.localhost",
    siteName: "Reelixx",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Reelixx preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100`}>
        <Navbar />
        {children}
        <Footer />
        {/* Global toast notifications */}
        <Toaster position="bottom-right" theme="dark" richColors />
        <head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#111827" />
</head>
      </body>
    </html>
  );
}