"use client";

import StudioShell from "@/components/StudioShell";
import { getBrandDefaults, saveBrandDefaults } from "@/lib/brand";
import React, { useEffect, useState } from "react";

export default function BrandKitPage() {
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#8B5CF6");
  const [musicStyle, setMusicStyle] = useState<"upbeat"|"chill"|"none">("upbeat");
  const [platform, setPlatform] = useState<"instagram"|"tiktok"|"facebook"|"youtube">("instagram");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const b = getBrandDefaults();
    setBrandName(b.brandName);
    setBrandColor(b.brandColor);
    setMusicStyle(b.musicStyle);
    setPlatform(b.platform);
  }, []);

  const save = () => {
    saveBrandDefaults({ brandName, brandColor, musicStyle, platform });
    setStatus("Saved ✅ — new Create/Studio sessions will use these.");
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <StudioShell>
      <div className="px-2">
        <h1 className="text-3xl font-semibold">Brand Kit</h1>
        <p className="mt-2 text-neutral-300">Set defaults used by Create and Studio.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-300">Brand name</span>
            <input value={brandName} onChange={(e)=>setBrandName(e.target.value)}
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"/>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-300">Brand color</span>
            <input type="color" value={brandColor} onChange={(e)=>setBrandColor(e.target.value)}
              className="h-[42px] w-full rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 outline-none"/>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-300">Default music style</span>
            <select value={musicStyle} onChange={(e)=>setMusicStyle(e.target.value as any)}
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none">
              <option value="upbeat">Upbeat</option>
              <option value="chill">Chill</option>
              <option value="none">None</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-300">Default platform</span>
            <select value={platform} onChange={(e)=>setPlatform(e.target.value as any)}
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none">
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <button onClick={save} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900">
            Save defaults
          </button>
          {status && <span className="ml-3 text-sm text-neutral-300">{status}</span>}
        </div>
      </div>
    </StudioShell>
  );
}