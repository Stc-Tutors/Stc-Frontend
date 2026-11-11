"use client";

import { useEffect, useState } from "react";
import { BulkMarkAttendanceAction, ListUnmarkedAttendanceAction, type AttendanceMark, type UnmarkedClass } from "@/server/attendance-review";

const OPTIONS: { value: AttendanceMark; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
  { value: "EXCUSED", label: "Excused" },
];

const keyOf = (lessonId: string, studentId: string) => `${lessonId}:${studentId}`;

// Finished classes with no attendance recorded yet. An admin picks a status per student (or "mark all present" for a class) and saves.
// Saving only adds rows: anything already marked is left alone, and an absent mark here never triggers a penalty.
export default function AttendanceReview() {
  const [classes, setClasses] = useState<UnmarkedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, AttendanceMark>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    ListUnmarkedAttendanceAction().then(([res, err]) => {
      if (!active) return;
      setClasses(res?.data ?? []);
      setError(err);
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const chosen = Object.keys(picked).length;

  const save = async () => {
    setSaving(true);
    setNotice(null);
    const marks = Object.entries(picked).map(([k, status]) => {
      const [lessonId, studentId] = k.split(":");
      return { lessonId, studentId, status };
    });
    const [res, err] = await BulkMarkAttendanceAction(marks);
    setSaving(false);
    if (err || !res?.data) {
      setNotice(err ?? "Could not save the marks.");
      return;
    }
    const { created, skipped } = res.data;
    setNotice(`Saved ${created} mark${created === 1 ? "" : "s"}${skipped ? ` (${skipped} skipped - already marked or not in that class)` : ""}.`);
    setPicked({});
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold">Attendance to review</h2>
          <p className="text-xs text-gray-500">
            Finished classes with no attendance recorded yet. Mark who attended; classes already marked are never changed, and marking someone
            absent here does not apply a penalty.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || chosen === 0}
          className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-40"
        >
          {saving ? "Saving..." : `Save ${chosen} mark${chosen === 1 ? "" : "s"}`}
        </button>
      </div>
      {notice && <p className="text-sm text-gray-700 mb-3">{notice}</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {classes === null ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-gray-500">Every finished class has its attendance recorded.</p>
      ) : (
        <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
          {classes.map((c) => (
            <div key={c.lessonId} className="border rounded-lg p-3">
              <div className="flex justify-between flex-wrap gap-2 mb-2">
                <div>
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">
                    {c.courseTitle}
                    {c.tutorName ? ` - ${c.tutorName}` : ""} - {new Date(c.scheduledDate).toLocaleDateString()}
                    {c.hasReport ? " - tutor report filed" : " - no tutor report"}
                  </p>
                </div>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() =>
                    setPicked((p) => ({
                      ...p,
                      ...Object.fromEntries(c.students.map((s) => [keyOf(c.lessonId, s.id), "PRESENT" as AttendanceMark])),
                    }))
                  }
                >
                  Mark all present
                </button>
              </div>
              <div className="divide-y">
                {c.students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between flex-wrap gap-2 py-1.5 text-sm">
                    <span className="text-gray-800">{s.fullName}</span>
                    <div className="flex gap-1">
                      {OPTIONS.map((o) => {
                        const k = keyOf(c.lessonId, s.id);
                        const on = picked[k] === o.value;
                        return (
                          <button
                            key={o.value}
                            onClick={() =>
                              setPicked((p) => {
                                const next = { ...p };
                                if (on) delete next[k];
                                else next[k] = o.value;
                                return next;
                              })
                            }
                            className={`px-2 py-1 rounded text-xs border ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
