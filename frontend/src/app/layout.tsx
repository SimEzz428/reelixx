import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const description =
  "AI short-form ad generator for TikTok, Reels, and Shorts. Turn a product brief into a script, storyboard, caption, and MP4 in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Reelixx — AI Ad Generator", template: "%s · Reelixx" },
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Reelixx — AI Ad Generator",
    description,
    siteName: "Reelixx",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-neutral-950 text-neutral-100`}>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
