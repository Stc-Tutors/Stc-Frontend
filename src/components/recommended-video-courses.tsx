"use client";

import { useEffect, useState } from "react";
import { GetVideoCoursesForAttachmentAction } from "@/server/video-course";
import { IVideoCourse } from "@/types/video-course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVideoCourseUnlock } from "@/components/video-courses/use-video-course-unlock";

// Requirement 2's "Frontend Rendering": a student who has picked a specific
// Subject sees any standalone Video Course an admin optionally cross-sold
// under that exact Subject (see stcbe's IVideoCourse.attachedTaxonomyNodeId)
// as a supplementary resource - never a requirement to enroll, and never
// shown at all if nothing was attached there.
export default function RecommendedVideoCourses({ subjectNodeIds }: { subjectNodeIds: string[] }) {
  const [videoCourses, setVideoCourses] = useState<IVideoCourse[]>([]);
  const { canLearn, role, unlockedIds, busyId, unlock } = useVideoCourseUnlock();

  useEffect(() => {
    if (subjectNodeIds.length === 0) {
      setVideoCourses([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        subjectNodeIds.map((id) => GetVideoCoursesForAttachmentAction({ attachedTaxonomyNodeId: id }))
      );
      if (cancelled) return;
      const byId = new Map<string, IVideoCourse>();
      for (const [res] of results) {
        for (const vc of res?.data ?? []) byId.set(vc.id, vc);
      }
      setVideoCourses(Array.from(byId.values()));
    })();
    return () => {
      cancelled = true;
    };
  }, [subjectNodeIds]);

  if (videoCourses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Video Courses</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {videoCourses.map((vc) => {
          const isFree = !(vc.price > 0);
          const isUnlocked = isFree || unlockedIds.has(vc.id);
          const watchHref = `/lms-home/${(role ?? "student").toLowerCase()}/video-courses/${vc.id}`;
          return (
            <div key={vc.id} className="flex gap-3 border rounded-lg p-3">
              {vc.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vc.thumbnailUrl} alt={vc.title} className="w-20 h-14 object-cover rounded-md shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-gray-100 rounded-md shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{vc.title}</p>
                <p className="text-xs text-gray-500 truncate">By {vc.instructor}</p>
                <p className="text-xs font-semibold text-green-700 mt-0.5">
                  {isFree ? "Free" : `${vc.currency} ${vc.price.toLocaleString()}`}
                </p>
                {canLearn ? (
                  isUnlocked ? (
                    <Link href={watchHref} className="inline-block mt-1.5 text-xs font-medium text-blue-600 hover:underline">
                      Watch
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-1.5 h-7 text-xs"
                      disabled={busyId === vc.id}
                      onClick={() => unlock(vc.id)}
                    >
                      {busyId === vc.id ? "Opening payment..." : "Unlock"}
                    </Button>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
