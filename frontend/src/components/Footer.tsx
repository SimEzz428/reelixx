import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/library", label: "Library" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/brand", label: "Brand Kit" },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 bg-gradient-to-t from-neutral-950 to-neutral-900 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Reelixx</span>
          </div>
          <p className="max-w-md text-sm text-neutral-400">
            AI-powered short-form ad generator for TikTok, Reels, and Shorts. Create campaigns in minutes, not weeks.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-neutral-200">Product</h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl px-6 text-xs text-neutral-600">© {new Date().getFullYear()} Reelixx</div>
    </footer>
  );
}
