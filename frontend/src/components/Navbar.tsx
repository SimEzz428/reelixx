"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import StatusDot from "./StatusDot";
import { useHealth } from "@/lib/useHealth";

const LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/library", label: "Library" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/brand", label: "Brand Kit" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { up, aiAvailable } = useHealth();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    `transition-colors duration-200 ${pathname === href ? "text-white" : "text-neutral-400 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Reelixx
            </span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-2 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 sm:flex"
            title={up ? (aiAvailable ? "API online · AI enabled" : "API online · free mode") : "API offline"}
          >
            <StatusDot up={up} />
            {up === null ? "Checking…" : up ? (aiAvailable ? "AI ready" : "Free mode") : "API offline"}
          </div>
          <Link href="/studio" className="btn-primary hidden px-5 py-2.5 sm:inline-flex">
            Create Ad
          </Link>
          <button
            className="rounded-lg border border-neutral-800 p-2 text-neutral-300 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-neutral-800/50 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block py-2 text-sm ${linkClass(l.href)}`}>
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 py-2 text-xs text-neutral-400">
            <StatusDot up={up} /> {up ? (aiAvailable ? "AI ready" : "Free mode") : up === null ? "Checking…" : "API offline"}
          </div>
        </nav>
      )}
    </header>
  );
}
