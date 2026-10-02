"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateAllocationRecordsAction, GetAllocationStatusAction, type AllocationStatus } from "@/server/enrollment-allocation";

// Answers "why can't I allocate this student?" - each condition the allocation screens depend on, ticked or not, and what to do next.
export default function AllocationStatusCard({ studentId, onChanged }: { studentId: string; onChanged: () => void }) {
  const [status, setStatus] = useState<AllocationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [res, err] = await GetAllocationStatusAction(studentId);
    setStatus(res?.data ?? null);
    setError(err);
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const createRecords = async () => {
    setBusy(true);
    const [res, err] = await CreateAllocationRecordsAction(studentId);
    setBusy(false);
    if (err) {
      ToastError(err);
      return;
    }
    setStatus(res?.data ?? null);
    ToastSuccess("Allocation records created");
    onChanged();
  };

  if (error) return null;
  if (!status) return null;

  return (
    <Card className="py-5">
      <CardContent className="px-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Allocation status</h3>
        <ul className="space-y-1.5">
          {status.checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-sm">
              <span className={c.ok ? "text-emerald-600" : "text-amber-600"} aria-hidden>
                {c.ok ? "✓" : "✗"}
              </span>
              <span>
                <span className="font-medium text-gray-800">{c.label}</span>
                <span className="block text-xs text-gray-500">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <span className="font-medium">Next: </span>
          {status.nextStep}
        </p>
        {status.canCreateRecords && (
          <Button size="sm" onClick={createRecords} disabled={busy}>
            {busy ? "Creating..." : "Create allocation records"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
