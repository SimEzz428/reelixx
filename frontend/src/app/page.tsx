import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        {/* soft radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(99,102,241,.25),transparent)]" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              New • MVP live
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              Create short-form ads in minutes, not weeks.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
              Reelixx turns a simple product brief into a ready-to-post 9:16 video — script,
              storyboard, captions, end-card, and an MP4 preview. Runs locally with your FastAPI
              backend.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/studio"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
              >
                Open Studio
              </Link>
              <Link
                href="/examples"
                className="rounded-lg border border-neutral-800 px-5 py-2.5 text-sm text-neutral-200 hover:bg-neutral-900"
              >
                See Examples
              </Link>
            </div>

            <p className="mt-3 text-xs text-neutral-400">
              No sign-up • Runs locally with FastAPI backend
            </p>
          </div>
        </div>
      </section>

      {/* Tech strip */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-center text-xs uppercase tracking-widest text-neutral-500">
            Built with FastAPI • Next.js • MoviePy • Tailwind
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold">Everything you need to ship ads fast</h2>
            <p className="mt-3 text-neutral-300">
              Opinionated defaults so you can go from product brief → shareable preview in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Script generation",
                desc: "Hook → Value → Proof → CTA beats with timestamps.",
                emoji: "✍️",
              },
              {
                title: "Storyboard",
                desc: "Beat-mapped visuals + overlays, ready for assembly.",
                emoji: "🎞️",
              },
              {
                title: "Static end-card",
                desc: "On-brand PNG with color + optional logo.",
                emoji: "🪪",
              },
              {
                title: "MP4 preview",
                desc: "Vertical video (1080×1920) rendered via MoviePy.",
                emoji: "🎬",
              },
              {
                title: "Post copy",
                desc: "Auto-generated captions & hashtags per platform.",
                emoji: "💬",
              },
              {
                title: "One-click export",
                desc: "ZIP with MP4 + JSONs to share or iterate.",
                emoji: "📦",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-neutral-900 bg-neutral-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
              >
                <div className="mb-2 text-2xl">{f.emoji}</div>
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-neutral-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <p className="mt-3 text-neutral-300">
              Three steps. Sensible defaults. Shareable results.
            </p>
          </div>

          <ol className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add your brief",
                text: "Title, description, price, brand name & color.",
              },
              {
                step: "2",
                title: "Generate",
                text: "Script, storyboard, static end-card and MP4 preview.",
              },
              {
                step: "3",
                title: "Export",
                text: "Download ZIP (MP4 + JSONs) or share the link.",
              },
            ].map((s) => (
              <li
                key={s.step}
                className="rounded-xl border border-neutral-900 bg-neutral-950 p-5"
              >
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                  {s.step}
                </div>
                <div className="font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-neutral-300">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link
              href="/studio"
              className="inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              Try the Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-neutral-900 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/10 to-transparent p-8">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-2xl font-semibold">Ready to create your first ad?</h3>
              <p className="mt-2 text-neutral-300">
                Open the Studio and generate your first 9:16 preview with a simple brief.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/studio"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
                >
                  Open Studio
                </Link>
                <Link
                  href="/examples"
                  className="rounded-lg border border-neutral-800 px-5 py-2.5 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  Start from a template
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}