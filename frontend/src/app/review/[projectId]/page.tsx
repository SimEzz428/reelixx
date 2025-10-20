
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/api";

type Variant = { id: number; storyboard_json?: any; script_json?: any };

export default function ReviewPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const pid = Number(params.projectId);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function boot() {
      setBusy(true);
      setStatus("Loading…");
      setError(null);
      try {
        const vres = await fetch(`${BACKEND_URL}/projects/${pid}/variants/latest`);
        if (!vres.ok) throw new Error(`variant fetch failed: ${vres.status}`);
        const vdata = await vres.json();
        setVariant(vdata);
        setStoryboard(vdata?.storyboard_json || null);
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

  async function handleAssembleAndShare() {
    if (!variant?.id) return;
    setBusy(true);
    setError(null);
    setStatus("Assembling MP4…");
    try {
      const res = await fetch(`${BACKEND_URL}/variants/${variant.id}/assemble`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`assemble failed: ${res.status} — ${t}`);
      }
      setStatus("Opening share page…");
      router.push(`/share/${pid}`);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setStatus("Error assembling");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
            <p className="text-xs text-neutral-400">Project #{pid}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/studio?p=${pid}`}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800"
            >
              Back to Studio
            </Link>
            <Link
              href={`/share/${pid}`}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800"
            >
              View Share
            </Link>
          </div>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <h2 className="mb-3 text-lg font-medium">Storyboard (JSON)</h2>
          {storyboard ? (
            <pre className="max-h-[60vh] overflow-auto rounded-md border border-neutral-900 bg-neutral-950 p-3 text-xs text-neutral-300">
{JSON.stringify(storyboard, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-neutral-400">No storyboard found.</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAssembleAndShare}
              disabled={busy || !variant?.id}
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              Assemble & open Share
            </button>
          </div>
        </section>

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