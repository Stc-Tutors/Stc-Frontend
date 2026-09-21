import { Loader2 } from "lucide-react";

// What a page or panel shows while its data is on the way. It used to be a bare "Loading..." line that read as a
// blank page and was invisible to screen readers; this spins, announces itself politely, and reserves some height
// so the content doesn't jump when it arrives.
export default function InlineLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-40 items-center justify-center gap-2 py-10 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}&hellip;</span>
    </div>
  );
}
