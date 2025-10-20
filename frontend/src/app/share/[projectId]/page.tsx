
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BACKEND_URL, toAbsolute } from "@/lib/api";

type Variant = {
  id: number;
  storyboard_json?: any;
  script_json?: any;
};

export default function SharePage() {
  const params = useParams<{ projectId: string }>();
  const pid = Number(params.projectId);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [postText, setPostText] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const downloadHref = useMemo(() => {
    if (!videoUrl) return "";
    const name = videoUrl.split("/").pop();
    if (!name) return "";
    return toAbsolute(`/exports/download/${name}`);
  }, [videoUrl]);

  useEffect(() => {
    async function boot() {
      setBusy(true);
      setStatus("Loading…");
      setError(null);
      try {
        // latest variant
        const vres = await fetch(`${BACKEND_URL}/projects/${pid}/variants/latest`);
        if (!vres.ok) throw new Error(`variant fetch failed: ${vres.status}`);
        const vdata = await vres.json();
        setVariant(vdata);

        // try to read MP4 url if already assembled
        const maybe = vdata?.assembled_mp4 || vdata?.mp4_url || null; // optional field
        if (maybe) {
          setVideoUrl(maybe);
        } else {
          // fall back: see if a conventional name exists
          const guess = `/exports/variant_${vdata?.id}.mp4`;
          setVideoUrl(guess);
        }

        // post text
        const pres = await fetch(`${BACKEND_URL}/post_text/projects/${pid}`);
        if (pres.ok) {
          const pdata = await pres.json();
          setPostText(pdata?.text || JSON.stringify(pdata));
        }
        setStatus("Ready ✅");
      } catch (e: any) {
        setError(e.message ?? String(e));
        setStatus("Error");
      } finally {
        setBusy(false);
      }
    }
    if (Number.isFinite(pid)) boot();
  }, [pid]);

  async function handleDownloadMp4() {
    if (!videoUrl) return;
    setBusy(true);
    setError(null);
    setStatus("Downloading MP4…");
    try {
      const abs = toAbsolute(videoUrl);
      const res = await fetch(abs);
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`fetch mp4 failed: ${res.status} — ${t}`);
      }
      const blob = await res.blob();
      const name = videoUrl.split("/").pop() || "reelixx.mp4";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("MP4 downloaded ✅");
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus("Error downloading MP4");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadZip() {
    if (!variant?.id) return;
    setBusy(true);
    setError(null);
    setStatus("Preparing export ZIP…");
    try {
      const res = await fetch(`${BACKEND_URL}/variants/${variant.id}/export_zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`export_zip failed: ${res.status} — ${t}`);
      }
      const data = await res.json();
      const dl = data?.download ? toAbsolute(data.download) : null;
      if (!dl) throw new Error("No download URL returned");
      window.location.href = dl;
      setStatus("Export ZIP ready ✅");
    } catch (e: any) {
      setError(e.message ?? String(e));
      setStatus("Error exporting ZIP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reelixx — Share</h1>
            <p className="text-xs text-neutral-400">Project #{pid}</p>
          </div>
          <Link
            href={`/studio?p=${pid}`}
            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800"
          >
            Open in Studio
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Video */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h2 className="mb-3 text-lg font-medium">Preview MP4</h2>
            {videoUrl ? (
              <>
                <video
                  src={toAbsolute(videoUrl)}
                  controls
                  className="aspect-[9/16] w-full max-w-sm rounded-md border border-neutral-800 bg-black"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={handleDownloadMp4}
                    disabled={busy || !videoUrl}
                    className="text-sm underline text-neutral-300 disabled:opacity-50"
                  >
                    Download MP4
                  </button>
                  <a
                    href={toAbsolute(videoUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline text-neutral-300"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={handleDownloadZip}
                    disabled={busy || !variant?.id}
                    className="text-sm underline text-neutral-300 disabled:opacity-50"
                  >
                    Download ZIP (MP4 + JSON)
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-400">No MP4 found for this project.</p>
            )}
          </section>

          {/* Post copy */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h2 className="mb-3 text-lg font-medium">Post Copy</h2>
            {postText ? (
              <pre className="whitespace-pre-wrap text-sm text-neutral-300">{postText}</pre>
            ) : (
              <p className="text-sm text-neutral-400">No post text.</p>
            )}
          </section>
        </div>

        {(status || error) && (
          <div className="mt-6 text-sm">
            <span className="text-neutral-300">{status}</span>
            {error ? <span className="ml-3 text-rose-400">{error}</span> : null}
          </div>
        )}
      </div>
    </main>
  );
}