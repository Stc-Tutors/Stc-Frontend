"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GetClassLogAction } from "@/server/live-class";
import type { ClassLog } from "@/types/live-class";

const ROLE_LABEL: Record<string, string> = { TUTOR: "Tutor", LEARNER: "Learner", OBSERVER: "Observer (hidden)", STAFF: "Staff (joined)" };

const time = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" }) : "-";

// Who was in the class and when: every join, every drop-off and rejoin, and when the room actually closed. Built from the video service's own
// connection events, so it is not something a tutor or family can edit.
export default function ClassLogDialog({ lessonId, title, onClose }: { lessonId: string | null; title?: string; onClose: () => void }) {
  const [result, setResult] = useState<{ lessonId: string; data?: ClassLog; error?: string } | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    (async () => {
      const [res, err] = await GetClassLogAction(lessonId);
      if (cancelled) return;
      setResult(err || !res?.data ? { lessonId, error: err || "No log is available for this class" } : { lessonId, data: res.data });
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const current = result && result.lessonId === lessonId ? result : null;
  const log = current?.data;

  return (
    <Dialog open={!!lessonId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Class log{title ? ` - ${title}` : ""}</DialogTitle>
        </DialogHeader>

        {!current ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-600">
            <Loader2 className="size-4 animate-spin" /> Loading...
          </div>
        ) : current.error ? (
          <p className="py-6 text-sm text-gray-700">{current.error}</p>
        ) : log ? (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <Row label="Scheduled" value={`${time(log.lesson.scheduledDate)} (${log.lesson.durationMinutes} min)`} />
              <Row label="Room opened" value={time(log.roomStartedAt)} />
              <Row label="Tutor connected" value={time(log.tutorClockedInAt)} />
              <Row label="Class ended" value={time(log.endedAt)} />
            </dl>

            <section>
              <h3 className="mb-2 font-medium text-gray-900">Per person</h3>
              {log.people.length === 0 ? (
                <p className="text-gray-600">Nobody connected to the room.</p>
              ) : (
                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-3 py-2">Person</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">First joined</th>
                        <th className="px-3 py-2">Last left</th>
                        <th className="px-3 py-2">Minutes in room</th>
                        <th className="px-3 py-2">Dropped off</th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.people.map((p) => (
                        <tr key={`${p.userId}-${p.role}`} className="border-t">
                          <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                          <td className="px-3 py-2">{ROLE_LABEL[p.role] ?? p.role}</td>
                          <td className="px-3 py-2">{time(p.firstJoinedAt)}</td>
                          <td className="px-3 py-2">{time(p.lastLeftAt)}</td>
                          <td className="px-3 py-2">{p.totalMinutes}</td>
                          <td className="px-3 py-2">{p.sessions > 1 ? `${p.sessions - 1} time${p.sessions - 1 === 1 ? "" : "s"} (rejoined)` : p.dropOffs > 0 ? "left once" : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 font-medium text-gray-900">Every join and leave</h3>
              <ol className="space-y-1 text-xs text-gray-700">
                {log.timeline.map((e, i) => (
                  <li key={i} className="rounded border bg-gray-50 px-3 py-1.5">
                    <span className="font-medium text-gray-900">{e.name}</span> ({ROLE_LABEL[e.role] ?? e.role}) joined {time(e.joinedAt)}
                    {e.leftAt ? `, left ${time(e.leftAt)}` : e.stillConnected ? ", still connected" : ", disconnected (no leave recorded)"} - {e.minutes} min
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-gray-600">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}
