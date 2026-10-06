"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export interface GroupStudent {
  id: string;
  fullName: string;
}

type CourseEnrollmentRef = string | { student: string | { fullName: string } } | undefined;

// The student a lesson was generated for, or undefined for a shared group class (every enrolled student attends the same
// lesson, so there is no single student).
export function individualStudentName(courseEnrollment: CourseEnrollmentRef): string | undefined {
  if (!courseEnrollment || typeof courseEnrollment === "string") return undefined;
  const student = courseEnrollment.student;
  return !student || typeof student === "string" ? undefined : student.fullName;
}

// "Student" column of the admin session/schedule tables: the student's name, or - for a group class - "Group class (n)" with a
// small (i) button that lists the names of the students in that group.
export function StudentsCell({ courseEnrollment, groupStudents }: { courseEnrollment: CourseEnrollmentRef; groupStudents?: GroupStudent[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const name = individualStudentName(courseEnrollment);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (name) return <>{name}</>;
  // The lesson IS linked to an enrolment, but that student was deleted.
  if (courseEnrollment && typeof courseEnrollment === "object" && !courseEnrollment.student) return <span className="text-gray-500">Removed student</span>;

  const students = groupStudents ?? [];
  // No linked student and no group members: an unlinked lesson (older data), not a group class - say so instead of mislabelling it.
  if (!courseEnrollment && students.length === 0) return <span className="text-amber-700">Not linked to a student</span>;
  return (
    <span ref={ref} className="relative inline-flex items-center gap-1">
      Group class{students.length > 0 ? ` (${students.length})` : ""}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Show the students in this group" aria-expanded={open} className="text-blue-600 hover:text-blue-800">
        <Info className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 block w-56 max-w-[70vw] rounded-md border border-gray-200 bg-white p-3 text-left text-xs text-gray-700 shadow-lg">
          <span className="mb-1 block font-semibold text-gray-900">Students in this group</span>
          {students.length === 0 ? (
            <span className="block text-gray-500">No students are enrolled yet.</span>
          ) : (
            <span className="block max-h-48 space-y-0.5 overflow-y-auto">
              {students.map((s) => (
                <span key={s.id} className="block">{s.fullName}</span>
              ))}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
