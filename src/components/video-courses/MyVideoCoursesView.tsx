"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { GetMyVideoCoursesAction } from "@/server/video-course";
import { IVideoCourse } from "@/types/video-course";
import { useUser } from "@/contexts/user-context";
import { ToastError } from "@/components/ui/custom/toast";

// The video courses this student/parent's family has unlocked. Shared by the
// student and parent areas - the backend scopes /video-courses/mine to the
// logged-in family. Unlocking itself happens from the "Recommended Video
// Courses" panel while enrolling in a subject.
export default function MyVideoCoursesView() {
  const { user } = useUser();
  const [courses, setCourses] = useState<IVideoCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [res, error] = await GetMyVideoCoursesAction();
      if (error) ToastError(error);
      setCourses(res?.data ?? []);
      setIsLoading(false);
    })();
  }, []);

  const base = `/lms-home/${(user?.role ?? "student").toLowerCase()}/video-courses`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PlayCircle className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Video Courses</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t unlocked any video courses yet. Recommended ones appear while you choose subjects during
            enrollment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((vc) => (
              <Link
                key={vc.id}
                href={`${base}/${vc.id}`}
                className="flex gap-3 border rounded-lg p-3 hover:border-blue-400 transition"
              >
                {vc.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vc.thumbnailUrl} alt={vc.title} className="w-24 h-16 object-cover rounded-md shrink-0" />
                ) : (
                  <div className="w-24 h-16 bg-gray-100 rounded-md shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{vc.title}</p>
                  <p className="text-xs text-gray-500 truncate">By {vc.instructor}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
