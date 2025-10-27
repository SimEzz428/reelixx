
"use client";

import Link from "next/link";

export default function Navbar() {

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Reelixx
            </span>
          </Link>
          <nav className="hidden gap-6 text-sm text-neutral-300 sm:flex">
            <Link href="/studio" className="hover:text-white transition-colors duration-200">Studio</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
          >
            <span className="relative z-10">Create Ad</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Link>
        </div>
      </div>
    </header>
  );
}