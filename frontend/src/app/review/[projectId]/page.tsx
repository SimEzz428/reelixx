"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorText, type Variant } from "@/lib/api";

export default function ReviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(pid)) return;
    api.latestVariant(pid).then(setVariant, (e) => setError(errorText(e)));
  }, [pid]);

  const sb = variant?.storyboard_json;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500">Project #{pid}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Storyboard</h1>
        </div>
        <Link href={`/share/${pid}`} className="btn-secondary">
          Back to share page
        </Link>
      </header>

      {error && <div className="card text-sm text-rose-400">{error}</div>}

      {sb && (
        <div className="space-y-6">
          <section className="card">
            <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-400">
              <span>
                Canvas <span className="text-neutral-200">{sb.canvas.w}×{sb.canvas.h}</span>
              </span>
              <span>
                FPS <span className="text-neutral-200">{sb.canvas.fps}</span>
              </span>
              <span>
                Script <span className="text-neutral-200">{variant?.script_json?.meta?.source === "ai" ? "AI" : "template"}</span>
              </span>
            </div>
            <ol className="divide-y divide-neutral-800">
              {sb.scenes.map((s) => (
                <li key={s.id} className="grid grid-cols-[90px_80px_1fr] gap-3 py-3 text-sm">
                  <span className="font-mono text-xs leading-5 text-neutral-500">
                    {s.start.toFixed(2)}–{s.end.toFixed(2)}s
                  </span>
                  <span className="text-xs uppercase leading-5 tracking-wide text-violet-400">{s.id}</span>
                  <span className="text-neutral-200">{s.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <details className="card">
            <summary className="cursor-pointer text-sm font-medium text-neutral-300">Raw JSON</summary>
            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300">
              {JSON.stringify(sb, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}
