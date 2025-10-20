"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="relative border-b border-neutral-900/80 bg-gradient-to-br from-[#141226] via-[#140f2e] to-[#0b0b12]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(139,92,246,.25),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-300">AI-powered ads that convert.</p>
            </div>
            <Link href="/studio" className="btn-primary">Create New Ad</Link>
          </div>
        </div>
      </div>

      {/* Metrics + Recent */}
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-5">
            <h2 className="mb-4 text-base font-medium">Overview</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Total Ads", value: "5" },
                { label: "Video Ads", value: "1" },
                { label: "Static Ads", value: "0" },
                { label: "Ready to Publish", value: "1" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
                  <div className="text-2xl font-semibold">{m.value}</div>
                  <div className="mt-1 text-xs text-neutral-400">{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-medium">Recent Creations</h2>
              <Link href="/library" className="btn-secondary">Open Library</Link>
            </div>
            <ul className="divide-y divide-neutral-900">
              {[
                { title: "Bevi Standup 2.0", tag: "Reel 9:16", platform: "instagram", date: "Oct 15, 2025" },
                { title: "Water dispenser", tag: "Static", platform: "instagram", date: "Oct 15, 2025" },
                { title: "Eco-Friendly Water Bottle", tag: "Static", platform: "instagram", date: "Oct 15, 2025" },
              ].map((r) => (
                <li key={r.title} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="mt-1 text-xs text-neutral-400">
                      <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5">{r.tag}</span>
                      <span className="ml-2 text-neutral-500">{r.platform}</span>
                      <span className="ml-2 text-neutral-500">{r.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/studio" className="btn-secondary">Open</Link>
                    <button className="btn-secondary">Export</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column: Quick actions */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-5">
            <h3 className="mb-3 text-base font-medium">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/studio" className="w-full btn-secondary block text-center">Video Ad</Link>
              <Link href="/studio" className="w-full btn-secondary block text-center">Static Ad</Link>
              <Link href="/examples" className="w-full btn-secondary block text-center">Templates</Link>
              <Link href="/brand" className="w-full btn-secondary block text-center">Brand Kit</Link>
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .btn-primary { @apply rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100; }
        .btn-secondary { @apply rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800; }
      `}</style>
    </main>
  );
}