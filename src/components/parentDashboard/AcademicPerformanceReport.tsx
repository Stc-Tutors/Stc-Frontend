"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetStudentPerformanceAction } from "@/server/performance";
import { StudentPerformance } from "@/types/performance";

interface AcademicPerformanceReportProps {
  studentId?: string;
}

const pct = (n: number | null | undefined) => (n == null ? "-" : `${Math.round(n)}%`);

// Marks for the selected child: graded assignments and STC Exams tests together, with the overall mark across both.
export default function AcademicPerformanceReport({ studentId }: AcademicPerformanceReportProps) {
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setPerformance(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    GetStudentPerformanceAction(studentId).then(([res]) => {
      if (cancelled) return;
      setPerformance(res?.data ?? null);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Performance Report</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Graded assignments and exam results for the selected child</p>
      </CardHeader>

      <CardContent>
        {!studentId ? (
          <p className="text-sm text-gray-500">Select a child to view their academic performance.</p>
        ) : isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !performance || performance.recent.length === 0 ? (
          <p className="text-sm text-gray-500">No graded assignments or exam results yet.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xl font-semibold text-gray-800">{pct(performance.overallPercent)}</p>
                <p className="text-xs text-gray-500">Overall</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{pct(performance.assignments.averagePercent)}</p>
                <p className="text-xs text-gray-500">Assignments ({performance.assignments.graded} graded)</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{pct(performance.tests.averagePercent)}</p>
                <p className="text-xs text-gray-500">Exams ({performance.tests.taken} taken)</p>
              </div>
            </div>
            <div className="divide-y">
              {performance.recent.map((item, i) => (
                <div key={`${item.kind}-${item.title}-${i}`} className="flex justify-between flex-wrap gap-2 py-2 text-sm">
                  <span className="text-gray-700">
                    <span
                      className={`mr-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        item.kind === "TEST" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.kind === "TEST" ? "EXAM" : "ASSIGNMENT"}
                    </span>
                    {item.title}
                  </span>
                  <span className="font-medium">
                    {item.score}/{item.maxScore} <span className="text-gray-500">({Math.round(item.percent)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
