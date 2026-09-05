"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetTutorRatingSummaryAction } from "@/server/session-feedback";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import { CourseTutor } from "@/types/course";

interface TutorRatingsPanelProps {
  studentId?: string;
}

interface Row {
  tutorId: string;
  tutorName: string;
  courseTitle: string;
  averageRating: number;
  totalRatings: number;
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= rounded ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

export default function TutorRatingsPanel({ studentId }: TutorRatingsPanelProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const [res] = await GetStudentCoursesAction(studentId);
      const active = (res?.data ?? []).filter((e) => e.status === CourseEnrollmentStatus.ACTIVE);

      const withTutor = active
        .map((e) => {
          if (typeof e.course === "string") return null;
          const tutor = e.course.tutor as CourseTutor | undefined;
          if (!tutor) return null;
          return { tutorId: tutor.id, tutorName: `${tutor.firstName} ${tutor.lastName}`, courseTitle: e.course.title };
        })
        .filter((v): v is { tutorId: string; tutorName: string; courseTitle: string } => !!v);

      const summaries = await Promise.all(withTutor.map((w) => GetTutorRatingSummaryAction(w.tutorId)));
      setRows(
        withTutor.map((w, i) => ({
          ...w,
          averageRating: summaries[i][0]?.data?.averageRating ?? 0,
          totalRatings: summaries[i][0]?.data?.totalRatings ?? 0,
        }))
      );
      setIsLoading(false);
    };
    load();
  }, [studentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Performance</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Ratings other families have left for this child's current tutors</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view their tutors' ratings.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No active tutors yet.</p>
        ) : (
          <div className="divide-y">
            {rows.map((r) => (
              <div key={`${r.tutorId}-${r.courseTitle}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.tutorName}</p>
                  <p className="text-xs text-gray-500">{r.courseTitle}</p>
                </div>
                <div className="text-right">
                  <Stars rating={r.averageRating} />
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.totalRatings > 0 ? `${r.averageRating.toFixed(1)} (${r.totalRatings} reviews)` : "No reviews yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
