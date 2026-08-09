"use client";

import { useState } from "react";
import LessonManager from "@/components/lesson-manager";
import { Course, CourseStatus } from "@/types/course";

function statusBadgeClass(status: CourseStatus): string {
  if (status === CourseStatus.PUBLISHED) return "bg-green-100 text-green-700";
  if (status === CourseStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

// Video lesson authoring, decoupled from structural course creation - pick a
// course on the left, manage its Lesson records (recordings/meeting links) on
// the right via LessonManager. Mirrors Stc-SuperAdmin's component of the same
// name.
export default function VideoLessonsPanel({
  serviceType,
  courses,
  initialCourseId,
}: {
  serviceType: string;
  courses: Course[];
  initialCourseId?: string;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    initialCourseId && courses.some((c) => c.id === initialCourseId) ? initialCourseId : undefined
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-1 lg:col-span-1">
        <h2 className="font-semibold text-gray-900 px-2 pb-2">Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 px-2">No courses for {serviceType} yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`w-full text-left px-2 py-2 flex items-center justify-between gap-2 rounded-md ${
                  selectedCourseId === course.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm text-gray-900 truncate">{course.title}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap ${statusBadgeClass(course.status)}`}>
                  {course.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {selectedCourse ? (
          <LessonManager courseId={selectedCourse.id} />
        ) : (
          <p className="text-sm text-gray-500">Select a course to manage its lessons.</p>
        )}
      </div>
    </div>
  );
}
