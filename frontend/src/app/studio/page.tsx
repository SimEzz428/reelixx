"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/api";

type Step = 1 | 2 | 3 | 4 | 5;
type AdType = "video" | "static" | "carousel";
type Format = "story" | "reel" | "square" | "portrait";

type Project = {
  id: number;
  title: string;
  description: string;
  price: string;
  brand_name: string;
  brand_color: string;
  product_url?: string;
};

type Variant = {
  id: number;
  storyboard_json?: any;
  script_json?: any;
  preview_url?: string;
};

export default function StudioPage() {
  
  const [step, setStep] = useState<Step>(1);
  const [adType, setAdType] = useState<AdType>("video");
  const [format, setFormat] = useState<Format>("reel");


  const [title, setTitle] = useState("Lumina Water Bottle");
  const [description, setDescription] = useState(
    "Self-cleaning bottle with UV-C cap. Keeps water fresh."
  );
  const [price, setPrice] = useState("49");
  const [brandName, setBrandName] = useState("Lumina");
  const [brandColor, setBrandColor] = useState("#7C3AED");
  const [productUrl, setProductUrl] = useState("https://example.com/lumina");

  
  const [project, setProject] = useState<Project | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [captionText, setCaptionText] = useState<string>("");


  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const canNextFrom1 = !!adType;
  const canNextFrom2 = !!format;
  const canNextFrom3 =
    title.trim().length > 1 && description.trim().length > 4 && brandName.trim().length > 1;

  const prettyFormat = useMemo(() => {
    switch (format) {
      case "reel":
        return { label: "Reel", dims: "1080×1920", tag: "9:16" };
      case "story":
        return { label: "Story", dims: "1080×1920", tag: "9:16" };
      case "square":
        return { label: "Feed Post", dims: "1080×1080", tag: "1:1" };
      case "portrait":
        return { label: "Portrait", dims: "1080×1350", tag: "4:5" };
    }
  }, [format]);

 

  async function createProject() {
    setBusy(true);
    setStatus("Creating project…");
    setErr(null);
    try {
      const res = await fetch(`${BACKEND_URL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title} Campaign`,
          product_url: productUrl,
          brief: {
            title,
            description,
            price,
            brand: brandName,
          },
          brand: {
            name: brandName,
            color: brandColor,
          },
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Create failed: ${res.status} — ${t}`);
      }
      const data = await res.json();
      setProject(data);
      setStatus("Project created");
      return data as Project;
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setStatus("Error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function generateAll(pid: number) {
    setBusy(true);
    setStatus("Generating script + storyboard + end-card…");
    setErr(null);
    try {
      const gen = await fetch(`${BACKEND_URL}/projects/${pid}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n_variants: 1,
          tones: ["professional"],
          persona: "enthusiastic",
        }),
      });

   
      if (!gen.ok) {
        const t = await gen.text();
        throw new Error(`Generate failed: ${gen.status} — ${t}`);
      }

      const jobData = await gen.json();
      console.log("Generation job:", jobData);
      
      const vres = await fetch(`${BACKEND_URL}/projects/${pid}/variants/latest`);
      if (!vres.ok) throw new Error(`Fetch latest variant failed: ${vres.status}`);
      const vdata = await vres.json();
      setVariant(vdata);
      setStoryboard(vdata?.storyboard_json || null);

    
      const pres = await fetch(`${BACKEND_URL}/post_text/projects/${pid}`);
      if (pres.ok) {
        const txt = await pres.text();
        setCaptionText(txt);
      }

      setStatus("Generated ✅");
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setStatus("Error");
    } finally {
      setBusy(false);
    }
  }

  async function renderPreview() {
    if (!variant?.id) return;
    setBusy(true);
    setStatus("Rendering MP4 preview…");
    setErr(null);
    try {
     
      const res = await fetch(`${BACKEND_URL}/variants/${variant.id}/assemble`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Assemble failed: ${res.status} — ${t}`);
      }
    
      const info = await res.json();
      const url = info?.mp4_url || info?.url || "";
      setVariant((v) => (v ? { ...v, preview_url: url } : v));
      setStatus("Preview ready ✅");
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setStatus("Error");
    } finally {
      setBusy(false);
    }
  }

  async function onGenerateClick() {
   
    const p = project ?? (await createProject());
    if (!p) return;
    await generateAll(p.id);
    setStep(5);
  }



  const StepHeader = (
    <div className="sticky top-0 z-20 mb-8 -mx-6 border-b border-neutral-800/50 bg-gradient-to-b from-neutral-950/95 to-neutral-950/80 px-6 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <div className="text-sm font-medium text-neutral-400">Creative Studio</div>
          <h1 className="mt-1 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Create an Ad Campaign
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-2 text-xs backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="text-neutral-300">API Connected</span>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-2 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className="mx-auto mt-6 h-2 w-full max-w-7xl overflow-hidden rounded-full bg-neutral-900/50">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-violet-500/25 transition-all duration-500 ease-out"
          style={{
            width:
              step === 1
                ? "20%"
                : step === 2
                ? "40%"
                : step === 3
                ? "65%"
                : step === 4
                ? "85%"
                : "100%",
          }}
        />
      </div>
      
      {/* Step indicator */}
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between text-xs text-neutral-500">
        <span className={step >= 1 ? "text-violet-400" : ""}>Ad Type</span>
        <span className={step >= 2 ? "text-violet-400" : ""}>Format</span>
        <span className={step >= 3 ? "text-violet-400" : ""}>Details</span>
        <span className={step >= 4 ? "text-violet-400" : ""}>Generate</span>
        <span className={step >= 5 ? "text-violet-400" : ""}>Review</span>
      </div>
    </div>
  );

  function NextPrev({
    canNext,
    onNext,
    onBack,
    nextLabel = "Next",
  }: {
    canNext: boolean;
    onNext: () => void;
    onBack?: () => void;
    nextLabel?: string;
  }) {
    return (
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!onBack}
          className="group flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext || busy}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="relative z-10">{busy ? "Working…" : nextLabel}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        {StepHeader}

        {/* STEP 1 — Ad Type */}
        {step === 1 && (
          <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-8 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 1 of 5</div>
            <h2 className="mb-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent">
              Choose Ad Type
            </h2>
            <p className="mb-8 text-neutral-400">Select the type of ad campaign you want to create</p>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  key: "video",
                  title: "Video Ad",
                  desc: "Engaging short-form videos perfect for Reels and TikTok",
                  icon: "🎬",
                  gradient: "from-blue-500 to-cyan-500",
                },
                { 
                  key: "static", 
                  title: "Static Image", 
                  desc: "Graphics for Stories and Feed posts",
                  icon: "🖼️",
                  gradient: "from-purple-500 to-pink-500",
                },
                { 
                  key: "carousel", 
                  title: "Carousel", 
                  desc: "Swipeable set of images",
                  icon: "📱",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((opt) => {
                const active = adType === (opt.key as AdType);
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAdType(opt.key as AdType)}
                    className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
                      active
                        ? "border-violet-500/60 bg-gradient-to-br from-violet-600/10 to-fuchsia-500/10 shadow-lg shadow-violet-500/25"
                        : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="mb-4 text-3xl">{opt.icon}</div>
                      <div className="text-lg font-semibold text-white">{opt.title}</div>
                      <div className="mt-2 text-sm text-neutral-300">{opt.desc}</div>
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                    
                    {/* Selection indicator */}
                    {active && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <NextPrev canNext={canNextFrom1} onNext={() => setStep(2)} />
          </section>
        )}

        {/* STEP 2 — Format */}
        {step === 2 && (
          <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-8 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 2 of 5</div>
            <h2 className="mb-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent">
              Choose Format
            </h2>
            <p className="mb-8 text-neutral-400">Select the aspect ratio and dimensions for your ad</p>

            <div className="grid gap-6 sm:grid-cols-4">
              {[
                { 
                  key: "story", 
                  name: "Story", 
                  tag: "9:16", 
                  dims: "1080×1920",
                  icon: "📱",
                  gradient: "from-blue-500 to-cyan-500",
                },
                { 
                  key: "reel", 
                  name: "Reel", 
                  tag: "9:16", 
                  dims: "1080×1920",
                  icon: "🎬",
                  gradient: "from-purple-500 to-pink-500",
                },
                { 
                  key: "square", 
                  name: "Feed Post", 
                  tag: "1:1", 
                  dims: "1080×1080",
                  icon: "⬜",
                  gradient: "from-green-500 to-emerald-500",
                },
                { 
                  key: "portrait", 
                  name: "Portrait", 
                  tag: "4:5", 
                  dims: "1080×1350",
                  icon: "📐",
                  gradient: "from-orange-500 to-red-500",
                },
              ].map((f) => {
                const active = format === (f.key as Format);
                return (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key as Format)}
                    className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
                      active
                        ? "border-violet-500/60 bg-gradient-to-br from-violet-600/10 to-fuchsia-500/10 shadow-lg shadow-violet-500/25"
                        : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="mb-4 text-3xl">{f.icon}</div>
                      <div className="text-lg font-semibold text-white">{f.name}</div>
                      <div className="mt-2 text-sm text-neutral-300">
                        {f.tag} • {f.dims}
                      </div>
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                    
                    {/* Selection indicator */}
                    {active && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <NextPrev canNext={canNextFrom2} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          </section>
        )}

        {/* STEP 3 — Content */}
        {step === 3 && (
          <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-8 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 3 of 5</div>
            <h2 className="mb-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent">
              Campaign Details
            </h2>
            <p className="mb-8 text-neutral-400">Provide the essential information for your ad campaign</p>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-neutral-300">Product Website URL</div>
                    <input
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://yourproduct.com/page"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-neutral-300">Campaign Name</div>
                      <input
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Summer Sale 2025"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-neutral-300">Product/Service Name</div>
                      <input
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Brand"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-neutral-300">Product Description</div>
                    <textarea
                      className="h-32 w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Key features, benefits, USP…"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-neutral-300">Target Price (USD)</div>
                      <input
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="49"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <div className="mb-2 text-sm font-medium text-neutral-300">Brand Color</div>
                      <div className="flex items-center gap-3">
                        <input
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/60 focus:bg-neutral-800/50"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          placeholder="#7C3AED"
                        />
                        <div
                          className="h-12 w-12 rounded-xl border border-neutral-700 shadow-lg"
                          style={{ background: brandColor }}
                          title={brandColor}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Enhanced context summary card */}
              <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                  <div className="text-sm font-semibold text-neutral-200">Campaign Summary</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ad Type:</span>
                    <span className="text-neutral-200 capitalize">{adType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Format:</span>
                    <span className="text-neutral-200">{prettyFormat.label} • {prettyFormat.tag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Dimensions:</span>
                    <span className="text-neutral-200">{prettyFormat.dims}</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Title:</span>
                      <span className="text-neutral-200">{title || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Brand:</span>
                      <span className="text-neutral-200">{brandName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Color:</span>
                      <span className="text-neutral-200">{brandColor}</span>
                    </div>
                  </div>
                  <div className="border-t border-neutral-700 pt-3">
                    <div className="text-neutral-500">Description:</div>
                    <div className="mt-1 text-xs text-neutral-300 line-clamp-4">
                      {description || "No description provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <NextPrev
              canNext={canNextFrom3}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          </section>
        )}

        {/* STEP 4 — Generate */}
        {step === 4 && (
          <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-8 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 4 of 5</div>
            <h2 className="mb-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent">
              AI Generation
            </h2>
            <p className="mb-8 text-neutral-400">Ready to create your ad content with AI</p>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-700 bg-gradient-to-br from-violet-600/5 to-fuchsia-500/5 p-12 text-center backdrop-blur-sm">
              <div className="mb-6 text-6xl">✨</div>
              <div className="mb-2 text-2xl font-semibold text-white">Ready to Generate</div>
              <div className="mb-8 max-w-md text-neutral-300">
                We'll create the script, storyboard, end-card, and caption. Then you can render a preview MP4.
              </div>

              <button
                onClick={onGenerateClick}
                disabled={busy}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10">{busy ? "Generating…" : "Generate with AI"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </button>
            </div>

            <NextPrev canNext={!busy} onNext={() => setStep(5)} onBack={() => setStep(3)} />
          </section>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-8 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 5 of 5</div>
            <h2 className="mb-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent">
              Review & Export
            </h2>
            <p className="mb-8 text-neutral-400">Review your generated content and export your ad</p>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Enhanced Preview panel */}
              <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <div className="text-sm font-semibold text-neutral-200">Live Preview</div>
                  </div>
                  <span className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-xs text-neutral-300">
                    {prettyFormat.label.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative aspect-[9/16] w-[320px] max-w-full rounded-2xl border border-neutral-700 bg-neutral-900/50 shadow-lg">
                    {/* If we have a preview URL, show HTML5 video */}
                    {variant?.preview_url ? (
                      <video
                        key={variant.preview_url}
                        className="h-full w-full rounded-2xl"
                        src={variant.preview_url}
                        controls
                        playsInline
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-neutral-500">
                        <div className="text-6xl">🖼️</div>
                        <div className="mt-2 text-sm">No preview yet</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={renderPreview}
                    disabled={busy || !variant?.id}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10">{busy ? "Rendering…" : "Render MP4 Preview"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </button>

                  <Link
                    href={project ? `/review/${project.id}` : "#"}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
                  >
                    Review JSON
                  </Link>
                  <Link
                    href={project ? `/share/${project.id}` : "#"}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
                  >
                    Open Share
                  </Link>
                </div>
              </div>

              {/* Enhanced Right column: details */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="text-sm font-semibold text-neutral-200">Ad Details</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-neutral-500">Campaign</div>
                    <div className="text-neutral-200">{title || "—"}</div>
                    <div className="text-neutral-500">Product</div>
                    <div className="text-neutral-200">{brandName || "—"}</div>
                    <div className="text-neutral-500">Format</div>
                    <div className="text-neutral-200">
                      {adType} • {prettyFormat.tag.toLowerCase()}
                    </div>
                    <div className="text-neutral-500">Brand color</div>
                    <div className="text-neutral-200">{brandColor}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="text-sm font-semibold text-neutral-200">Caption / Post text</div>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-sm text-neutral-300">
                    {captionText || "No caption yet."}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <div className="text-sm font-semibold text-neutral-200">Storyboard (JSON)</div>
                  </div>
                  <pre className="max-h-[200px] overflow-auto rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-xs text-neutral-300">
                    {storyboard ? JSON.stringify(storyboard, null, 2) : "No storyboard yet."}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={!variant?.preview_url}
                    onClick={() => {
                      if (!variant?.preview_url) return;
                      window.open(variant.preview_url, "_blank");
                    }}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Ad
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(captionText || "")}
                    disabled={!captionText}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy Caption
                  </button>
                </div>
              </div>
            </div>

            {(status || err) && (
              <div className="mt-8 rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm">
                  {status && <span className="text-neutral-300">{status}</span>}
                  {err && <span className="text-rose-400">{err}</span>}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}