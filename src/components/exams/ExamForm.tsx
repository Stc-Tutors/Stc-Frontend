"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GetExamCoursesAction } from "@/server/exam";
import { ExamAudienceType, ExamCourseOption, ExamLaunchMode, PROCTORING_OPTIONS } from "@/types/exam";

export interface ExamFormValues {
  title: string;
  description: string;
  expectedParticipantCount: number;
  durationMinutes: number;
  launchMode: ExamLaunchMode;
  audienceType: ExamAudienceType;
  courseIds: string[];
  proctoring: Record<string, boolean>;
  acceptFeatureAddon: boolean;
}

export const EMPTY_EXAM_FORM: ExamFormValues = {
  title: "",
  description: "",
  expectedParticipantCount: 10,
  durationMinutes: 30,
  launchMode: ExamLaunchMode.NEW_TAB,
  audienceType: ExamAudienceType.ASSIGNED,
  courseIds: [],
  proctoring: {},
  acceptFeatureAddon: false,
};

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

// Shared by "New exam" and the exam's own settings panel. `isNew` additionally asks for the number of paid places (fixed once the
// test exists on STC Exams - more are bought on their dashboard) and the add-on charge confirmation.
export default function ExamForm({
  initial,
  isNew,
  submitLabel,
  onSubmit,
}: {
  initial: ExamFormValues;
  isNew: boolean;
  submitLabel: string;
  onSubmit: (values: ExamFormValues) => Promise<unknown>;
}) {
  const [values, setValues] = useState<ExamFormValues>(initial);
  const [courses, setCourses] = useState<ExamCourseOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [res] = await GetExamCoursesAction();
      setCourses(res?.data ?? []);
    })();
  }, []);

  const set = <K extends keyof ExamFormValues>(key: K, value: ExamFormValues[K]) => setValues((v) => ({ ...v, [key]: value }));
  const anyProctoring = Object.values(values.proctoring).some(Boolean);

  const toggleCourse = (id: string) =>
    set("courseIds", values.courseIds.includes(id) ? values.courseIds.filter((c) => c !== id) : [...values.courseIds, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(values);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <input className={field} value={values.title} onChange={(e) => set("title", e.target.value)} required maxLength={200} />
      </div>
      <div>
        <label className="text-sm font-medium">Description (optional)</label>
        <textarea className={field} rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isNew && (
          <div>
            <label className="text-sm font-medium">Places to reserve</label>
            <input
              type="number"
              min={1}
              className={field}
              value={values.expectedParticipantCount}
              onChange={(e) => set("expectedParticipantCount", Number(e.target.value))}
              required
            />
            <p className="text-xs text-gray-500 mt-1">How many people will sit it. Each uses one paid place on STC Exams.</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            max={1440}
            className={field}
            value={values.durationMinutes}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">How learners open it</label>
          <select className={field} value={values.launchMode} onChange={(e) => set("launchMode", e.target.value as ExamLaunchMode)}>
            <option value={ExamLaunchMode.NEW_TAB}>New tab (most reliable for camera / full screen)</option>
            <option value={ExamLaunchMode.EMBEDDED}>Inside this site (embedded)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Who sits it</label>
          <select className={field} value={values.audienceType} onChange={(e) => set("audienceType", e.target.value as ExamAudienceType)}>
            <option value={ExamAudienceType.ASSIGNED}>People I assign</option>
            <option value={ExamAudienceType.COURSE}>Everyone enrolled in chosen courses</option>
          </select>
        </div>
      </div>

      {values.audienceType === ExamAudienceType.COURSE && (
        <div>
          <label className="text-sm font-medium">Courses</label>
          <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
            {courses.length === 0 && <p className="text-xs text-gray-500">No courses found.</p>}
            {courses.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={values.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                {c.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Exam monitoring (proctoring)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
          {PROCTORING_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.proctoring[opt.key] === true}
                onChange={(e) => set("proctoring", { ...values.proctoring, [opt.key]: e.target.checked })}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {values.launchMode === ExamLaunchMode.EMBEDDED && (
          <p className="text-xs text-amber-700 mt-2">
            Embedded only works once STC Exams has approved this site&apos;s address for embedding (their &quot;Embedded in your platform&quot; feature). Until then
            the test shows a blank frame - learners can still press &quot;Open in a new tab&quot;, but &quot;New tab&quot; here is the safe choice.
          </p>
        )}
        {values.launchMode === ExamLaunchMode.EMBEDDED && anyProctoring && (
          <p className="text-xs text-amber-700 mt-2">
            Browsers are stricter about camera, microphone and full screen inside a frame. For monitored tests, opening in a new tab
            is more reliable.
          </p>
        )}
        {isNew && anyProctoring && (
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" checked={values.acceptFeatureAddon} onChange={(e) => set("acceptFeatureAddon", e.target.checked)} />
            I accept any extra per-person charge STC Exams applies to monitoring features not in our licence
          </label>
        )}
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
