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
          title,
          description,
          price,
          brand_name: brandName,
          brand_color: brandColor,
          product_url: productUrl,
        }),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
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
          ad_type: adType,
          format,
        }),
      });

   
      if (!gen.ok) {
        const t = await gen.text();
        throw new Error(`Generate failed: ${gen.status} — ${t}`);
      }

      
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
    
      const info = await res.json().catch(() => null);
      const url = info?.url || info?.path || "";
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
    <div className="sticky top-0 z-20 mb-6 -mx-6 border-b border-neutral-900 bg-gradient-to-b from-neutral-950/90 to-neutral-950/60 px-6 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Studio</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Create an ad</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-md border border-neutral-800 px-2 py-1 text-neutral-400">
            API: <span className="text-neutral-200">{BACKEND_URL}</span>
          </span>
          <Link
            href="/"
            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
          >
            Home
          </Link>
          <Link
            href="/examples"
            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
          >
            Examples
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto mt-4 h-1.5 w-full max-w-6xl overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400"
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
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!onBack}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext || busy}
          className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 py-2 text-sm font-medium text-white hover:from-fuchsia-400 hover:to-violet-400 disabled:opacity-50"
        >
          {busy ? "Working…" : nextLabel}
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 pb-24">
        {StepHeader}

        {/* STEP 1 — Ad Type */}
        {step === 1 && (
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
            <div className="text-sm text-neutral-300">Step 1 of 5: Ad Type</div>
            <h2 className="mt-1 text-2xl font-semibold">Create Ad Campaign</h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  key: "video",
                  title: "Video Ad",
                  desc: "Engaging short-form videos perfect for Reels and TikTok",
                },
                { key: "static", title: "Static Image", desc: "Graphics for Stories and Feed" },
                { key: "carousel", title: "Carousel", desc: "Swipeable set of images" },
              ].map((opt) => {
                const active = adType === (opt.key as AdType);
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAdType(opt.key as AdType)}
                    className={[
                      "rounded-xl border p-5 text-left transition",
                      active
                        ? "border-violet-600/60 bg-gradient-to-b from-violet-600/10 to-fuchsia-500/10"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900/60",
                    ].join(" ")}
                  >
                    <div className="text-lg font-medium">{opt.title}</div>
                    <div className="mt-1 text-sm text-neutral-300">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <NextPrev canNext={canNextFrom1} onNext={() => setStep(2)} />
          </section>
        )}

        {/* STEP 2 — Format */}
        {step === 2 && (
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
            <div className="text-sm text-neutral-300">Step 2 of 5: Format</div>
            <h2 className="mt-1 text-2xl font-semibold">Pick a format</h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { key: "story", name: "Story", tag: "9:16", dims: "1080×1920" },
                { key: "reel", name: "Reel", tag: "9:16", dims: "1080×1920" },
                { key: "square", name: "Feed Post", tag: "1:1", dims: "1080×1080" },
                { key: "portrait", name: "Portrait", tag: "4:5", dims: "1080×1350" },
              ].map((f) => {
                const active = format === (f.key as Format);
                return (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key as Format)}
                    className={[
                      "rounded-xl border p-5 text-left transition",
                      active
                        ? "border-violet-600/60 bg-gradient-to-b from-violet-600/10 to-fuchsia-500/10"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900/60",
                    ].join(" ")}
                  >
                    <div className="text-lg font-medium">{f.name}</div>
                    <div className="mt-1 text-sm text-neutral-300">
                      {f.tag} • {f.dims}
                    </div>
                  </button>
                );
              })}
            </div>

            <NextPrev canNext={canNextFrom2} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          </section>
        )}

        {/* STEP 3 — Content */}
        {step === 3 && (
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
            <div className="text-sm text-neutral-300">Step 3 of 5: Content</div>
            <h2 className="mt-1 text-2xl font-semibold">Campaign details</h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <div className="text-xs text-neutral-400">Product Website URL</div>
                  <input
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://yourproduct.com/page"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="text-xs text-neutral-400">Campaign Name</div>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Sale 2025"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs text-neutral-400">Product/Service Name</div>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Brand"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="text-xs text-neutral-400">Product Description</div>
                  <textarea
                    className="mt-1 h-28 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key features, benefits, USP…"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <div className="text-xs text-neutral-400">Target Price (USD)</div>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <div className="text-xs text-neutral-400">Brand Color</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none ring-0 focus:border-violet-500/60"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#7C3AED"
                      />
                      <span
                        className="inline-block h-8 w-8 rounded-md border border-neutral-800"
                        style={{ background: brandColor }}
                        title={brandColor}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Context summary card */}
              <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-5">
                <div className="text-sm text-neutral-300">Summary</div>
                <div className="mt-3 text-xs text-neutral-400">
                  <div>
                    <span className="text-neutral-500">Ad Type:</span> {adType}
                  </div>
                  <div>
                    <span className="text-neutral-500">Format:</span> {prettyFormat.label} •{" "}
                    {prettyFormat.tag} • {prettyFormat.dims}
                  </div>
                  <div className="mt-3">
                    <span className="text-neutral-500">Title:</span> {title}
                  </div>
                  <div>
                    <span className="text-neutral-500">Brand:</span> {brandName}
                  </div>
                  <div>
                    <span className="text-neutral-500">Color:</span> {brandColor}
                  </div>
                  <div className="mt-2 line-clamp-4">
                    <span className="text-neutral-500">Description:</span> {description}
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
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
            <div className="text-sm text-neutral-300">Step 4 of 5: Generate</div>
            <h2 className="mt-1 text-2xl font-semibold">AI Generation</h2>

            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-900 bg-neutral-950 p-10 text-center">
              <div className="text-4xl">✨</div>
              <div className="mt-2 text-lg font-medium">Ready to Generate</div>
              <div className="mt-1 max-w-md text-sm text-neutral-300">
                We’ll create the script, storyboard, end-card, and caption. Then you can render a
                preview MP4.
              </div>

              <button
                onClick={onGenerateClick}
                disabled={busy}
                className="mt-6 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 py-2 text-sm font-medium text-white hover:from-fuchsia-400 hover:to-violet-400 disabled:opacity-50"
              >
                {busy ? "Generating…" : "Generate with AI"}
              </button>
            </div>

            <NextPrev canNext={!busy} onNext={() => setStep(5)} onBack={() => setStep(3)} />
          </section>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
            <div className="text-sm text-neutral-300">Step 5 of 5: Review</div>
            <h2 className="mt-1 text-2xl font-semibold">Review & Export</h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Preview panel */}
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-300">Live Preview</div>
                  <span className="rounded-md border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                    {prettyFormat.label.toLowerCase()}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="relative aspect-[9/16] w-[320px] max-w-full rounded-xl border border-neutral-900 bg-neutral-900">
                    {/* If we have a preview URL, show HTML5 video */}
                    {variant?.preview_url ? (
                      <video
                        key={variant.preview_url}
                        className="h-full w-full rounded-xl"
                        src={variant.preview_url}
                        controls
                        playsInline
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-neutral-500">
                        <div className="text-5xl">🖼️</div>
                        <div className="mt-2 text-xs">No preview yet</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={renderPreview}
                    disabled={busy || !variant?.id}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {busy ? "Rendering…" : "Render MP4 Preview"}
                  </button>

                  <Link
                    href={project ? `/review/${project.id}` : "#"}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                  >
                    Review JSON
                  </Link>
                  <Link
                    href={project ? `/share/${project.id}` : "#"}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                  >
                    Open Share
                  </Link>
                </div>
              </div>

              {/* Right column: details */}
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
                <div className="text-sm text-neutral-300">Ad Details</div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
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

                <div className="mt-6">
                  <div className="text-sm text-neutral-300">Caption / Post text</div>
                  <div className="mt-2 rounded-lg border border-neutral-900 bg-neutral-950 p-3 text-sm text-neutral-300">
                    {captionText || "No caption yet."}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-neutral-300">Storyboard (JSON)</div>
                  <pre className="mt-2 max-h-[280px] overflow-auto rounded-lg border border-neutral-900 bg-neutral-950 p-3 text-xs text-neutral-300">
                    {storyboard ? JSON.stringify(storyboard, null, 2) : "No storyboard yet."}
                  </pre>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    disabled={!variant?.preview_url}
                    onClick={() => {
                      if (!variant?.preview_url) return;
                      window.open(variant.preview_url, "_blank");
                    }}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Export Ad
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(captionText || "")}
                    disabled={!captionText}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Copy Caption
                  </button>
                </div>
              </div>
            </div>

            {(status || err) && (
              <div className="mt-6 text-sm">
                <span className="text-neutral-300">{status}</span>
                {err ? <span className="ml-3 text-rose-400">{err}</span> : null}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}