export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-white/70">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
