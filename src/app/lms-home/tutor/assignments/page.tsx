"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseAssignmentsAction, CreateAssignmentAction } from "@/server/assignment";
import { GetCourseEnrollmentsAction } from "@/server/course-enrollment";
import { Assignment, AssignmentStatus } from "@/types/assignment";
import { Course } from "@/types/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Student } from "@/types/student";
import { UploadedFile } from "@/lib/cloudinary-upload";
import { ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS } from "@/constants/upload-limits";

interface Row {
  course: Course;
  assignment: Assignment;
}

export default function TutorAssignmentsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [roster, setRoster] = useState<CourseEnrollment[]>([]);
  const [targetStudents, setTargetStudents] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachment, setAttachment] = useState<UploadedFile | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [coursesRes] = await GetMyCoursesAction();
    const myCourses = coursesRes?.data ?? [];
    setCourses(myCourses);
    if (!courseId && myCourses.length > 0) setCourseId(myCourses[0].id);

    const assignmentLists = await Promise.all(myCourses.map((c) => GetCourseAssignmentsAction(c.id)));
    const allRows: Row[] = [];
    assignmentLists.forEach(([res], i) => {
      (res?.data ?? []).forEach((assignment) => allRows.push({ course: myCourses[i], assignment }));
    });
    allRows.sort((a, b) => new Date(b.assignment.createdAt).getTime() - new Date(a.assignment.createdAt).getTime());
    setRows(allRows);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTargetStudents([]);
    if (!courseId) {
      setRoster([]);
      return;
    }
    GetCourseEnrollmentsAction(courseId).then(([res]) => setRoster(res?.data ?? []));
  }, [courseId]);

  const toggleTargetStudent = (studentId: string) => {
    setTargetStudents((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
  };

  const handleCreate = async () => {
    if (!courseId || !title || !description || !dueDate) {
      setMessage("Course, title, description and due date are required");
      return;
    }
    setIsCreating(true);
    const [, error] = await CreateAssignmentAction({
      course: courseId,
      targetStudents: targetStudents.length > 0 ? targetStudents : undefined,
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: Number(maxScore) || 100,
      attachmentUrl: attachmentUrl || undefined,
      attachment,
    });
    setIsCreating(false);
    setMessage(error || "Assignment added");
    setTitle("");
    setDescription("");
    setDueDate("");
    setAttachmentUrl("");
    setAttachment(undefined);
    setTargetStudents([]);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-blue-500" />
        <h1 className="text-xl font-bold text-gray-800">Assignments</h1>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Give a new assignment</h2>
        {courses.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
            <p className="font-semibold">No students yet - nothing to assign to</p>
            <p className="mt-1">
              This form only appears once you&apos;ve accepted at least one student assignment - accepting is what
              creates the course this assignment would belong to. Once you accept an assignment from your dashboard,
              this form will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              className="w-full border rounded-md h-9 px-3 text-sm"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {roster.length > 0 && (
              <div className="border rounded-md p-2">
                <p className="text-xs text-gray-500 mb-1">
                  Give to (leave all unchecked to give it to every student enrolled in this course):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {roster.map((e) => {
                    const student = typeof e.student === "string" ? null : (e.student as Student);
                    if (!student) return null;
                    return (
                      <label key={student.id} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={targetStudents.includes(student.id)}
                          onChange={() => toggleTargetStudent(student.id)}
                        />
                        <span className="truncate">{student.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <Input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <Input
                type="number"
                placeholder="Max score"
                className="w-28"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>
            <Input
              placeholder="Attachment link (optional, e.g. Google Drive)"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
            <div>
              <p className="text-xs text-gray-500 mb-1">Or attach a file (optional)</p>
              <FileUploadField
                id="assignment-attachment"
                folder="assignments/attachments"
                value={attachment}
                onChange={setAttachment}
                limits={ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS}
              />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Adding..." : "Add Assignment"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">All assignments</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No assignments yet.</p>
        ) : (
          <div className="divide-y">
            {rows.map(({ course, assignment: a }) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-3">
                <div>
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => router.push(`/lms-home/tutor/courses/${course.id}/assignments/${a.id}`)}
                  >
                    {a.title}
                  </button>
                  <p className="text-xs text-gray-500">{course.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === AssignmentStatus.PENDING_APPROVAL && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                      Awaiting admin approval
                    </span>
                  )}
                  {a.status === AssignmentStatus.REJECTED && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700"
                      title={a.rejectionReason}
                    >
                      Rejected
                    </span>
                  )}
                  <span className="text-gray-500">Due {new Date(a.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
