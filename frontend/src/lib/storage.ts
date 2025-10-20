export type SavedAd = {
  id: string; 
  title: string;
  platform: "instagram" | "tiktok" | "facebook" | "youtube";
  adType: "video" | "static" | "carousel";
  format: "story" | "reel" | "feed" | "portrait";
  createdAt: string;


  thumb?: string | null;   
  videoUrl?: string | null;
  variantId?: number | null;


  postText?: string | null;
};

const KEY = "reelixx.library.v1";

export function listAds(): SavedAd[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedAd[]) : [];
  } catch {
    return [];
  }
}

export function saveAd(ad: SavedAd) {
  const all = listAds();
  const idx = all.findIndex((a) => a.id === ad.id);
  if (idx >= 0) all[idx] = ad;
  else all.unshift(ad);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
}

export function removeAd(id: string) {
  const all = listAds().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}