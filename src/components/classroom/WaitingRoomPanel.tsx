"use client";

import { useEffect, useState } from "react";
import { Check, Users, X } from "lucide-react";
import { ToastError } from "@/components/ui/custom/toast";
import { useLiveClassSocket } from "@/hooks/use-live-class-socket";
import { AdmitFromWaitingRoomAction, DenyFromWaitingRoomAction, GetWaitingRoomAction } from "@/server/live-class";
import type { WaitingRoomEntry } from "@/types/live-class";

interface WaitingRoomPanelProps {
  lessonId: string;
}

// The tutor's view of who's asking to join. Loads once on mount, then stays
// live via the socket (a new request pushes straight in, no polling) -
// admitting/denying also updates instantly since the backend removes them
// from the queue.
export default function WaitingRoomPanel({ lessonId }: WaitingRoomPanelProps) {
  const [entries, setEntries] = useState<WaitingRoomEntry[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Initial load, with a cancel flag so nothing sets state synchronously
  // inside the effect. Admit/deny below update `entries` directly instead of
  // refetching, so this never needs to run again after mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res] = await GetWaitingRoomAction(lessonId);
      if (!cancelled) setEntries(res?.data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useLiveClassSocket({
    onWaiting: (payload) => {
      if (payload.lessonId !== lessonId) return;
      setEntries((prev) => (prev.some((e) => e.userId === payload.userId) ? prev : [...prev, { ...payload, requestedAt: new Date().toISOString() }]));
    },
  });

  const admit = async (userId: string) => {
    setBusyId(userId);
    const [, err] = await AdmitFromWaitingRoomAction(lessonId, userId);
    setBusyId(null);
    if (err) return ToastError(err);
    setEntries((prev) => prev.filter((e) => e.userId !== userId));
  };

  const deny = async (userId: string) => {
    setBusyId(userId);
    const [, err] = await DenyFromWaitingRoomAction(lessonId, userId);
    setBusyId(null);
    if (err) return ToastError(err);
    setEntries((prev) => prev.filter((e) => e.userId !== userId));
  };

  if (entries.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-3 z-10 w-64 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-lg">
      <p className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-700">
        <Users className="h-3.5 w-3.5" />
        Waiting to join ({entries.length})
      </p>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.userId} className="flex items-center justify-between gap-2 rounded-md px-1 py-1 text-sm">
            <span className="truncate text-gray-800">{entry.fullName}</span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                disabled={busyId === entry.userId}
                onClick={() => admit(entry.userId)}
                title="Let them in"
                className="rounded-full bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={busyId === entry.userId}
                onClick={() => deny(entry.userId)}
                title="Turn away"
                className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
