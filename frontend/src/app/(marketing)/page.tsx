"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingHome() {
  return (
    <main className="bg-neutral-950 text-neutral-100">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        {/* soft animated glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-2xl" />
          <div className="absolute -bottom-40 right-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.25),transparent_60%)] blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              New • Local MVP live
            </span>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              Turn product briefs into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                9:16 ad videos
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
              Reelixx generates script, storyboard, end-card, and a preview MP4 for TikTok, Reels, and Shorts —
              all from a short description of your product.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/studio"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Open Studio
              </Link>

              <Link
                href="/examples"
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-sm text-neutral-200 transition hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                Use a template
              </Link>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-neutral-800 px-5 py-2.5 text-sm text-neutral-300 transition hover:-translate-y-0.5 hover:bg-neutral-900"
              >
                View on GitHub
              </a>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              No sign-in. Runs locally with your FastAPI backend.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST / STACK ===== */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-center text-xs uppercase tracking-widest text-neutral-500">
            Built with FastAPI • Next.js • MoviePy • Tailwind
          </p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold">Everything you need to ship short-form ads fast</h2>
            <p className="mt-3 text-neutral-300">
              Opinionated defaults so you can go from product brief → shareable preview in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Script generation", desc: "Hook → Value → Proof → CTA beats with timestamps.", emoji: "✍️" },
              { title: "Storyboard", desc: "Beat-mapped visuals + overlays, ready for assembly.", emoji: "🎞️" },
              { title: "Static end-card", desc: "On-brand PNG with color + optional logo.", emoji: "🪪" },
              { title: "MP4 preview", desc: "Vertical video (1080×1920) rendered via MoviePy.", emoji: "🎬" },
              { title: "Post copy", desc: "Auto-generated captions/headlines per platform.", emoji: "💬" },
              { title: "One-click export", desc: "ZIP with MP4 + JSONs to share or iterate.", emoji: "📦" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-xl border border-neutral-900 bg-neutral-950 p-5"
              >
                <div className="mb-2 text-2xl">{f.emoji}</div>
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-neutral-300">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA STRIP ===== */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-8 text-center">
            <h3 className="text-xl font-semibold">Ready to try it?</h3>
            <p className="mt-2 text-neutral-300">
              Open the Studio, paste a product brief, and get a preview video in minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/studio"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Open Studio
              </Link>
              <Link
                href="/examples"
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-sm text-neutral-200 transition hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                Start from a template
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}