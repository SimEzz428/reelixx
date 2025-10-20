"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create", label: "Create Ad" },
  { href: "/library", label: "Ad Library" },
  { href: "/templates", label: "Templates" },
  { href: "/brand", label: "Brand Kit", disabled: true },
];

export default function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
          <div className="px-2 pb-3 text-lg font-semibold">
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Reelixx
            </span>
            <div className="mt-1 text-xs text-neutral-400">Creative Studio</div>
          </div>
          <nav className="mt-2 space-y-1">
            {nav.map((n) =>
              n.disabled ? (
                <div
                  key={n.href}
                  className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-neutral-500"
                  title="Coming soon"
                >
                  {n.label}
                </div>
              ) : (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    pathname === n.href
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {n.label}
                </Link>
              )
            )}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}