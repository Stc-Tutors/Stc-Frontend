"use client";

import { useEffect, useState } from "react";
import { GetVideoCoursesForAttachmentAction } from "@/server/video-course";
import { IVideoCourse } from "@/types/video-course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Requirement 2's "Frontend Rendering": a student who has picked a specific
// Subject sees any standalone Video Course an admin optionally cross-sold
// under that exact Subject (see stcbe's IVideoCourse.attachedTaxonomyNodeId)
// as a supplementary resource - never a requirement to enroll, and never
// shown at all if nothing was attached there.
export default function RecommendedVideoCourses({ subjectNodeIds }: { subjectNodeIds: string[] }) {
  const [videoCourses, setVideoCourses] = useState<IVideoCourse[]>([]);

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
        {videoCourses.map((vc) => (
          <a
            key={vc.id}
            href={vc.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex gap-3 border rounded-lg p-3 hover:border-blue-400 transition"
          >
            {vc.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vc.thumbnailUrl} alt={vc.title} className="w-20 h-14 object-cover rounded-md shrink-0" />
            ) : (
              <div className="w-20 h-14 bg-gray-100 rounded-md shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{vc.title}</p>
              <p className="text-xs text-gray-500 truncate">By {vc.instructor}</p>
              <p className="text-xs font-semibold text-green-700 mt-0.5">
                {vc.currency} {vc.price.toLocaleString()}
              </p>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
