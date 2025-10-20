export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-10">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-neutral-500">
        <p>
          © {new Date().getFullYear()} <span className="text-neutral-300">Reelixx</span>. Built with ❤️ by Mohamed Ezzarhouni.
        </p>
      </div>
    </footer>
  );
}