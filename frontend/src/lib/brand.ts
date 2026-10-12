import type { MusicMood } from "./api";

export type BrandDefaults = {
  brandName: string;
  brandColor: string;
  musicStyle: MusicMood;
};

const KEY = "reelixx.brand.v1";
const FALLBACK: BrandDefaults = { brandName: "", brandColor: "#7C3AED", musicStyle: "upbeat" };

export function getBrandDefaults(): BrandDefaults {
  if (typeof window === "undefined") return FALLBACK;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...FALLBACK, ...(JSON.parse(raw) as Partial<BrandDefaults>) } : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export function saveBrandDefaults(b: BrandDefaults) {
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* storage unavailable */
  }
}
