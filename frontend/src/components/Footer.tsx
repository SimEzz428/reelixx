export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 bg-gradient-to-t from-neutral-950 to-neutral-900 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Reelixx
              </span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-md">
              AI-powered short-form ad generator for TikTok, Reels, and Shorts. 
              Create professional campaigns in minutes, not weeks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="/studio" className="hover:text-white transition-colors duration-200">Studio</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}