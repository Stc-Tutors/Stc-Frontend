"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseAssignmentsAction } from "@/server/assignment";
import { GetMySubmissionsAction } from "@/server/submission";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import { Assignment } from "@/types/assignment";
import { Submission, SubmissionStatus } from "@/types/submission";

interface AssignmentsOverviewPanelProps {
  studentId?: string;
}

export default function AssignmentsOverviewPanel({ studentId }: AssignmentsOverviewPanelProps) {
  const [stats, setStats] = useState({ total: 0, submitted: 0, graded: 0, missing: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setStats({ total: 0, submitted: 0, graded: 0, missing: 0 });
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const [coursesRes] = await GetStudentCoursesAction(studentId);
      const activeCourseIds = (coursesRes?.data ?? [])
        .filter((e) => e.status === CourseEnrollmentStatus.ACTIVE)
        .map((e) => (typeof e.course === "string" ? e.course : e.course.id));

      const [assignmentLists, [submissionsRes]] = await Promise.all([
        Promise.all(activeCourseIds.map((id) => GetCourseAssignmentsAction(id))),
        GetMySubmissionsAction(),
      ]);

      const assignments: Assignment[] = assignmentLists
        .flatMap(([res]) => res?.data ?? [])
        .filter((a) => !a.targetStudents || a.targetStudents.length === 0 || a.targetStudents.includes(studentId));

      const mySubmissions: Submission[] = (submissionsRes?.data ?? []).filter(
        (s) => (typeof s.student === "string" ? s.student : s.student.id) === studentId
      );
      const submittedAssignmentIds = new Set(
        mySubmissions.map((s) => (typeof s.assignment === "string" ? s.assignment : s.assignment.id))
      );

      const now = Date.now();
      const submitted = assignments.filter((a) => submittedAssignmentIds.has(a.id)).length;
      const graded = mySubmissions.filter((s) => s.status === SubmissionStatus.GRADED).length;
      const missing = assignments.filter((a) => !submittedAssignmentIds.has(a.id) && new Date(a.dueDate).getTime() < now).length;

      setStats({ total: assignments.length, submitted, graded, missing });
      setIsLoading(false);
    };
    load();
  }, [studentId]);

  const cards = [
    { label: "Total Assignments", value: stats.total, color: "text-gray-800" },
    { label: "Submitted", value: stats.submitted, color: "text-blue-600" },
    { label: "Graded", value: stats.graded, color: "text-green-600" },
    { label: "Missing / Overdue", value: stats.missing, color: "text-red-600" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Completion</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Across the selected child's currently active courses</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view assignment completion.</p>
        ) : stats.total === 0 ? (
          <p className="text-sm text-gray-500">No assignments given yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div key={c.label}>
                <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
