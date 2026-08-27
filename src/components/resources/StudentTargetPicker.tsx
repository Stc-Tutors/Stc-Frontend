"use client";

import { useEffect, useState } from "react";
import { GetCourseStudentsAction } from "@/server/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Student } from "@/types/student";

interface Props {
  courseId: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

// Lets a tutor/admin narrow an upload to specific students enrolled in the
// selected course instead of the whole class - see stcbe's
// IResource.students. Leaving every box unchecked targets everyone enrolled
// (the pre-existing default behavior).
export default function StudentTargetPicker({ courseId, value, onChange }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    GetCourseStudentsAction(courseId).then(([res]) => {
      const enrollments = (res?.data ?? []) as CourseEnrollment[];
      setStudents(
        enrollments
          .map((e) => (typeof e.student === "string" ? null : e.student))
          .filter((s): s is Student => !!s)
      );
      setIsLoading(false);
    });
  }, [courseId]);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  if (isLoading) return <p className="text-xs text-gray-400">Loading students...</p>;
  if (students.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">
        Target specific students (optional - leave unchecked to send to everyone enrolled)
      </p>
      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md divide-y">
        {students.map((s) => (
          <label
            key={s.id}
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50"
          >
            <input type="checkbox" checked={value.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.fullName}
          </label>
        ))}
      </div>
    </div>
  );
}
