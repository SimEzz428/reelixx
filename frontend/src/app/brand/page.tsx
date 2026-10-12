"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MusicMood } from "@/lib/api";
import { getBrandDefaults, saveBrandDefaults } from "@/lib/brand";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function BrandKitPage() {
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#7C3AED");
  const [musicStyle, setMusicStyle] = useState<MusicMood>("upbeat");

  useEffect(() => {
    const b = getBrandDefaults();
    setBrandName(b.brandName);
    setBrandColor(b.brandColor);
    setMusicStyle(b.musicStyle);
  }, []);

  const valid = HEX.test(brandColor);

  const save = () => {
    saveBrandDefaults({ brandName: brandName.trim(), brandColor, musicStyle });
    toast.success("Brand defaults saved — new Studio sessions will use them.");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Brand Kit</h1>
      <p className="mt-2 text-neutral-400">Defaults the Studio starts with. Stored in this browser.</p>

      <div className="card mt-8 grid gap-6 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block font-medium text-neutral-300">Brand name</span>
          <input className="input" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Lumina" />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block font-medium text-neutral-300">Brand color</span>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Pick brand color"
              value={valid && brandColor.length === 7 ? brandColor : "#7c3aed"}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-[46px] w-12 shrink-0 cursor-pointer rounded-xl border border-neutral-700 bg-neutral-900 p-1"
            />
            <input className={`input ${valid ? "" : "border-rose-600"}`} value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
          </div>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block font-medium text-neutral-300">Default music</span>
          <select className="input" value={musicStyle} onChange={(e) => setMusicStyle(e.target.value as MusicMood)}>
            <option value="upbeat">Upbeat</option>
            <option value="chill">Chill</option>
            <option value="luxury">Luxury</option>
            <option value="none">No music</option>
          </select>
        </label>

        <div className="flex items-end">
          <div
            className="flex h-[46px] w-full items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: valid ? brandColor : "#262626", color: "#fff" }}
          >
            {brandName || "Preview"}
          </div>
        </div>

        <div className="sm:col-span-2">
          <button type="button" onClick={save} disabled={!valid} className="btn-primary">
            Save defaults
          </button>
        </div>
      </div>
    </main>
  );
}
