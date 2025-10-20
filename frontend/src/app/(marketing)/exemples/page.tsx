// frontend/src/app/(marketing)/examples/page.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Example = {
  slug: string;
  title: string;
  description: string;
  price: string;
  brandName: string;
  brandColor: string;
  logo?: string;
};

const EXAMPLES: Example[] = [
  {
    slug: "insulated-bottle",
    title: "Hydra Bottle",
    description: "Insulated bottle that keeps drinks cold for 24h.",
    price: "29.99",
    brandName: "Hydra",
    brandColor: "#00AEEF",
  },
  {
    slug: "sleep-gummies",
    title: "Zen Sleep Gummies",
    description: "Melatonin-free gummies for deeper, calmer sleep.",
    price: "24.00",
    brandName: "ZenLabs",
    brandColor: "#8B5CF6",
  },
  {
    slug: "hair-oil",
    title: "Bloom Hair Oil",
    description: "Lightweight hair oil for shine and frizz control.",
    price: "19.50",
    brandName: "Bloom",
    brandColor: "#22D3EE",
  },
];

function createHref(e: Example) {
  const q = new URLSearchParams({
    title: e.title,
    description: e.description,
    price: e.price,
    brandName: e.brandName,
    brandColor: e.brandColor,
  });
  return `/create?${q.toString()}`;
}

export default function ExamplesPage() {
  return (
    <>
      <Navbar />

      <section className="border-b border-neutral-900/60">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Examples</h1>
          <p className="mt-2 text-neutral-300">Start from a template and jump right into the flow.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-3">
          {EXAMPLES.map((e) => (
            <div
              key={e.slug}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="text-neutral-200 font-medium">{e.title}</div>
                <div className="mt-1 text-sm text-neutral-400 line-clamp-3">{e.description}</div>
                <div className="mt-3 text-sm text-neutral-300">
                  <span className="text-neutral-500">Brand:</span> {e.brandName}
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-neutral-500">Price:</span> ${e.price}
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-neutral-500">Color:</span>{" "}
                  <span className="inline-flex items-center gap-2">
                    {e.brandColor}
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-neutral-700 align-middle"
                      style={{ background: e.brandColor }}
                    />
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Link
                  href={createHref(e)}
                  className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-neutral-200"
                >
                  Use this template
                </Link>
                <Link
                  href="/create"
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  Open blank
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}