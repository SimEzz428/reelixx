export default function About() {
  return (
    <main className="bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">About Reelixx</h1>
        <p className="mt-4 text-neutral-300">
          Reelixx is a small MVP that converts a simple product brief into a ready-to-post 9:16 ad:
          script → storyboard → static end-card → MP4 preview.
        </p>

        <h2 className="mt-10 text-xl font-medium">Tech stack</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-neutral-300">
          <li>Frontend: Next.js + Tailwind + Framer Motion</li>
          <li>Backend: FastAPI (Python), MoviePy for rendering</li>
          <li>Packaging: ZIP export (MP4 + JSONs)</li>
        </ul>

        <p className="mt-8 text-neutral-400 text-sm">
          This project is optimized for quick iteration and showcasing end-to-end product engineering.
        </p>
      </section>
    </main>
  );
}