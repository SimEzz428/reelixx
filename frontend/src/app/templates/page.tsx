"use client";

import Link from "next/link";
import StudioShell from "@/components/StudioShell";

const TEMPLATES = [
  {
    slug: "hydrabottle",
    title: "Hydra Bottle",
    description: "Insulated bottle that keeps drinks cold for 24h.",
    price: "29.99",
    brandName: "Hydra",
    brandColor: "#00AEEF",
    productName: "Hydra Bottle",
  },
  {
    slug: "zensleep",
    title: "Zen Sleep Gummies",
    description: "Melatonin-free gummies for deeper, calmer sleep.",
    price: "24.00",
    brandName: "ZenLabs",
    brandColor: "#8B5CF6",
    productName: "Zen Sleep Gummies",
  },
  {
    slug: "bloom-oil",
    title: "Bloom Hair Oil",
    description: "Lightweight hair oil for shine and frizz control.",
    price: "19.50",
    brandName: "Bloom",
    brandColor: "#22D3EE",
    productName: "Bloom Hair Oil",
  },
];

function toCreateHref(t: any) {
  const q = new URLSearchParams({
    title: t.title,
    description: t.description,
    price: t.price,
    brandName: t.brandName,
    brandColor: t.brandColor,
    productName: t.productName,
  });
  return `/create?${q.toString()}`;
}

export default function TemplatesPage() {
  return (
    <StudioShell>
      <div className="px-2">
        <h1 className="text-3xl font-semibold">Templates</h1>
        <p className="mt-2 text-neutral-300">Start from a template and jump into the Create flow.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.slug} className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
              <div className="text-neutral-200 font-medium">{t.title}</div>
              <div className="mt-1 text-sm text-neutral-400 line-clamp-3">{t.description}</div>
              <div className="mt-2 text-sm">
                <span className="text-neutral-500">Brand:</span> {t.brandName}
              </div>
              <div className="mt-1 text-sm">
                <span className="text-neutral-500">Price:</span> ${t.price}
              </div>
              <div className="mt-1 text-sm">
                <span className="text-neutral-500">Color:</span>{" "}
                <span className="inline-flex items-center gap-2">
                  {t.brandColor}
                  <span className="inline-block h-3 w-3 rounded-full border border-neutral-700" style={{ background: t.brandColor }} />
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link href={toCreateHref(t)} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black">
                  Use this template
                </Link>
                <Link href="/create" className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-200">
                  Open blank
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}