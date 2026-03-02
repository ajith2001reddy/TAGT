import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { CreateRequestPayload } from "@/services/resident.service";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

type Props = {
  form: CreateRequestPayload;
  onChange: (next: CreateRequestPayload) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  error: string | null;
};

export function RequestForm({ form, onChange, onSubmit, submitting, error }: Props) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 space-y-3 border-b border-white/[0.06] pb-5">
      <ErrorMessage message={error} />
      <input
        placeholder="Title — e.g. Leaking pipe in bathroom"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 transition focus:border-violet-500/50 focus:outline-none"
        value={form.title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
      />
      <textarea
        placeholder="Describe the issue in detail..."
        rows={3}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 transition focus:border-violet-500/50 focus:outline-none"
        value={form.description}
        onChange={(event) => onChange({ ...form, description: event.target.value })}
      />
      <div className="flex items-center gap-3">
        <select
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/60 transition focus:border-violet-500/50 focus:outline-none"
          value={form.priority}
          onChange={(event) => onChange({ ...form, priority: event.target.value })}
        >
          {PRIORITIES.map((value) => (
            <option key={value} value={value} className="bg-zinc-900 capitalize">
              {value}
            </option>
          ))}
        </select>
        <Button type="submit" className="flex-1" loading={submitting}>
          Submit Request
        </Button>
      </div>
    </form>
  );
}
