
export default function StatusDot({ up }: { up: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        up ? "bg-emerald-400" : "bg-red-500"
      }`}
      aria-label={up ? "Online" : "Offline"}
      title={up ? "Backend online" : "Backend offline"}
    />
  );
}