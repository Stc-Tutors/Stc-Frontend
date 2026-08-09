"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseAssignmentsAction } from "@/server/assignment";
import { GetMySubmissionsAction } from "@/server/submission";
import { Assignment } from "@/types/assignment";
import { Submission } from "@/types/submission";
import { Course } from "@/types/course";

interface Row {
  childName: string;
  assignment: Assignment;
  course: Course;
  submission?: Submission;
}

export default function ParentAssessmentPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [childrenRes] = await GetLinkedStudentsAction();
      const children = childrenRes?.data ?? [];
      if (children.length === 0) {
        setIsLoading(false);
        return;
      }

      const [submissionsRes] = await GetMySubmissionsAction();
      const submissions = submissionsRes?.data ?? [];

      const allRows: Row[] = [];
      for (const child of children) {
        const [courseEnrollmentsRes] = await GetStudentCoursesAction(child.id);
        const courses = (courseEnrollmentsRes?.data ?? [])
          .map((e) => (typeof e.course === "string" ? null : e.course))
          .filter((c): c is Course => !!c);

        const assignmentLists = await Promise.all(courses.map((c) => GetCourseAssignmentsAction(c.id)));

        assignmentLists.forEach(([res], i) => {
          (res?.data ?? []).forEach((assignment) => {
            const submission = submissions.find((s) => {
              const matchesAssignment =
                typeof s.assignment === "string" ? s.assignment === assignment.id : s.assignment.id === assignment.id;
              const matchesStudent = typeof s.student === "string" ? s.student === child.id : s.student.id === child.id;
              return matchesAssignment && matchesStudent;
            });
            allRows.push({
              childName: child.fullName || "Your child",
              assignment,
              course: courses[i],
              submission,
            });
          });
        });
      }

      setRows(allRows);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <button
        onClick={() => router.push("/lms-home/parent/dashboard")}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-1xl font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-800">Assessment</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        View-only - assignments are submitted by your child from their own account.
      </p>

      <div className="grid grid-cols-6 font-semibold text-sm text-gray-600 py-2 border-b">
        <div>Child</div>
        <div>Course</div>
        <div>Assignment</div>
        <div className="text-center">Due Date</div>
        <div className="text-center">Status</div>
        <div className="text-right">Action</div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-6">Loading assignments...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-6">No assignments yet for your children's enrolled courses.</p>
      ) : (
        <div className="divide-y">
          {rows.map((row, i) => (
            <div key={`${row.assignment.id}-${i}`} className="grid grid-cols-6 items-center py-3 text-sm">
              <div>{row.childName}</div>
              <div>{row.course.title}</div>
              <div>{row.assignment.title}</div>
              <div className="text-center">{new Date(row.assignment.dueDate).toLocaleDateString()}</div>
              <div className="text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.submission?.status === "GRADED"
                      ? "bg-green-100 text-green-600"
                      : row.submission
                      ? "bg-blue-100 text-blue-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {row.submission?.status ?? "Not submitted"}
                  {row.submission?.status === "GRADED" && row.submission.score !== undefined
                    ? ` (${row.submission.score}/${row.assignment.maxScore})`
                    : ""}
                </span>
              </div>
              <div className="text-right">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => router.push(`/lms-home/parent/assessment/${row.assignment.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
