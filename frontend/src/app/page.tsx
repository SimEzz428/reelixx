import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Enhanced background effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(139,92,246,.15),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_80%_20%,rgba(236,72,153,.1),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_80%,rgba(59,130,246,.08),transparent)]" />
        
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
              Create short-form ads in{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                minutes
              </span>
              , not weeks.
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-neutral-300">
              Reelixx transforms a simple product brief into a complete 9:16 video campaign — 
              AI-generated script, storyboard, captions, end-card, and MP4 preview. 
              All powered by your local FastAPI backend.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/studio"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
              >
                <span className="relative z-10">Open Studio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Everything you need to ship ads fast
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Opinionated defaults so you can go from product brief → shareable preview in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Script Generation",
                desc: "Hook → Value → Proof → CTA beats with precise timestamps.",
                emoji: "✍️",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Storyboard",
                desc: "Beat-mapped visuals + overlays, ready for seamless assembly.",
                emoji: "🎞️",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Static End-card",
                desc: "On-brand PNG with custom colors + optional logo integration.",
                emoji: "🪪",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                title: "MP4 Preview",
                desc: "Vertical video (1080×1920) rendered via MoviePy engine.",
                emoji: "🎬",
                gradient: "from-red-500 to-orange-500",
              },
              {
                title: "Post Copy",
                desc: "Auto-generated captions & hashtags optimized per platform.",
                emoji: "💬",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                title: "One-click Export",
                desc: "ZIP with MP4 + JSONs to share or iterate instantly.",
                emoji: "📦",
                gradient: "from-yellow-500 to-amber-500",
              },
            ].map((f, index) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-800/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10">
                  <div className="mb-4 text-3xl">{f.emoji}</div>
                  <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{f.desc}</p>
                </div>
                
                {/* Subtle gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl ${f.gradient} opacity-10 blur-xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-800/50 bg-gradient-to-b from-neutral-950 to-neutral-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Three simple steps. Sensible defaults. Shareable results.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add your brief",
                text: "Title, description, price, brand name & color.",
                icon: "📝",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                step: "2",
                title: "Generate",
                text: "Script, storyboard, static end-card and MP4 preview.",
                icon: "✨",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                step: "3",
                title: "Export",
                text: "Download ZIP (MP4 + JSONs) or share the link.",
                icon: "🚀",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((s, index) => (
              <div
                key={s.step}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-800/50"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative z-10 text-center">
                  <div className="mb-4 text-4xl">{s.icon}</div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{s.text}</p>
                </div>
                
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                
                {/* Connecting line (hidden on mobile) */}
                {index < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-neutral-700 to-transparent sm:block"></div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/studio"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
            >
              <span className="relative z-10">Try the Studio</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-violet-600/10 via-fuchsia-500/5 to-transparent p-12 backdrop-blur-sm">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(139,92,246,.1),transparent)]"></div>
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-violet-500/20 to-transparent blur-2xl"></div>
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-fuchsia-500/20 to-transparent blur-2xl"></div>
            
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <h3 className="bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                Ready to create your first ad?
              </h3>
              <p className="mt-4 text-lg text-neutral-300">
                Open the Studio and generate your first 9:16 preview with a simple brief.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/studio"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
                >
                  <span className="relative z-10">Open Studio</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}