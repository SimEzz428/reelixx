"use client";

import Link from "next/link";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  platform: string;
  kind: "video" | "static";
  date: string;
  thumb?: string;
};

const MOCK: Item[] = [
  { id: "101", title: "Bevi Standup 2.0", subtitle: "Fall sale", platform: "instagram", kind: "video", date: "Oct 15, 2025" },
  { id: "102", title: "Water dispenser", subtitle: "Waterloo", platform: "instagram", kind: "static", date: "Oct 15, 2025" },
  { id: "103", title: "Eco-Friendly Water Bottle", subtitle: "Spring Collection Launch", platform: "instagram", kind: "static", date: "Oct 15, 2025" },
  { id: "104", title: "Wireless NC Headphones", subtitle: "Sound That Moves You", platform: "facebook", kind: "static", date: "Oct 15, 2025" },
  { id: "105", title: "FitTrack Pro", subtitle: "Fitness App Promotion", platform: "google", kind: "static", date: "Oct 15, 2025" },
];

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="relative border-b border-neutral-900/80 bg-gradient-to-br from-[#141226] via-[#140f2e] to-[#0b0b12]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(139,92,246,.25),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Ad Library</h1>
              <p className="mt-1 text-sm text-neutral-300">Browse, export, or continue editing.</p>
            </div>
            <Link href="/studio" className="btn-primary">Create New</Link>
          </div>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input placeholder="Search ads…" className="input w-72" />
            <select className="input w-40">
              <option>All</option>
              <option>Video</option>
              <option>Static</option>
            </select>
            <select className="input w-40">
              <option>All Formats</option>
              <option>Reel 9:16</option>
              <option>Story 9:16</option>
              <option>Feed 1:1</option>
            </select>
          </div>
          <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK.map((it) => (
            <article key={it.id} className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
              <div className="aspect-[16/10] rounded-xl border border-neutral-900 bg-neutral-900"></div>
              <div className="mt-3">
                <div className="text-sm text-neutral-400">{it.subtitle}</div>
                <div className="mt-1 text-base font-medium">{it.title}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                  <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                    {it.kind === "video" ? "video" : "static"}
                  </span>
                  <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                    {it.platform}
                  </span>
                  <span>{it.date}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link href="/studio" className="btn-secondary">Open</Link>
                <button className="btn-secondary">Export</button>
                <button className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/30">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .input { @apply rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-violet-500/60; }
        .btn-primary { @apply rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100; }
        .btn-secondary { @apply rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800; }
      `}</style>
    </main>
  );
}