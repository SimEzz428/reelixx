"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  api,
  downloadUrl,
  errorText,
  FORMATS,
  toAbsolute,
  type AdFormat,
  type MusicMood,
  type PostText,
  type Project,
  type Variant,
} from "@/lib/api";
import { getBrandDefaults } from "@/lib/brand";
import { saveAd } from "@/lib/storage";
import { useHealth } from "@/lib/useHealth";

type Step = 1 | 2 | 3 | 4 | 5;
type AdType = "video" | "static";
type Quality = "free" | "ai";

const STEPS = ["Ad Type", "Format", "Details", "Generate", "Review"];
const TONES = ["professional", "playful", "energetic", "luxury", "expert"];
const VOICES = ["alloy", "nova", "shimmer", "echo", "onyx", "fable"];
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const AD_TYPES: { key: AdType; title: string; desc: string; icon: string }[] = [
  { key: "video", title: "Video Ad", desc: "Short-form video with captions and music, ready for Reels and TikTok.", icon: "🎬" },
  { key: "static", title: "Static Image", desc: "On-brand end-card graphic for Stories and Feed posts.", icon: "🖼️" },
];

const FORMAT_ICONS: Record<AdFormat, string> = { story: "📱", reel: "🎬", square: "⬜", portrait: "📐" };

function Choice({
  active,
  onClick,
  icon,
  title,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative w-full rounded-2xl border p-6 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-violet-500/60 bg-gradient-to-br from-violet-600/10 to-fuchsia-500/10 shadow-lg shadow-violet-500/20"
          : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/50"
      }`}
    >
      <div className="mb-3 text-3xl">{icon}</div>
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-1.5 text-sm text-neutral-400">{children}</div>
      {active && (
        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs text-white">
          ✓
        </div>
      )}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between text-sm font-medium text-neutral-300">
        {label}
        {hint && <span className="text-xs font-normal text-neutral-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function NavButtons({
  canNext,
  onNext,
  onBack,
  nextLabel = "Next",
}: {
  canNext: boolean;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button type="button" onClick={onBack} disabled={!onBack} className="btn-secondary">
        ← Back
      </button>
      {onNext && (
        <button type="button" onClick={onNext} disabled={!canNext} className="btn-primary">
          {nextLabel} →
        </button>
      )}
    </div>
  );
}

export default function StudioPage() {
  const { up, aiAvailable } = useHealth();

  const [step, setStep] = useState<Step>(1);
  const [adType, setAdType] = useState<AdType>("video");
  const [format, setFormat] = useState<AdFormat>("reel");

  const [productUrl, setProductUrl] = useState("");
  const [campaignName, setCampaignName] = useState("Lumina Launch");
  const [productName, setProductName] = useState("Lumina Water Bottle");
  const [description, setDescription] = useState("Self-cleaning bottle with UV-C cap. Keeps water fresh all day.");
  const [bullets, setBullets] = useState<string[]>([]);
  const [price, setPrice] = useState("49");
  const [brandName, setBrandName] = useState("Lumina");
  const [brandColor, setBrandColor] = useState("#7C3AED");

  const [quality, setQuality] = useState<Quality>("free");
  const [music, setMusic] = useState<MusicMood>("upbeat");
  const [voice, setVoice] = useState("alloy");
  const [tone, setTone] = useState("professional");

  const [project, setProject] = useState<Project | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [post, setPost] = useState<PostText | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fmt = FORMATS[format];
  const colorValid = HEX.test(brandColor);
  const canNextFrom3 =
    productName.trim().length > 1 && description.trim().length > 4 && brandName.trim().length > 0 && colorValid;

  // Prefill from Brand Kit defaults, then from query params (?title=&productName=&description=&price=&brandName=&brandColor=&url=).
  useEffect(() => {
    const b = getBrandDefaults();
    if (b.brandName && b.brandName !== "Brand") setBrandName(b.brandName);
    if (b.brandColor) setBrandColor(b.brandColor);
    if (b.musicStyle) setMusic(b.musicStyle);

    const q = new URLSearchParams(window.location.search);
    const set = (key: string, fn: (v: string) => void) => {
      const v = q.get(key);
      if (v) fn(v);
    };
    set("title", setCampaignName);
    set("productName", setProductName);
    set("description", setDescription);
    set("price", setPrice);
    set("brandName", setBrandName);
    set("brandColor", setBrandColor);
    set("url", setProductUrl);
  }, []);

  // AI can't be selected when the backend has no key.
  useEffect(() => {
    if (!aiAvailable && quality === "ai") setQuality("free");
  }, [aiAvailable, quality]);

  async function importFromUrl() {
    if (!productUrl.trim()) return;
    setBusy("import");
    setErr(null);
    try {
      const r = await api.scrape(productUrl.trim());
      if (!r.ok || !r.brief) throw new Error(r.reason || "No product details found on that page.");
      if (r.brief.title) setProductName(r.brief.title.slice(0, 80));
      if (r.brief.description) setDescription(r.brief.description);
      setBullets(r.brief.bullets ?? []);
      toast.success("Imported product details");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function generate() {
    setErr(null);
    setVideoUrl(null);
    setImageUrl(null);
    setPost(null);
    try {
      setBusy("Creating project…");
      const p = await api.createProject({
        title: campaignName.trim() || `${productName} Campaign`,
        product_url: /^https?:\/\//.test(productUrl.trim()) ? productUrl.trim() : undefined,
        brief: { title: productName.trim(), description: description.trim(), price: price.trim(), brand: brandName.trim(), bullets },
        brand: { name: brandName.trim(), color: brandColor },
      });
      setProject(p);

      setBusy(quality === "ai" ? "Writing script with AI…" : "Writing script…");
      await api.generate(p.id, { tones: [tone], format, ai_script: quality === "ai" });
      const v = await api.latestVariant(p.id);
      setVariant(v);
      const pt = await api.postText(p.id);
      setPost(pt);

      const base = {
        id: `p${p.id}`,
        projectId: p.id,
        variantId: v.id,
        title: campaignName.trim() || productName.trim(),
        brandName: brandName.trim(),
        brandColor,
        format,
        createdAt: new Date().toISOString(),
        caption: pt.text,
      };

      if (adType === "video") {
        setBusy(quality === "ai" ? "Rendering with AI visuals + voiceover (about a minute)…" : "Rendering video…");
        const r = await api.assemble(v.id, { mode: quality, music_mood: music, voice });
        setVideoUrl(r.mp4_url);
        saveAd({ ...base, adType: "video", videoUrl: r.mp4_url });
      } else {
        setBusy("Rendering image…");
        const r = await api.staticEndcard(p.id, { width: fmt.w, height: fmt.h });
        if (!r.ok || !r.data_url) throw new Error(r.reason || "Image render failed");
        setImageUrl(r.data_url);
        saveAd({ ...base, adType: "static", imageDataUrl: r.data_url });
      }

      toast.success("Your ad is ready");
      setStep(5);
    } catch (e) {
      setErr(errorText(e));
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function exportZip() {
    if (!variant) return;
    setBusy("Preparing ZIP…");
    try {
      const r = await api.exportZip(variant.id);
      window.location.href = toAbsolute(r.download);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function copyCaption() {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.text);
      toast.success("Caption copied");
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const scenes = variant?.storyboard_json?.scenes ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        {/* Header + progress */}
        <div className="py-8">
          <div className="text-sm font-medium text-neutral-400">Creative Studio</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Create an Ad Campaign</h1>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-900">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <ol className="mt-3 flex justify-between text-xs text-neutral-500">
            {STEPS.map((label, i) => (
              <li key={label} className={step >= i + 1 ? "text-violet-400" : ""}>
                {label}
              </li>
            ))}
          </ol>
          {up === false && (
            <div className="mt-4 rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
              The API is offline. Start the backend (<code>make dev-backend</code>) and this page will reconnect.
            </div>
          )}
        </div>

        {step === 1 && (
          <section className="card sm:p-8">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 1 of 5</div>
            <h2 className="text-3xl font-bold text-white">Choose ad type</h2>
            <p className="mb-8 mt-2 text-neutral-400">What do you want to make?</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {AD_TYPES.map((o) => (
                <Choice key={o.key} active={adType === o.key} onClick={() => setAdType(o.key)} icon={o.icon} title={o.title}>
                  {o.desc}
                </Choice>
              ))}
            </div>
            <NavButtons canNext onNext={() => setStep(2)} />
          </section>
        )}

        {step === 2 && (
          <section className="card sm:p-8">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 2 of 5</div>
            <h2 className="text-3xl font-bold text-white">Choose format</h2>
            <p className="mb-8 mt-2 text-neutral-400">The output is rendered at these exact dimensions.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(FORMATS) as AdFormat[]).map((k) => (
                <Choice key={k} active={format === k} onClick={() => setFormat(k)} icon={FORMAT_ICONS[k]} title={FORMATS[k].label}>
                  {FORMATS[k].tag} • {FORMATS[k].w}×{FORMATS[k].h}
                </Choice>
              ))}
            </div>
            <NavButtons canNext onNext={() => setStep(3)} onBack={() => setStep(1)} />
          </section>
        )}

        {step === 3 && (
          <section className="card sm:p-8">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 3 of 5</div>
            <h2 className="text-3xl font-bold text-white">Campaign details</h2>
            <p className="mb-8 mt-2 text-neutral-400">Paste a product page to auto-fill, or type the details yourself.</p>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <Field label="Product page URL" hint="optional">
                  <div className="flex gap-3">
                    <input
                      className="input"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://yourstore.com/products/…"
                      inputMode="url"
                    />
                    <button
                      type="button"
                      className="btn-secondary shrink-0"
                      onClick={importFromUrl}
                      disabled={!/^https?:\/\/\S+\.\S+/.test(productUrl.trim()) || !!busy}
                    >
                      {busy === "import" ? "Importing…" : "Import"}
                    </button>
                  </div>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Campaign name">
                    <input className="input" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Summer Launch" />
                  </Field>
                  <Field label="Product name">
                    <input className="input" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Lumina Water Bottle" />
                  </Field>
                </div>

                <Field label="Product description" hint="The first sentence becomes the value line">
                  <textarea
                    className="input h-32 resize-y"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key features, benefits, what makes it different…"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Price" hint="optional">
                    <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49" />
                  </Field>
                  <Field label="Brand name">
                    <input className="input" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Lumina" />
                  </Field>
                  <Field label="Brand color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="Pick brand color"
                        value={colorValid && brandColor.length === 7 ? brandColor : "#7c3aed"}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-[46px] w-12 shrink-0 cursor-pointer rounded-xl border border-neutral-700 bg-neutral-900 p-1"
                      />
                      <input
                        className={`input ${colorValid ? "" : "border-rose-600"}`}
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#7C3AED"
                      />
                    </div>
                  </Field>
                </div>
                {bullets.length > 0 && (
                  <div className="text-xs text-neutral-500">
                    Imported {bullets.length} feature{bullets.length > 1 ? "s" : ""}; the first one becomes the proof line.
                  </div>
                )}
              </div>

              <aside className="h-fit rounded-2xl border border-neutral-700 bg-neutral-900/40 p-6 text-sm">
                <div className="mb-4 font-semibold text-neutral-200">Summary</div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-neutral-500">Type</dt>
                  <dd className="text-right capitalize text-neutral-200">{adType}</dd>
                  <dt className="text-neutral-500">Format</dt>
                  <dd className="text-right text-neutral-200">
                    {fmt.label} · {fmt.tag}
                  </dd>
                  <dt className="text-neutral-500">Product</dt>
                  <dd className="truncate text-right text-neutral-200">{productName || "—"}</dd>
                  <dt className="text-neutral-500">Brand</dt>
                  <dd className="flex items-center justify-end gap-2 text-neutral-200">
                    <span className="h-3 w-3 rounded-full border border-neutral-600" style={{ background: colorValid ? brandColor : "transparent" }} />
                    {brandName || "—"}
                  </dd>
                </dl>
              </aside>
            </div>

            <NavButtons canNext={canNextFrom3} onNext={() => setStep(4)} onBack={() => setStep(2)} />
          </section>
        )}

        {step === 4 && (
          <section className="card sm:p-8">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 4 of 5</div>
            <h2 className="text-3xl font-bold text-white">Generate</h2>
            <p className="mb-8 mt-2 text-neutral-400">
              We&apos;ll write the script, build a storyboard and caption, then render your {adType === "video" ? "video" : "image"}.
            </p>

            {adType === "video" && (
              <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-neutral-300">Render quality</div>
                  <Choice active={quality === "free"} onClick={() => setQuality("free")} icon="⚡" title="Free preview">
                    Branded slides, on-screen copy and music. No API credits used.
                  </Choice>
                  <Choice
                    active={quality === "ai"}
                    onClick={() => setQuality("ai")}
                    icon="✨"
                    title="Full AI"
                    disabled={!aiAvailable}
                  >
                    {aiAvailable
                      ? "AI-written script, generated visuals and voiceover. Uses OpenAI credits."
                      : "Add OPENAI_API_KEY to backend/.env and set REELIXX_FREE_MODE=0 to enable."}
                  </Choice>
                </div>
                <div className="space-y-5">
                  <Field label="Tone">
                    <select className="input capitalize" value={tone} onChange={(e) => setTone(e.target.value)}>
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Music">
                    <select className="input" value={music} onChange={(e) => setMusic(e.target.value as MusicMood)}>
                      <option value="upbeat">Upbeat</option>
                      <option value="chill">Chill</option>
                      <option value="luxury">Luxury</option>
                      <option value="none">No music</option>
                    </select>
                  </Field>
                  <Field label="Voice" hint={quality === "ai" ? undefined : "Full AI only"}>
                    <select
                      className="input capitalize"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      disabled={quality !== "ai"}
                    >
                      {VOICES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-700 bg-gradient-to-br from-violet-600/5 to-fuchsia-500/5 p-10 text-center">
              <button type="button" onClick={generate} disabled={!!busy || up === false} className="btn-primary px-8 py-4 text-base">
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Working…
                  </>
                ) : (
                  "Generate ad"
                )}
              </button>
              <div className="mt-4 min-h-5 text-sm text-neutral-400" aria-live="polite">
                {busy ?? ""}
              </div>
              {err && <div className="mt-2 max-w-xl text-sm text-rose-400">{err}</div>}
            </div>

            <NavButtons canNext={false} onBack={busy ? undefined : () => setStep(3)} />
          </section>
        )}

        {step === 5 && (
          <section className="card sm:p-8">
            <div className="mb-2 text-sm font-medium text-violet-400">Step 5 of 5</div>
            <h2 className="text-3xl font-bold text-white">Review & export</h2>
            <p className="mb-8 mt-2 text-neutral-400">Your ad is saved to the Library on this device.</p>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-6">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-neutral-200">Preview</span>
                  <span className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                    {fmt.label} · {fmt.tag}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div
                    className="relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-neutral-700 bg-black"
                    style={{ aspectRatio: `${fmt.w} / ${fmt.h}` }}
                  >
                    {videoUrl ? (
                      <video key={videoUrl} className="h-full w-full" src={toAbsolute(videoUrl)} controls playsInline autoPlay muted />
                    ) : imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL from the API
                      <img src={imageUrl} alt={`${brandName} end-card`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-sm text-neutral-500">No preview</div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {videoUrl && (
                    <>
                      <a href={downloadUrl(videoUrl)} className="btn-primary">
                        Download MP4
                      </a>
                      <button type="button" className="btn-secondary" onClick={exportZip} disabled={!!busy}>
                        Export ZIP
                      </button>
                    </>
                  )}
                  {imageUrl && (
                    <a href={imageUrl} download={`${brandName || "reelixx"}-${format}.png`} className="btn-primary">
                      Download PNG
                    </a>
                  )}
                  {project && (
                    <Link href={`/share/${project.id}`} className="btn-secondary">
                      Share page
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-200">Caption</span>
                    <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={copyCaption} disabled={!post}>
                      Copy
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-neutral-300">{post?.caption ?? "—"}</p>
                  {post && <p className="mt-3 text-sm text-violet-300/80">{post.hashtags.join(" ")}</p>}
                </div>

                {scenes.length > 0 && (
                  <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-200">Script</span>
                      {project && (
                        <Link href={`/review/${project.id}`} className="text-xs text-neutral-400 underline-offset-4 hover:text-white hover:underline">
                          Storyboard JSON
                        </Link>
                      )}
                    </div>
                    <ol className="space-y-2 text-sm">
                      {scenes.map((s) => (
                        <li key={s.id} className="flex gap-3">
                          <span className="w-20 shrink-0 font-mono text-xs leading-5 text-neutral-500">
                            {s.start.toFixed(1)}–{s.end.toFixed(1)}s
                          </span>
                          <span className="text-neutral-300">
                            <span className="mr-2 text-xs uppercase tracking-wide text-violet-400">{s.id}</span>
                            {s.text}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <button type="button" className="btn-secondary w-full" onClick={() => setStep(4)}>
                  Try different settings
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
