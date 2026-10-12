"use client";

import Link from "next/link";
import { downloadUrl, FORMATS, toAbsolute } from "@/lib/api";
import type { SavedAd } from "@/lib/storage";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdCard({ ad, onDelete }: { ad: SavedAd; onDelete?: (id: string) => void }) {
  const fmt = FORMATS[ad.format] ?? FORMATS.reel;
  return (
    <article className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div
        className="mx-auto w-full max-w-[220px] overflow-hidden rounded-xl border border-neutral-800"
        style={{ aspectRatio: `${fmt.w} / ${fmt.h}`, background: ad.brandColor }}
      >
        {ad.videoUrl ? (
          <video src={`${toAbsolute(ad.videoUrl)}#t=0.5`} className="h-full w-full object-cover" preload="metadata" muted playsInline />
        ) : ad.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL
          <img src={ad.imageDataUrl} alt={ad.title} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="mt-4 flex-1">
        <div className="text-sm text-neutral-400">{ad.brandName}</div>
        <div className="mt-0.5 font-medium text-white">{ad.title}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5">{ad.adType}</span>
          <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5">
            {fmt.label} {fmt.tag}
          </span>
          <span>{formatDate(ad.createdAt)}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/share/${ad.projectId}`} className="btn-secondary px-4 py-2">
          Open
        </Link>
        {ad.videoUrl && (
          <a href={downloadUrl(ad.videoUrl)} className="btn-secondary px-4 py-2">
            Download
          </a>
        )}
        {ad.imageDataUrl && (
          <a href={ad.imageDataUrl} download={`${ad.title}.png`} className="btn-secondary px-4 py-2">
            Download
          </a>
        )}
        {onDelete && (
          <button type="button" className="btn-danger px-3 py-2" onClick={() => onDelete(ad.id)}>
            Remove
          </button>
        )}
      </div>
    </article>
  );
}
