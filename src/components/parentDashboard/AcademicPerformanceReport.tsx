"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetMySubmissionsAction } from "@/server/submission";
import { Submission, SubmissionStatus } from "@/types/submission";
import { Assignment } from "@/types/assignment";

interface AcademicPerformanceReportProps {
  studentId?: string;
}

export default function AcademicPerformanceReport({ studentId }: AcademicPerformanceReportProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMySubmissionsAction();
      setSubmissions(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const graded = submissions.filter(
    (s) => s.status === SubmissionStatus.GRADED && (typeof s.student === "string" ? s.student : s.student.id) === studentId
  );

  const average =
    graded.length === 0
      ? null
      : Math.round(
          (graded.reduce((sum, s) => {
            const assignment = s.assignment as Assignment;
            return sum + (s.score ?? 0) / (assignment.maxScore || 1);
          }, 0) /
            graded.length) *
            100
        );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Performance Report</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Graded assignments for the selected child</p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view their academic performance.</p>
        ) : graded.length === 0 ? (
          <p className="text-sm text-gray-500">No graded assignments yet.</p>
        ) : (
          <div className="space-y-4">
            {average !== null && (
              <p className="text-2xl font-semibold text-gray-800">{average}% average</p>
            )}
            <div className="divide-y">
              {graded.map((s) => {
                const assignment = s.assignment as Assignment;
                return (
                  <div key={s.id} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">{assignment.title}</span>
                    <span className="font-medium">
                      {s.score}/{assignment.maxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
