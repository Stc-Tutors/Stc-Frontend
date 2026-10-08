"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";
import { Shuffle, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { EndBreakoutAction, GetBreakoutStatusAction, StartBreakoutAction } from "@/server/live-class";
import type { BreakoutStatus } from "@/types/live-class";

interface BreakoutPanelProps {
  lessonId: string;
  // Triggers the room switch in the parent (LiveKitClassroom owns the actual
  // LiveKit connection) - this panel only decides WHICH room to visit.
  onVisit: (roomId: string, label: string) => void;
}

// The tutor's breakout-room control: start (auto-split or pick your own
// groups), see who's where, drop in on a group, and end the session. Only
// rendered while the tutor is in the main room (see LiveKitClassroom) -
// visiting a group is its own, much simpler, top-level "Back to main room"
// button, not this panel.
export default function BreakoutPanel({ lessonId, onVisit }: BreakoutPanelProps) {
  const [status, setStatus] = useState<BreakoutStatus | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [groupCount, setGroupCount] = useState(2);
  const [recordBreakouts, setRecordBreakouts] = useState(false);
  // participantId -> group number (1-based), 0 = unassigned, for manual mode.
  const [manualGroups, setManualGroups] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const learners = useMemo(
    () => participants.filter((p) => p.identity !== localParticipant.identity && !p.isLocal),
    [participants, localParticipant.identity]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res] = await GetBreakoutStatusAction(lessonId);
      if (!cancelled) setStatus(res?.data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const startBreakout = async () => {
    setBusy(true);
    const opts =
      mode === "auto"
        ? { groupCount, recordBreakouts }
        : {
            assignments: Object.entries(
              learners.reduce<Record<number, string[]>>((acc, p) => {
                const g = manualGroups[p.identity];
                if (g) (acc[g] ??= []).push(p.identity);
                return acc;
              }, {})
            ).reduce<Record<string, string[]>>((acc, [g, ids]) => {
              acc[`Group ${g}`] = ids;
              return acc;
            }, {}),
            recordBreakouts,
          };
    const [res, err] = await StartBreakoutAction(lessonId, opts);
    setBusy(false);
    if (err || !res?.data) return ToastError(err || "Couldn't start breakout rooms");
    setStatus(res.data);
    setFormOpen(false);
  };

  const endBreakout = async () => {
    setBusy(true);
    const [, err] = await EndBreakoutAction(lessonId);
    setBusy(false);
    if (err) return ToastError(err);
    setStatus((prev) => (prev ? { ...prev, active: false } : prev));
  };

  const manualGroupNumbers = Array.from({ length: groupCount }, (_, i) => i + 1);

  return (
    <div className="absolute bottom-20 right-3 z-10 w-72 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-lg">
      {status?.active ? (
        <>
          <p className="mb-1.5 flex items-center justify-between px-1 text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Breakout rooms ({status.rooms.length})
            </span>
            <button type="button" disabled={busy} onClick={endBreakout} className="text-red-600 hover:underline disabled:opacity-50">
              End all
            </button>
          </p>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {status.rooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between gap-2 rounded-md px-1 py-1 text-sm">
                <span className="truncate text-gray-800">
                  {room.label}
                  <span className="ml-1 text-xs text-gray-400">({room.participantIds.length})</span>
                </span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => onVisit(room.id, room.label)}>
                  Visit
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : formOpen ? (
        <>
          <p className="mb-1.5 flex items-center justify-between px-1 text-xs font-semibold text-gray-700">
            Start breakout rooms
            <button type="button" onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </p>
          <div className="space-y-2 px-1 text-sm">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex-1 rounded-md px-2 py-1 text-xs ${mode === "auto" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Random split
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 rounded-md px-2 py-1 text-xs ${mode === "manual" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Pick groups
              </button>
            </div>

            {mode === "auto" ? (
              <label className="flex items-center justify-between text-xs text-gray-600">
                Number of groups
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={groupCount}
                  onChange={(e) => setGroupCount(Math.min(20, Math.max(2, Number(e.target.value) || 2)))}
                  className="w-16 rounded-md border border-gray-300 px-2 py-0.5 text-right"
                />
              </label>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {learners.length === 0 && <p className="text-xs text-gray-400">Nobody else is in the class yet.</p>}
                {learners.map((p) => (
                  <div key={p.identity} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-gray-700">{p.name || "A participant"}</span>
                    <select
                      value={manualGroups[p.identity] ?? 0}
                      onChange={(e) => setManualGroups((prev) => ({ ...prev, [p.identity]: Number(e.target.value) }))}
                      className="rounded-md border border-gray-300 px-1 py-0.5"
                    >
                      <option value={0}>Unassigned</option>
                      {manualGroupNumbers.map((g) => (
                        <option key={g} value={g}>
                          Group {g}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <label className="flex items-center justify-between pt-1 text-xs text-gray-600">
                  Number of groups
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={groupCount}
                    onChange={(e) => setGroupCount(Math.min(20, Math.max(2, Number(e.target.value) || 2)))}
                    className="w-16 rounded-md border border-gray-300 px-2 py-0.5 text-right"
                  />
                </label>
              </div>
            )}

            <label className="flex items-center gap-1.5 text-xs text-gray-600">
              <input type="checkbox" checked={recordBreakouts} onChange={(e) => setRecordBreakouts(e.target.checked)} />
              Record each breakout room
            </label>

            <Button size="sm" className="w-full" disabled={busy} onClick={startBreakout}>
              {busy ? "Starting..." : "Start"}
            </Button>
          </div>
        </>
      ) : (
        <Button size="sm" variant="outline" className="w-full" onClick={() => setFormOpen(true)}>
          <Shuffle className="mr-2 h-3.5 w-3.5" />
          Breakout rooms
        </Button>
      )}
    </div>
  );
}
