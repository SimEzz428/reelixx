"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/components/AdCard";
import StatusDot from "@/components/StatusDot";
import { FORMATS } from "@/lib/api";
import { listAds, type SavedAd } from "@/lib/storage";
import { useHealth } from "@/lib/useHealth";

export default function DashboardPage() {
  const [ads, setAds] = useState<SavedAd[]>([]);
  const { up, aiAvailable } = useHealth();

  useEffect(() => setAds(listAds()), []);

  const metrics = [
    { label: "Total ads", value: ads.length },
    { label: "Video ads", value: ads.filter((a) => a.adType === "video").length },
    { label: "Static ads", value: ads.filter((a) => a.adType === "static").length },
    { label: "Brands", value: new Set(ads.map((a) => a.brandName)).size },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-neutral-400">Your recent work at a glance.</p>
        </div>
        <Link href="/studio" className="btn-primary">
          Create new ad
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="card p-5">
                <div className="text-3xl font-semibold text-white">{m.value}</div>
                <div className="mt-1 text-xs text-neutral-400">{m.label}</div>
              </div>
            ))}
          </section>

          <section className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent creations</h2>
              <Link href="/library" className="btn-secondary px-4 py-2">
                Open library
              </Link>
            </div>
            {ads.length === 0 ? (
              <p className="py-6 text-sm text-neutral-500">
                Nothing yet —{" "}
                <Link href="/studio" className="text-violet-400 hover:underline">
                  generate your first ad
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {ads.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: a.brandColor }} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">{a.title}</div>
                        <div className="text-xs text-neutral-500">
                          {a.adType} · {FORMATS[a.format]?.tag} · {formatDate(a.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Link href={`/share/${a.projectId}`} className="btn-secondary shrink-0 px-4 py-2">
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h3 className="mb-4 font-semibold text-white">Quick actions</h3>
            <div className="grid gap-3">
              <Link href="/studio" className="btn-secondary">
                New ad
              </Link>
              <Link href="/brand" className="btn-secondary">
                Brand kit
              </Link>
            </div>
          </div>
          <div className="card text-sm">
            <h3 className="mb-3 font-semibold text-white">System</h3>
            <div className="flex items-center gap-2 text-neutral-300">
              <StatusDot up={up} /> API {up === null ? "checking…" : up ? "online" : "offline"}
            </div>
            <div className="mt-2 flex items-center gap-2 text-neutral-300">
              <StatusDot up={up === null ? null : aiAvailable} /> AI rendering {aiAvailable ? "enabled" : "off (free mode)"}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
