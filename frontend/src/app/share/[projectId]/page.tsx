"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, downloadUrl, errorText, FORMATS, toAbsolute, type PostText, type Project, type Variant } from "@/lib/api";

export default function SharePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [post, setPost] = useState<PostText | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(pid)) return;
    (async () => {
      try {
        const [p, v] = await Promise.all([api.getProject(pid), api.latestVariant(pid)]);
        setProject(p);
        setVariant(v);
        setPost(await api.postText(pid));
      } catch (e) {
        setError(errorText(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [pid]);

  async function render() {
    if (!variant) return;
    setBusy("Rendering…");
    try {
      const r = await api.assemble(variant.id, { mode: "free" });
      setVariant({ ...variant, mp4_url: r.mp4_url });
      toast.success("Video rendered");
    } catch (e) {
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

  async function copy() {
    if (!post) return;
    await navigator.clipboard.writeText(post.text).then(
      () => toast.success("Caption copied"),
      () => toast.error("Couldn't access the clipboard")
    );
  }

  const fmt = FORMATS[variant?.storyboard_json?.format ?? "reel"] ?? FORMATS.reel;
  const title = project?.title || project?.brief_json?.title || `Project #${pid}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500">Project #{pid}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{loading ? "Loading…" : title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/review/${pid}`} className="btn-secondary">
            Storyboard
          </Link>
          <Link href="/studio" className="btn-secondary">
            New ad
          </Link>
        </div>
      </header>

      {error ? (
        <div className="card text-sm text-rose-400">{error}</div>
      ) : (
        !loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card">
              <h2 className="mb-4 font-semibold text-white">Video</h2>
              {variant?.mp4_url ? (
                <>
                  <div
                    className="mx-auto w-full max-w-[320px] overflow-hidden rounded-xl border border-neutral-800 bg-black"
                    style={{ aspectRatio: `${fmt.w} / ${fmt.h}` }}
                  >
                    <video src={toAbsolute(variant.mp4_url)} controls playsInline className="h-full w-full" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href={downloadUrl(variant.mp4_url)} className="btn-primary">
                      Download MP4
                    </a>
                    <button type="button" onClick={exportZip} disabled={!!busy} className="btn-secondary">
                      {busy === "Preparing ZIP…" ? busy : "Export ZIP"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-sm text-neutral-400">
                  <p>This project has no rendered video yet.</p>
                  <button type="button" onClick={render} disabled={!!busy || !variant} className="btn-primary mt-4">
                    {busy ?? "Render free preview"}
                  </button>
                </div>
              )}
            </section>

            <section className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Post copy</h2>
                <button type="button" onClick={copy} disabled={!post} className="btn-secondary px-3 py-1.5 text-xs">
                  Copy
                </button>
              </div>
              {post ? (
                <>
                  <p className="whitespace-pre-wrap text-sm text-neutral-300">{post.caption}</p>
                  <p className="mt-3 text-sm text-violet-300/80">{post.hashtags.join(" ")}</p>
                </>
              ) : (
                <p className="text-sm text-neutral-500">No post copy.</p>
              )}
            </section>
          </div>
        )
      )}
    </main>
  );
}
