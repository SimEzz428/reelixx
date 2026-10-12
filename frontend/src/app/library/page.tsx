"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdCard from "@/components/AdCard";
import { FORMATS, type AdFormat } from "@/lib/api";
import { listAds, removeAd, type SavedAd } from "@/lib/storage";

export default function LibraryPage() {
  const [ads, setAds] = useState<SavedAd[] | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | SavedAd["adType"]>("all");
  const [format, setFormat] = useState<"all" | AdFormat>("all");

  useEffect(() => setAds(listAds()), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (ads ?? []).filter(
      (a) =>
        (kind === "all" || a.adType === kind) &&
        (format === "all" || a.format === format) &&
        (!q || `${a.title} ${a.brandName}`.toLowerCase().includes(q))
    );
  }, [ads, query, kind, format]);

  const onDelete = (id: string) => {
    removeAd(id);
    setAds(listAds());
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Ad Library</h1>
          <p className="mt-2 text-neutral-400">Everything you&apos;ve generated in this browser.</p>
        </div>
        <Link href="/studio" className="btn-primary">
          Create new
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search ads…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input sm:w-40" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="all">All types</option>
          <option value="video">Video</option>
          <option value="static">Static</option>
        </select>
        <select className="input sm:w-48" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
          <option value="all">All formats</option>
          {(Object.keys(FORMATS) as AdFormat[]).map((k) => (
            <option key={k} value={k}>
              {FORMATS[k].label} {FORMATS[k].tag}
            </option>
          ))}
        </select>
      </div>

      {ads === null ? null : ads.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
          <div className="text-4xl">🎬</div>
          <p className="mt-4 text-neutral-300">No ads yet.</p>
          <Link href="/studio" className="btn-primary mt-6">
            Make your first ad
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-12 text-center text-neutral-500">No ads match those filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDelete={onDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
