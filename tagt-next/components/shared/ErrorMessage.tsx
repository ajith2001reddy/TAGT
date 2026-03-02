export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-400">{message}</p>;
}
