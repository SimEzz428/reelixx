import type { AdFormat } from "./api";

/** An ad the user has generated, remembered in this browser for the Library and Dashboard. */
export type SavedAd = {
  id: string;
  projectId: number;
  variantId?: number | null;
  title: string;
  brandName: string;
  brandColor: string;
  adType: "video" | "static";
  format: AdFormat;
  createdAt: string;
  videoUrl?: string | null;
  imageDataUrl?: string | null;
  caption?: string | null;
};

const KEY = "reelixx.library.v2";
const MAX = 100;

export function listAds(): SavedAd[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedAd[]) : [];
  } catch {
    return [];
  }
}

function write(all: SavedAd[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX)));
  } catch {
    // Quota exceeded (static images are data URLs) — drop the oldest image payloads and retry once.
    const slim = all.map((a, i) => (i > 10 ? { ...a, imageDataUrl: null } : a));
    try {
      localStorage.setItem(KEY, JSON.stringify(slim.slice(0, MAX)));
    } catch {
      /* give up silently; the library is a convenience */
    }
  }
}

export function saveAd(ad: SavedAd) {
  const all = listAds().filter((a) => a.id !== ad.id);
  write([ad, ...all]);
}

export function removeAd(id: string) {
  write(listAds().filter((a) => a.id !== id));
}
