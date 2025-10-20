
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/api";

export default function CreatePage() {
  const router = useRouter();


  const [title, setTitle] = useState("Lumina Water Bottle");
  const [description, setDescription] = useState("Self-cleaning bottle with UV-C cap. Keeps water fresh.");
  const [price, setPrice] = useState("49");
  const [brandName, setBrandName] = useState("Lumina");
  const [brandColor, setBrandColor] = useState("#5b7cff");
  const [productUrl, setProductUrl] = useState("https://example.com/lumina");


  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const q = u.searchParams;
      const t = q.get("title");
      const d = q.get("description");
      const pr = q.get("price");
      const bn = q.get("brandName");
      const bc = q.get("brandColor");
      const pu = q.get("url");

      if (t) setTitle(t);
      if (d) setDescription(d);
      if (pr) setPrice(pr);
      if (bn) setBrandName(bn);
      if (bc) setBrandColor(bc);
      if (pu) setProductUrl(pu);
    } catch {/* ignore */}
  }, []);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    setStatus("Creating project…");
    try {
      const body = {
        title,
        description,
        price,
        product_url: productUrl,
        brand_json: { name: brandName, color: brandColor },
      };
      const res = await fetch(`${BACKEND_URL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`create failed: ${res.status} — ${t}`);
      }
      const data = await res.json();
      const pid = data?.id ?? data?.project_id;
      if (!pid) throw new Error("No project id returned");
      setStatus("Redirecting to Studio…");
      router.push(`/studio?p=${pid}`);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setStatus("Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="border-b border-neutral-900/60">
        <div className="mx-auto max-w-6xl px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Create a project</h1>
              <p className="text-sm text-neutral-400">You’ll be taken to Studio after creation.</p>
            </div>
            <Link
              href="/examples"
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800"
            >
              Use a template
            </Link>
          </div>
          {(status || error) && (
            <div className="mt-3 text-sm">
              <span className="text-neutral-300">{status}</span>
              {error ? <span className="ml-3 text-rose-400">{error}</span> : null}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
          <div className="grid gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-neutral-300">Product title</span>
              <input
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-neutral-300">Description</span>
              <textarea
                className="min-h-[88px] w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-neutral-300">Price (USD)</span>
                <input
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-neutral-300">Product URL</span>
                <input
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-neutral-300">Brand name</span>
                <input
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-neutral-300">Brand color</span>
                <input
                  type="color"
                  className="h-[40px] w-full rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm outline-none"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCreate}
                disabled={busy}
                className="rounded-md bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
              >
                Create & go to Studio
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Tip: You can prefill this form using query params:{" "}
          <code className="rounded bg-neutral-900 px-1">
            ?title=&description=&price=&brandName=&brandColor=&url=
          </code>
        </p>
      </div>
    </main>
  );
}