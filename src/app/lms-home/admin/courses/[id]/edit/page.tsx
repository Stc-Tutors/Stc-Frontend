"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "@/components/forms/course-form";

// Course editing - split out from AdminCourseDetailPage (which stayed pure
// analytics/enrollment-data) now that a course's content fields are edited
// via the same CourseForm every creation entry point uses.
export default function AdminEditCoursePage() {
  const { id } = useParams();

  return (
    <div className="p-6 bg-white shadow rounded-2xl max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Edit Course</h2>
      <CourseForm courseId={id as string} />
    </div>
  );
}
