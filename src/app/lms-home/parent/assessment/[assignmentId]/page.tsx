"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GetAssignmentAction } from "@/server/assignment";
import { GetMySubmissionsAction } from "@/server/submission";
import { Assignment } from "@/types/assignment";
import { Submission } from "@/types/submission";

export default function ParentAssignmentDetailPage() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [assignmentRes, err] = await GetAssignmentAction(assignmentId as string);
      const [submissionsRes] = await GetMySubmissionsAction();

      if (err || !assignmentRes?.data) {
        setMessage(err || "Assignment not found");
        setIsLoading(false);
        return;
      }

      setAssignment(assignmentRes.data);
      const existing = (submissionsRes?.data ?? []).find((s) =>
        typeof s.assignment === "string" ? s.assignment === assignmentId : s.assignment.id === assignmentId
      );
      if (existing) setSubmission(existing);
      setIsLoading(false);
    };
    load();
  }, [assignmentId]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!assignment) return <div className="p-6">{message || "Assignment not found"}</div>;

  return (
    <div className="min-h-screen bg-white px-6 py-4 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/lms-home/parent/assessment")}
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

      {submission ? (
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Status: {submission.status}</p>
          {submission.content && <p className="text-sm text-gray-600">Answer: {submission.content}</p>}
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
        <p className="text-sm text-gray-500 border rounded-lg p-4">
          Not submitted yet. Your child can submit this from their own account.
        </p>
      )}
    </div>
  );
}
