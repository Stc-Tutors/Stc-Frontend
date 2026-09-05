"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { CreateAssignmentAction } from "@/server/assignment";
import { Course } from "@/types/course";
import { UploadedFile } from "@/lib/cloudinary-upload";
import { ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS } from "@/constants/upload-limits";
import { useUser } from "@/contexts/user-context";

function tutorIdOf(course: Course): string | undefined {
  return typeof course.tutor === "string" ? course.tutor : course.tutor?.id;
}

// Lets a tutor create an assignment straight from one student's page,
// targeted at just that student (CreateAssignmentAction's targetStudents
// already supports this - see the Assignments tab's course-then-checkbox
// flow for the multi-student version of the same endpoint). Only offers
// courses the tutor actually teaches this student in, since
// AssignmentService.create otherwise 403s on a course they don't manage.
export default function GiveAssignmentPanel({ studentId, onCreated }: { studentId: string; onCreated?: () => void }) {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachment, setAttachment] = useState<UploadedFile | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    GetStudentCoursesAction(studentId).then(([res]) => {
      const myCourses = (res?.data ?? [])
        .map((e) => (typeof e.course === "string" ? null : e.course))
        .filter((c): c is Course => !!c && tutorIdOf(c) === user.id);
      setCourses(myCourses);
      if (myCourses.length > 0) setCourseId(myCourses[0].id);
      setIsLoading(false);
    });
  }, [studentId, user]);

  const handleCreate = async () => {
    if (!courseId || !title || !description || !dueDate) {
      setMessage("Course, title, description and due date are required");
      return;
    }
    setIsCreating(true);
    const [, error] = await CreateAssignmentAction({
      course: courseId,
      targetStudents: [studentId],
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: Number(maxScore) || 100,
      attachmentUrl: attachmentUrl || undefined,
      attachment,
    });
    setIsCreating(false);
    setMessage(error || "Assignment given to this student");
    if (!error) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachmentUrl("");
      setAttachment(undefined);
      onCreated?.();
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500 py-2">Loading...</p>;

  if (courses.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">
        You don&apos;t teach this student in any of your courses, so there&apos;s nothing to attach an assignment to
        here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <select
        className="w-full border rounded-md h-9 px-3 text-sm"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
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
          id={`assignment-attachment-${studentId}`}
          folder="assignments/attachments"
          value={attachment}
          onChange={setAttachment}
          limits={ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS}
        />
      </div>
      <Button size="sm" onClick={handleCreate} disabled={isCreating}>
        {isCreating ? "Giving..." : "Give Assignment"}
      </Button>
    </div>
  );
}
