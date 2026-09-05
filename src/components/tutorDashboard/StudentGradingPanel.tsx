"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseAssignmentsAction } from "@/server/assignment";
import { GetSubmissionsForAssignmentAction, GradeSubmissionAction } from "@/server/submission";
import { Assignment } from "@/types/assignment";
import { Submission } from "@/types/submission";
import { Course } from "@/types/course";

interface Row {
  course: Course;
  assignment: Assignment;
  submission?: Submission;
}

export default function StudentGradingPanel({ studentId }: { studentId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [courseEnrollmentsRes] = await GetStudentCoursesAction(studentId);
    const courses = (courseEnrollmentsRes?.data ?? [])
      .map((e) => (typeof e.course === "string" ? null : e.course))
      .filter((c): c is Course => !!c);

    const allRows: Row[] = [];
    for (const course of courses) {
      const [assignmentsRes] = await GetCourseAssignmentsAction(course.id);
      for (const assignment of assignmentsRes?.data ?? []) {
        const [submissionsRes] = await GetSubmissionsForAssignmentAction(assignment.id);
        const submission = (submissionsRes?.data ?? []).find((s) =>
          typeof s.student === "string" ? s.student === studentId : s.student.id === studentId
        );
        allRows.push({ course, assignment, submission });
      }
    }

    setRows(allRows);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleGrade = async (submissionId: string) => {
    const score = Number(scores[submissionId]);
    if (!score && score !== 0) {
      setMessage("Enter a score first");
      return;
    }
    const [, error] = await GradeSubmissionAction(submissionId, score, feedbacks[submissionId]);
    setMessage(error || "Graded successfully");
    load();
  };

  if (isLoading) return <p className="text-sm text-gray-500 py-4">Loading assignments...</p>;
  if (rows.length === 0) return <p className="text-sm text-gray-500 py-4">No assignments for this student yet.</p>;

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-blue-600">{message}</p>}
      {rows.map((row) => (
        <div key={row.assignment.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">{row.assignment.title}</p>
              <p className="text-xs text-gray-500">{row.course.title}</p>
            </div>
            <span className="text-xs text-gray-500">
              {row.submission?.status ?? "Not submitted"}
            </span>
          </div>

          {row.submission?.content && <p className="text-sm text-gray-600 mb-2">{row.submission.content}</p>}
          {row.submission?.fileUrl && (
            <a href={row.submission.fileUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline mb-2">
              {row.submission.fileUrl}
            </a>
          )}
          {row.submission?.attachment && (
            <a href={row.submission.attachment.url} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline mb-2">
              {row.submission.attachment.fileName}
            </a>
          )}

          {row.submission && row.submission.status !== "GRADED" && (
            <div className="flex gap-2 items-center mt-2">
              <Input
                type="number"
                placeholder={`Score / ${row.assignment.maxScore}`}
                className="w-32"
                value={scores[row.submission.id] ?? ""}
                onChange={(e) => setScores((prev) => ({ ...prev, [row.submission!.id]: e.target.value }))}
              />
              <Input
                placeholder="Feedback (optional)"
                value={feedbacks[row.submission.id] ?? ""}
                onChange={(e) => setFeedbacks((prev) => ({ ...prev, [row.submission!.id]: e.target.value }))}
              />
              <Button size="sm" onClick={() => handleGrade(row.submission!.id)}>
                Grade
              </Button>
            </div>
          )}

          {row.submission?.status === "GRADED" && (
            <p className="text-sm font-medium text-green-600">
              Graded: {row.submission.score}/{row.assignment.maxScore}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
