"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Course } from "@/types/course";

export type TargetMode = "course" | "subject" | "students";

export interface TargetValue {
  mode: TargetMode;
  course: string;
  subject: string;
  serviceType: string;
  students: string[];
}

export const EMPTY_TARGET: TargetValue = { mode: "course", course: "", subject: "", serviceType: "", students: [] };

interface Props {
  courses: Course[];
  // Resolves the "specific students" checklist - a tutor's own students
  // (GetMyCourseStudentsAction) or every student an admin can see
  // (ListStudentsForAdminAction), fetched lazily once that mode is picked.
  fetchStudents: () => Promise<{ id: string; fullName: string }[]>;
  // Only needed for an admin-style subject picker (any service, free-text
  // subject) - a tutor instead picks from the subjects of courses they
  // already teach, derived from `courses` with no extra fetch.
  fetchServices?: () => Promise<{ slug: string; serviceName: string }[]>;
  value: TargetValue;
  onChange: (v: TargetValue) => void;
}

// A resource targets exactly one of a Course, a Subject (+ service, visible
// to every paying student across any tutor), or specific Students directly -
// see stcbe's IResource. Reused by the tutor and admin upload forms; the two
// differ only in where the Subject/Students options come from (props).
export default function ResourceTargetPicker({ courses, fetchStudents, fetchServices, value, onChange }: Props) {
  const [students, setStudents] = useState<{ id: string; fullName: string }[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [services, setServices] = useState<{ slug: string; serviceName: string }[]>([]);

  useEffect(() => {
    if (value.mode !== "students") return;
    setIsLoadingStudents(true);
    fetchStudents()
      .then(setStudents)
      .finally(() => setIsLoadingStudents(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mode]);

  useEffect(() => {
    if (value.mode !== "subject" || !fetchServices) return;
    fetchServices().then(setServices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mode]);

  // A tutor's own subject options: distinct (category, serviceType) pairs
  // from courses they already teach - there's nothing to pick beyond what
  // they're already running.
  const tutorSubjectOptions = useMemo(() => {
    const byKey = new Map<string, { category: string; serviceType: string; label: string }>();
    for (const c of courses) {
      const key = `${c.serviceType ?? ""}|${c.category}`;
      if (!byKey.has(key)) byKey.set(key, { category: c.category, serviceType: c.serviceType ?? "", label: c.category });
    }
    return Array.from(byKey.values());
  }, [courses]);

  const setMode = (mode: TargetMode) => onChange({ ...EMPTY_TARGET, mode });

  return (
    <div className="space-y-2">
      <Select value={value.mode} onValueChange={(v) => setMode(v as TargetMode)}>
        <SelectTrigger size="sm" className="w-full sm:w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="course">A course</SelectItem>
          <SelectItem value="subject">A subject (every paying student)</SelectItem>
          <SelectItem value="students">Specific students</SelectItem>
        </SelectContent>
      </Select>

      {value.mode === "course" && (
        <select
          value={value.course}
          onChange={(e) => onChange({ ...value, course: e.target.value })}
          className="border border-gray-300 rounded-md p-2 text-sm w-full"
        >
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      )}

      {value.mode === "subject" && (
        <div className="space-y-2">
          {fetchServices ? (
            <>
              <select
                value={value.serviceType}
                onChange={(e) => onChange({ ...value, serviceType: e.target.value })}
                className="border border-gray-300 rounded-md p-2 text-sm w-full"
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.serviceName}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Subject (e.g. Chemistry)"
                value={value.subject}
                onChange={(e) => onChange({ ...value, subject: e.target.value })}
              />
            </>
          ) : (
            <select
              value={`${value.serviceType}|${value.subject}`}
              onChange={(e) => {
                const [serviceType, subject] = e.target.value.split("|");
                onChange({ ...value, serviceType, subject });
              }}
              className="border border-gray-300 rounded-md p-2 text-sm w-full"
            >
              <option value="|">Select a subject you teach</option>
              {tutorSubjectOptions.map((o) => (
                <option key={`${o.serviceType}|${o.category}`} value={`${o.serviceType}|${o.category}`}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {value.mode === "students" && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Only these students will see this resource.</p>
          {isLoadingStudents ? (
            <p className="text-xs text-gray-400">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-xs text-gray-400">No students found.</p>
          ) : (
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md divide-y">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={value.students.includes(s.id)}
                    onChange={() =>
                      onChange({
                        ...value,
                        students: value.students.includes(s.id)
                          ? value.students.filter((id) => id !== s.id)
                          : [...value.students, s.id],
                      })
                    }
                  />
                  {s.fullName}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
