export type BrandDefaults = {
  brandName: string;
  brandColor: string;
  musicStyle: "upbeat" | "chill" | "none";
  platform: "instagram" | "tiktok" | "facebook" | "youtube";
};

const KEY = "reelixx.brand.v1";

export function getBrandDefaults(): BrandDefaults {
  if (typeof window === "undefined") {
    return { brandName: "Brand", brandColor: "#8B5CF6", musicStyle: "upbeat", platform: "instagram" };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("no-brand");
    return JSON.parse(raw) as BrandDefaults;
  } catch {
    return { brandName: "Brand", brandColor: "#8B5CF6", musicStyle: "upbeat", platform: "instagram" };
  }
}

export function saveBrandDefaults(b: BrandDefaults) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(b));
}