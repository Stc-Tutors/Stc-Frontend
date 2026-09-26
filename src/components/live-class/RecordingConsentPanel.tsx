"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { formatDate } from "@/lib/datetime";
import { GetMyRecordingConsentsAction, SetRecordingConsentAction } from "@/server/live-class";
import type { ChildConsent } from "@/types/live-class";

// Recording is off by default. A class is only ever recorded when a school
// admin turns it on AND every child in it has a parent's consent - which is
// what this screen records. Withdrawing is immediate: upcoming classes stop
// being recorded.
export default function RecordingConsentPanel() {
  const { data, error, isLoading, refresh } = useCachedQuery<ChildConsent[]>(
    "recording-consents",
    async () => (await unwrap(GetMyRecordingConsentsAction())) ?? [],
    { ttl: 30_000, tags: ["consent"] }
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (child: ChildConsent) => {
    setBusyId(child.studentId);
    const [, err] = await SetRecordingConsentAction(child.studentId, !child.granted);
    setBusyId(null);
    if (err) {
      ToastError(err);
      return;
    }
    ToastSuccess(child.granted ? "Consent withdrawn. Upcoming classes won't be recorded." : "Thank you - consent recorded.");
    await refresh();
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error && !data) return <p className="text-sm text-red-600">Couldn&apos;t load: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <Video className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">About class recordings</p>
          <p>
            Some classes may be recorded so you and your child can watch them again. Recordings are stored privately,
            only visible to your family, the tutor and authorised school staff, and deleted automatically after a set
            time. You&apos;ll be told before any class is recorded, and a &quot;Recording&quot; badge shows in the room.
          </p>
        </div>
      </div>

      {(data ?? []).length === 0 ? (
        <p className="text-sm text-gray-500">No children on your account yet.</p>
      ) : (
        (data ?? []).map((child) => (
          <Card key={child.studentId}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
              <div>
                <p className="font-medium">{child.fullName}</p>
                <p className="text-xs text-gray-500">
                  {child.granted
                    ? `You allowed recording${child.grantedAt ? ` on ${formatDate(child.grantedAt)}` : ""}`
                    : "Recording not allowed - this child's classes won't be recorded"}
                </p>
              </div>
              <Button
                size="sm"
                variant={child.granted ? "outline" : "default"}
                disabled={busyId === child.studentId}
                onClick={() => toggle(child)}
              >
                {busyId === child.studentId ? "Saving..." : child.granted ? "Withdraw consent" : "Allow recording"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
