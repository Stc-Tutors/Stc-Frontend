"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GetCoursesAction } from "@/server/course";
import { Course } from "@/types/course";
import VideoLessonsPanel from "@/components/video-lessons-panel";

// One course's video lessons, reached from the Video Courses list. Same panel the
// Service Catalog workspace shows, but on its own page so an admin who may manage
// video courses never needs (or gets) access to the service catalog itself.
function LessonsContent() {
  const params = useSearchParams();
  const serviceType = params.get("service") ?? "";
  const courseId = params.get("course") ?? undefined;
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    if (!serviceType) return;
    GetCoursesAction({ serviceType }).then(([res]) => setCourses(res?.data ?? []));
  }, [serviceType]);

  if (!serviceType) return <p className="text-sm text-gray-500 py-4">No course selected.</p>;
  if (courses === null) return <p className="text-sm text-gray-500 py-4">Loading...</p>;

  return <VideoLessonsPanel serviceType={serviceType} courses={courses} initialCourseId={courseId} />;
}

export default function VideoCourseLessonsPage() {
  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <Link href="/lms-home/admin/video-courses" className="text-sm text-blue-600 hover:underline">
        &larr; Back to video courses
      </Link>
      <h1 className="text-2xl font-bold">Video Lessons</h1>
      <Suspense fallback={<p className="text-sm text-gray-500 py-4">Loading...</p>}>
        <LessonsContent />
      </Suspense>
    </div>
  );
}
