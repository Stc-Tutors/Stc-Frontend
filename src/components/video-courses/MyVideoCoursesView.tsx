"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { GetVideoCourseCatalogAction } from "@/server/video-course";
import { CatalogVideoCourse } from "@/types/video-course";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { useVideoCourseUnlock } from "@/components/video-courses/use-video-course-unlock";

function Thumb({ course }: { course: CatalogVideoCourse }) {
  return course.thumbnailUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={course.thumbnailUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md shrink-0" />
  ) : (
    <div className="w-24 h-16 bg-gray-100 rounded-md shrink-0" />
  );
}

// Video courses for a student or parent, shared by both areas (the backend
// scopes everything to the logged-in family): the ones they can watch now
// (unlocked or free), and the paid ones they can unlock here. Recommended
// courses are also offered while choosing subjects during enrollment.
export default function MyVideoCoursesView() {
  const { user } = useUser();
  const { busyId, unlock } = useVideoCourseUnlock();
  const [courses, setCourses] = useState<CatalogVideoCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [res, error] = await GetVideoCourseCatalogAction();
    if (error) ToastError(error);
    setCourses(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const base = `/lms-home/${(user?.role ?? "student").toLowerCase()}/video-courses`;
  const watchable = courses.filter((c) => c.unlocked || c.isFree);
  const locked = courses.filter((c) => !c.unlocked && !c.isFree);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PlayCircle className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Video Courses</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : courses.length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">No video courses are available yet.</p>
        </div>
      ) : (
        <>
          <section className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Ready to watch</h2>
            {watchable.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing unlocked yet - unlock a course below.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {watchable.map((vc) => (
                  <Link
                    key={vc.id}
                    href={`${base}/${vc.id}`}
                    className="flex gap-3 border rounded-lg p-3 hover:border-blue-400 transition"
                  >
                    <Thumb course={vc} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{vc.title}</p>
                      <p className="text-xs text-gray-500 truncate">By {vc.instructor}</p>
                      <p className="text-xs font-medium text-blue-600 mt-1">{vc.isFree ? "Free - watch" : "Watch"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {locked.length > 0 && (
            <section className="bg-white p-4 rounded-lg shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Available to unlock</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locked.map((vc) => (
                  <div key={vc.id} className="flex gap-3 border rounded-lg p-3">
                    <Thumb course={vc} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{vc.title}</p>
                      <p className="text-xs text-gray-500 truncate">By {vc.instructor}</p>
                      <p className="text-xs font-semibold text-green-700 mt-0.5">
                        {vc.currency} {vc.price.toLocaleString()}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="mt-1.5 h-7 text-xs"
                        disabled={busyId === vc.id}
                        onClick={() => unlock(vc.id, load)}
                      >
                        {busyId === vc.id ? "Opening payment..." : "Unlock"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
