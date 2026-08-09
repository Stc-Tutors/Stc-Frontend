"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetAssignmentAction } from "@/server/assignment";
import { GetMySubmissionsAction, SubmitAssignmentAction } from "@/server/submission";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { Assignment } from "@/types/assignment";
import { Submission } from "@/types/submission";

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [assignmentRes, err] = await GetAssignmentAction(assignmentId as string);
      const [submissionsRes] = await GetMySubmissionsAction();
      const [enrollmentsRes] = await GetEnrollmentsAction();

      if (err || !assignmentRes?.data) {
        setMessage(err || "Assignment not found");
        setIsLoading(false);
        return;
      }

      setAssignment(assignmentRes.data);
      setStudentId(enrollmentsRes?.data?.[0]?.id ?? null);

      const existing = (submissionsRes?.data ?? []).find((s) =>
        typeof s.assignment === "string" ? s.assignment === assignmentId : s.assignment.id === assignmentId
      );
      if (existing) setSubmission(existing);
      setIsLoading(false);
    };
    load();
  }, [assignmentId]);

  const handleSubmit = async () => {
    if (!studentId) {
      setMessage("No active enrollment found for your account.");
      return;
    }
    setIsSubmitting(true);
    const [res, error] = await SubmitAssignmentAction({
      assignmentId: assignmentId as string,
      studentId,
      content: content || undefined,
      fileUrl: fileUrl || undefined,
    });
    setIsSubmitting(false);
    if (error || !res?.data) {
      setMessage(error || "Failed to submit");
      return;
    }
    setSubmission(res.data);
    setMessage("Submitted successfully!");
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!assignment) return <div className="p-6">{message || "Assignment not found"}</div>;

  return (
    <div className="min-h-screen bg-white px-6 py-4 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/lms-home/student/assessment")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <h1 className="text-xl font-semibold mb-2">{assignment.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Due {new Date(assignment.dueDate).toLocaleDateString()} · Max score: {assignment.maxScore}
      </p>
      <p className="text-gray-700 mb-6">{assignment.description}</p>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {submission ? (
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Status: {submission.status}</p>
          {submission.content && <p className="text-sm text-gray-600">Your answer: {submission.content}</p>}
          {submission.fileUrl && (
            <p className="text-sm text-gray-600">
              File:{" "}
              <a href={submission.fileUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                {submission.fileUrl}
              </a>
            </p>
          )}
          {submission.status === "GRADED" && (
            <>
              <p className="text-sm font-medium">
                Score: {submission.score}/{assignment.maxScore}
              </p>
              {submission.feedback && <p className="text-sm text-gray-600">Feedback: {submission.feedback}</p>}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            placeholder="Write your answer here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            placeholder="Link to file (optional)"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </div>
      )}
    </div>
  );
}
