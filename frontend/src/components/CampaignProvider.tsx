"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBrandDefaults } from "@/lib/brand";

type CampaignState = {
  adType: "video" | "static" | "carousel";
  format: "story" | "reel" | "feed" | "portrait";
  platform: "instagram" | "tiktok" | "facebook" | "youtube";
  musicStyle: "upbeat" | "chill" | "none";

  campaignName: string;
  productName: string;
  description: string;
  audience: string;
  price: string;
  productUrl: string;

  brandName: string;
  brandColor: string;

  projectId: number | null;
  variantId: number | null;
  endcardDataUrl: string | null;
  videoUrl: string | null;
  postText: string | null;
};

type Ctx = {
  campaign: CampaignState;
  set: <K extends keyof CampaignState>(key: K, value: CampaignState[K]) => void;
};

const C = createContext<Ctx | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const brand = getBrandDefaults();

  const [campaign, setCampaign] = useState<CampaignState>({
    adType: "video",
    format: "reel",
    platform: brand.platform,
    musicStyle: brand.musicStyle,

    campaignName: "",
    productName: "",
    description: "",
    audience: "",
    price: "",
    productUrl: "",

    brandName: brand.brandName,
    brandColor: brand.brandColor,

    projectId: null,
    variantId: null,
    endcardDataUrl: null,
    videoUrl: null,
    postText: null,
  });

  useEffect(() => {
    try {
      const q = new URL(window.location.href).searchParams;
      const updates: Partial<CampaignState> = {};
      if (q.get("title")) updates.campaignName = q.get("title")!;
      if (q.get("productName")) updates.productName = q.get("productName")!;
      if (q.get("description")) updates.description = q.get("description")!;
      if (q.get("price")) updates.price = q.get("price")!;
      if (q.get("brandName")) updates.brandName = q.get("brandName")!;
      if (q.get("brandColor")) updates.brandColor = q.get("brandColor")!;
      if (q.get("url")) updates.productUrl = q.get("url")!;
      if (Object.keys(updates).length) setCampaign((s) => ({ ...s, ...updates }));
    } catch {}
  }, []);

  const ctx = useMemo<Ctx>(
    () => ({
      campaign,
      set: (k, v) => setCampaign((s) => ({ ...s, [k]: v })),
    }),
    [campaign]
  );

  return <C.Provider value={ctx}>{children}</C.Provider>;
}

export function useCampaign() {
  const v = useContext(C);
  if (!v) throw new Error("CampaignProvider is missing");
  return v;
}