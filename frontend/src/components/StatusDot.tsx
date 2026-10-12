export default function StatusDot({ up }: { up: boolean | null }) {
  const color = up === null ? "bg-neutral-500 animate-pulse" : up ? "bg-emerald-400" : "bg-rose-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden="true" />;
}
