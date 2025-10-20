"use client";

import Link from "next/link";

type T = {
  title: string;
  description: string;
  price?: string;
  brandName?: string;
  brandColor?: string;
  badge?: string;
};

const templates: T[] = [
  {
    title: "Wireless Earbuds",
    description:
      "Premium true wireless earbuds with active noise cancellation, 40h battery, and sweat resistance.",
    price: "129",
    brandName: "Auralite",
    brandColor: "#7c3aed",
    badge: "Electronics",
  },
  {
    title: "Collagen Peptides",
    description:
      "Hydrolyzed collagen peptides for hair, skin, nails, and joints. Mixes instantly with hot/cold drinks.",
    price: "39",
    brandName: "GlowLabs",
    brandColor: "#22c55e",
    badge: "Supplements",
  },
  {
    title: "Smart Standing Desk",
    description:
      "Electric sit-stand desk with memory presets, cable tray, and anti-collision safety.",
    price: "499",
    brandName: "Ergopro",
    brandColor: "#0ea5e9",
    badge: "Home Office",
  },
  {
    title: "Vitamin C Serum",
    description:
      "Stabilized 15% Vitamin C with hyaluronic acid brightens, firms, and fights free radicals.",
    price: "29",
    brandName: "Citria",
    brandColor: "#f59e0b",
    badge: "Beauty",
  },
  {
    title: "Matcha Starter Kit",
    description:
      "Ceremonial grade matcha with bamboo whisk, scoop, and bowl. Smooth, vibrant, and umami-rich.",
    price: "59",
    brandName: "Nori Matcha",
    brandColor: "#22c55e",
    badge: "Food & Drink",
  },
  {
    title: "Minimalist Wallet",
    description:
      "RFID-blocking aluminum wallet with quick-access tab and cash strap. Slim and durable.",
    price: "49",
    brandName: "Slate",
    brandColor: "#64748b",
    badge: "Accessories",
  },
];

function toStudioURL(t: T) {
  const params = new URLSearchParams();
  params.set("title", t.title);
  params.set("description", t.description);
  if (t.price) params.set("price", t.price);
  if (t.brandName) params.set("brandName", t.brandName);
  if (t.brandColor) params.set("brandColor", t.brandColor);
  // NOTE: Studio will read these from URL and pre-fill the form
  return `/studio?${params.toString()}`;
}

export default function TemplatesPage() {
  return (
    <main className="bg-neutral-950 text-neutral-100">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-2 max-w-2xl text-neutral-300">
            Pick a template to pre-fill the Studio with a realistic product brief. You can tweak anything before generating.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.title}
                className="group rounded-xl border border-neutral-900 bg-neutral-950 p-5 hover:border-neutral-700"
              >
                {t.badge && (
                  <span className="inline-flex items-center rounded-full border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                    {t.badge}
                  </span>
                )}
                <h3 className="mt-3 text-lg font-medium">{t.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-neutral-300">{t.description}</p>
                <div className="mt-3 text-xs text-neutral-400">
                  {t.brandName && <span className="mr-3">Brand: {t.brandName}</span>}
                  {t.price && <span>Price: ${t.price}</span>}
                </div>
                {t.brandColor && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                    <span>Brand color</span>
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-neutral-800"
                      style={{ background: t.brandColor }}
                    />
                    <span className="font-mono">{t.brandColor}</span>
                  </div>
                )}

                <div className="mt-5">
                  <Link
                    href={toStudioURL(t)}
                    className="inline-flex rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
                  >
                    Use this in Studio →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-sm text-neutral-400">
            Want more? Duplicate a card and tweak the content.
          </div>
        </div>
      </section>
    </main>
  );
}