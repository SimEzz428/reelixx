
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BACKEND_URL, pingHealth } from "@/lib/api";
import StatusDot from "./StatusDot";

export default function Navbar() {
  const [up, setUp] = useState<boolean>(true);

  useEffect(() => {
    let timer: any;
    const check = async () => setUp((await pingHealth()) === "up");
    check();
    timer = setInterval(check, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Reelixx
          </Link>
          <nav className="hidden gap-4 text-sm text-neutral-300 sm:flex">
            <Link href="/studio" className="hover:text-white">Studio</Link>
            <Link href="/examples" className="hover:text-white">Examples</Link>
            // add somewhere in the right side actions:
            <Link href="/dashboard" className="text-sm text-neutral-300 hover:text-white">Dashboard</Link>
            <Link href="/create" className="ml-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black">Create Ad</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-2">
            <StatusDot up={up} />
            <span className="hidden sm:inline">API:</span>
            <span className="text-neutral-300">{BACKEND_URL}</span>
          </span>
          <a
            href="https://github.com/"
            target="_blank"
            className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-200 hover:bg-neutral-800"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}