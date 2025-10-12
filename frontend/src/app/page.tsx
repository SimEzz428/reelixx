"use client";

import { useState } from "react";
import {
  createProject,
  generateForProject,
  getLatestVariant,
  generateStatic,
  getPostText,
  assembleVariant,
} from "@/lib/api";

/* eslint-disable @next/next/no-img-element */

type Variant = {
  id: number;
  status?: string;
  tone?: string;
  persona?: string;
  script_json?: unknown;
  storyboard_json?: unknown;
};


function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
}

const RAW_API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const BACKEND_URL = (
  /^https?:\/\//.test(RAW_API) ? RAW_API : `https://${RAW_API}`
).replace(/\/$/, "");
function toAbsolute(url: string | null): string | null {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function Home() {
  const [title, setTitle] = useState("Demo Product");
  const [description, setDescription] = useState(
    "Insulated bottle that keeps drinks cold for 24h.",
  );
  const [price, setPrice] = useState("29.99");
  const [brandName, setBrandName] = useState("Hydra");
  const [tone, setTone] = useState("bold");
  const [persona, setPersona] = useState("broad");

  const [projectId, setProjectId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [variant, setVariant] = useState<Variant | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endcardDataUrl, setEndcardDataUrl] = useState<string | null>(null);
  const [postText, setPostText] = useState<{
    caption: string;
    hashtags: string[];
  } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [downloadHref, setDownloadHref] = useState<string | null>(null);
  async function handleAssemble() {
    if (!variant?.id) return;
    setBusy(true);
    setError(null);
    setStatus("Assembling MP4…");
    try {
      const data: { mp4_url?: string; url?: string; download?: string; filename?: string } =
        await assembleVariant(variant.id);

      let url = data?.mp4_url || data?.url || null;
      url = toAbsolute(url);
      setVideoUrl(url);

      // Prefer explicit download URL from backend; fall back to parsing filename from `url`
      let dl: string | null = null;
      if (data?.download) {
        dl = toAbsolute(data.download);
      } else if (url) {
        try {
          const u = new URL(url);
          const segs = u.pathname.split("/").filter(Boolean);
          const name = segs[segs.length - 1] || "";
          if (name) {
            // IMPORTANT: use the dedicated /download route (not under /exports)
            dl = `${BACKEND_URL}/download/${encodeURIComponent(name)}`;
          }
        } catch {
          dl = null;
        }
      }
      setDownloadHref(dl);

      setStatus("Video ready ✅");
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error assembling video");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProject() {
    setBusy(true);
    setError(null);
    setStatus("Creating project…");
    try {
      const res = await createProject({
        title,
        brief: {
          title,
          description,
          price,
          brand: brandName, // accepts string or object
          images: [],
        },
        brand: { color: "#00AEEF", font: "Inter" },
      });
      setProjectId(res.id);
      setStatus(`Project created: ${res.id}`);
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error creating project");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    setStatus("Generating script + storyboard…");
    try {
      await generateForProject(projectId, {
        n_variants: 1,
        tones: [tone],
        persona,
      });
      setStatus("Fetching latest variant…");
      const v = await getLatestVariant(projectId);
      setVariant(v);
      setStatus("Ready ✅");
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error during generation");
    } finally {
      setBusy(false);
    }
  }
  async function handleGenerateStatic() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    setStatus("Generating static end-card…");
    try {
      const { ok, data_url, reason } = await generateStatic(projectId, {
        cta: "Shop now →",
      });
      if (!ok || !data_url) throw new Error(reason || "Unknown error");
      setEndcardDataUrl(data_url);
      setStatus("End-card ready ✅");
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error generating static");
    } finally {
      setBusy(false);
    }
  }
  async function handleGetPostText() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    setStatus("Generating caption + hashtags…");
    try {
      const r = await getPostText(projectId);
      setPostText(r);
      setStatus("Post text ready ✅");
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error generating post text");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportZip() {
    if (!variant?.id) return;
    setBusy(true);
    setError(null);
    setStatus("Preparing export ZIP…");
    try {
      const res = await fetch(
        `${BACKEND_URL}/variants/${variant.id}/export_zip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`export_zip failed: ${res.status} — ${t}`);
      }
      const data = await res.json();
      const dl = data && data.download ? toAbsolute(data.download) : null;
      if (!dl) throw new Error("No download URL returned");
      // trigger download
      window.location.href = dl;
      setStatus("Export ZIP ready ✅");
    } catch (e) {
      setError(errMsg(e));
      setStatus("Error exporting ZIP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reelixx — MVP
          </h1>
          <span className="text-xs text-neutral-400">
            Backend: {BACKEND_URL}
          </span>
        </header>

        {/* Form */}
        <section className="rounded-xl border border-neutral-800 p-4 space-y-3">
          <h2 className="text-lg font-medium">Create Project</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
                placeholder="Brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              <button
                onClick={handleAssemble}
                disabled={busy || !variant?.id}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                5) Assemble MP4
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
                placeholder="Tone (bold | playful | luxurious | expert)"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
              <input
                className="rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
                placeholder="Persona (broad, gen-z, etc.)"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                disabled={busy}
                className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                1) Create Project
              </button>
              <button
                onClick={handleGenerate}
                disabled={busy || !projectId}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                2) Generate Script + Storyboard
              </button>
              {projectId && (
                <span className="text-xs text-neutral-400 self-center">
                  Project ID: {projectId}
                </span>
              )}
              <button
                onClick={handleGenerateStatic}
                disabled={busy || !projectId}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                3) Generate Static End-Card
              </button>
              <button
                onClick={handleGetPostText}
                disabled={busy || !projectId}
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                4) Generate Caption + Hashtags
              </button>
            </div>

            {status && (
              <p className="text-sm text-neutral-300">Status: {status}</p>
            )}
            {error && <p className="text-sm text-red-400">Error: {error}</p>}
          </div>
        </section>

        {/* Static End-Card Preview */}
        <div className="rounded-xl border border-indigo-800 p-4 mt-4">
          <h2 className="text-lg font-medium mb-3">Static End-Card Preview</h2>
          {!endcardDataUrl ? (
            <p className="text-neutral-400 text-sm">
              No static end-card generated yet. Click “Generate Static
              End-Card”.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={endcardDataUrl}
                alt="Static End-Card"
                className="rounded-md border border-neutral-700 max-w-full"
                style={{ background: "#fff" }}
              />
              <a
                href={endcardDataUrl}
                download="endcard.png"
                className="text-xs text-indigo-400 underline"
              >
                Download End-Card
              </a>
            </div>
          )}
        </div>

        {postText && (
          <section className="rounded-xl border border-neutral-800 p-4">
            <h2 className="text-lg font-medium mb-3">Post Text</h2>
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-medium">Caption:</span>{" "}
                <span className="text-neutral-300">{postText.caption}</span>
              </div>
              <div>
                <span className="font-medium">Hashtags:</span>{" "}
                <span className="text-neutral-300">
                  {postText.hashtags.join(" ")}
                </span>
              </div>
            </div>
          </section>
        )}

        {videoUrl && (
          <section className="rounded-xl border border-neutral-800 p-4 mt-6">
            <h2 className="text-lg font-medium mb-3">Final MP4</h2>
            <video
              src={toAbsolute(videoUrl) || undefined}
              controls
              className="w-full max-w-sm rounded-md border border-neutral-800"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={downloadHref || undefined}
                download="reelixx_final.mp4"
                className="inline-block text-sm underline text-neutral-300"
              >
                Download MP4
              </a>
              <a
                href={toAbsolute(videoUrl) || undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm underline text-neutral-300"
              >
                Open in new tab
              </a>
              <button
                onClick={handleExportZip}
                disabled={busy || !variant?.id}
                className="inline-block text-sm underline text-neutral-300 disabled:opacity-50"
              >
                Download ZIP (MP4 + JSON)
              </button>
            </div>
          </section>
        )}

        {/* Output */}
        <section className="rounded-xl border border-neutral-800 p-4">
          <h2 className="text-lg font-medium mb-3">Latest Variant</h2>
          {!variant ? (
            <p className="text-neutral-400 text-sm">
              No variant yet. Create a project and click “Generate”.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-neutral-300">
                <div>Variant ID: {variant.id}</div>
                <div>Status: {variant.status}</div>
                <div>Tone: {variant.tone}</div>
                <div>Persona: {variant.persona}</div>
              </div>

              <details className="rounded-md border border-neutral-800">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm bg-neutral-900">
                  script_json
                </summary>
                <pre className="overflow-auto text-xs p-3">
                  {JSON.stringify(variant.script_json, null, 2)}
                </pre>
              </details>

              <details className="rounded-md border border-neutral-800">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm bg-neutral-900">
                  storyboard_json
                </summary>
                <pre className="overflow-auto text-xs p-3">
                  {JSON.stringify(variant.storyboard_json, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
