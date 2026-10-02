"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WEEKDAYS_ABBREVIATED } from "@/constants/weekdays";
import { CreateScheduleProposalAction, GetPendingScheduleProposalsAction } from "@/server/schedule-proposal";
import { scheduleTimeFrom24Hour, scheduleTimeTo24Hour } from "@/lib/datetime";
import { ISchedule as Schedule, Student } from "@/types/student";
import { ScheduleProposal } from "@/types/schedule-proposal";

// "Monday" and "Mon" both appear in saved schedules; the editor works in the short form.
const shortDay = (d: string) => d.trim().slice(0, 3).replace(/^./, (c) => c.toUpperCase()).replace(/(?<=.)./g, (c) => c.toLowerCase());

const blankRow = (subject = ""): Schedule => ({ subject, days: [], time: "", duration: 60 });

// An admin edits a student's WHOLE class schedule (every subject at once). Nothing changes until the parent - or the student,
// if they registered themselves - accepts it; on acceptance any upcoming classes with a tutor are moved onto the new days and
// times. A newer proposal replaces one still waiting.
export default function ScheduleEditor({ student, onChanged }: { student: Student; onChanged: () => void }) {
  const subjects = student.serviceDetails?.selectedSubjects ?? [];
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Schedule[]>([]);
  const [saving, setSaving] = useState(false);
  const [waiting, setWaiting] = useState<ScheduleProposal[]>([]);

  const loadWaiting = useCallback(async () => {
    const [res] = await GetPendingScheduleProposalsAction(student.id);
    setWaiting(res?.data ?? []);
  }, [student.id]);

  useEffect(() => {
    loadWaiting();
  }, [loadWaiting]);

  const startEditing = () => {
    const current = (student.schedule ?? []).map((s) => ({ ...s, days: s.days.map(shortDay) }));
    setRows(current.length > 0 ? current : [blankRow(subjects[0] ?? "")]);
    setOpen(true);
  };

  const update = (i: number, patch: Partial<Schedule>) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const toggleDay = (i: number, day: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, days: r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day] } : r)));

  const send = async () => {
    const bad = rows.find((r) => !r.subject.trim() || r.days.length === 0 || !r.time || !(r.duration > 0));
    if (bad) {
      ToastError("Every row needs a subject, at least one day, a time and a duration");
      return;
    }
    setSaving(true);
    const [, error] = await CreateScheduleProposalAction(student.id, rows.map((r) => ({ ...r, subject: r.subject.trim(), duration: Number(r.duration) })));
    setSaving(false);
    if (error) {
      ToastError(error);
      return;
    }
    ToastSuccess("Sent - the schedule changes once the family accepts it");
    setOpen(false);
    loadWaiting();
    onChanged();
  };

  // Only a student with their own day/time schedule has anything to edit.
  if (student.serviceDetails?.classFormat !== "one-on-one" && !(student.schedule ?? []).length) return null;

  return (
    <Card className="py-5">
      <CardContent className="px-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Edit class schedule</h3>
          {!open && (
            <Button size="sm" variant="outline" onClick={startEditing}>
              Edit schedule
            </Button>
          )}
        </div>

        {waiting.length > 0 && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 space-y-1">
            <Badge variant="secondary">Waiting for the family to accept</Badge>
            {waiting.map((p) => (
              <p key={p.id}>{p.proposedSchedule.map((s) => `${s.subject}: ${s.days.join(", ")} at ${s.time} (${s.duration} min)`).join(" | ")}</p>
            ))}
            <p className="text-blue-700">Sending another proposal replaces this one.</p>
          </div>
        )}

        {!open && waiting.length === 0 && (
          <p className="text-xs text-gray-500">
            Change days, times or durations for any subject. The parent (or the student, if they registered themselves) has to accept
            the change before it takes effect.
          </p>
        )}

        {open && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            {rows.map((row, i) => (
              <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  {subjects.length > 0 ? (
                    <select
                      value={row.subject}
                      onChange={(e) => update(i, { subject: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    >
                      <option value="">Subject...</option>
                      {Array.from(new Set([...subjects, row.subject].filter(Boolean))).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input placeholder="Subject" value={row.subject} onChange={(e) => update(i, { subject: e.target.value })} />
                  )}
                  {rows.length > 1 && (
                    <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-red-500 shrink-0">
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS_ABBREVIATED.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(i, d)}
                      className={`px-2 py-1 rounded-md text-xs border ${row.days.includes(d) ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="time" value={scheduleTimeTo24Hour(row.time)} onChange={(e) => update(i, { time: scheduleTimeFrom24Hour(e.target.value) })} />
                  <Input type="number" min="1" max="600" placeholder="Duration (minutes)" value={row.duration} onChange={(e) => update(i, { duration: Number(e.target.value) })} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setRows((prev) => [...prev, blankRow(subjects[0] ?? "")])} className="text-xs text-blue-600 hover:underline">
              + Add another class slot
            </button>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={send} disabled={saving}>
                {saving ? "Sending..." : "Send for the family to accept"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
