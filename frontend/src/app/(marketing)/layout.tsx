import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reelixx — AI short-form ad generator",
  description: "Create viral video ads with AI — instantly.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-neutral-950 text-neutral-100 antialiased`}>
      {children}
    </div>
  );
}