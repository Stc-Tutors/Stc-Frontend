"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClosedIntake, GetIntakeStatusAction, IntakeTarget } from "@/server/intake";

// The message for the first of `targets` a Super Admin has closed to this visitor, or null while loading / when all are open.
// `closedAll` makes it need every target closed (e.g. a page that serves both parents and students).
export function useIntakeClosed(targets: IntakeTarget[], closedAll = false): string | null {
  const [closed, setClosed] = useState<ClosedIntake[]>([]);

  useEffect(() => {
    GetIntakeStatusAction().then(([res]) => setClosed(res?.data ?? []));
  }, []);

  const hits = targets.map((t) => closed.find((c) => c.target === t));
  if (closedAll ? hits.some((h) => !h) : !hits.some(Boolean)) return null;
  return hits.find(Boolean)?.message ?? null;
}

// A plain notice with nothing to change or retry - deliberately no mention of where the person is or any other way in.
export function IntakeClosedDialog({
  message,
  onClose,
  backHref = "/",
}: {
  message: string;
  onClose?: () => void;
  backHref?: string;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-md" showCloseButton={!!onClose}>
        <DialogHeader>
          <DialogTitle>Currently closed</DialogTitle>
          <DialogDescription className="pt-2 text-base text-gray-700">{message}</DialogDescription>
        </DialogHeader>
        {onClose ? (
          <button onClick={onClose} className="w-full bg-[#0a7ac2] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">
            OK
          </button>
        ) : (
          <Link href={backHref} className="block w-full bg-[#0a7ac2] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition text-center">
            Back to home
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Wraps a whole page: while the intake is closed for this visitor the form never renders, only the notice.
export function IntakeGate({
  targets,
  closedAll,
  backHref,
  children,
}: {
  targets: IntakeTarget[];
  closedAll?: boolean;
  backHref?: string;
  children: React.ReactNode;
}) {
  const message = useIntakeClosed(targets, closedAll);
  if (message) return <IntakeClosedDialog message={message} backHref={backHref} />;
  return <>{children}</>;
}
