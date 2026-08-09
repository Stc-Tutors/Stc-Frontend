"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GetAssignmentAction } from "@/server/assignment";
import { GetSubmissionsForAssignmentAction, GradeSubmissionAction } from "@/server/submission";
import { Assignment } from "@/types/assignment";
import { Submission } from "@/types/submission";
import { Student } from "@/types/student";

export default function AssignmentSubmissionsPage() {
  const { id, assignmentId } = useParams();
  const router = useRouter();
  const courseId = id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [assignmentRes] = await GetAssignmentAction(assignmentId as string);
    const [submissionsRes] = await GetSubmissionsForAssignmentAction(assignmentId as string);
    setAssignment(assignmentRes?.data ?? null);
    setSubmissions(submissionsRes?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const studentName = (student: Submission["student"]) =>
    typeof student === "string" ? student : (student as Student).fullName;

  const handleGrade = async (submissionId: string) => {
    const draft = drafts[submissionId];
    const score = Number(draft?.score);
    if (!draft?.score || Number.isNaN(score)) {
      setMessage("Enter a valid score");
      return;
    }
    setSavingId(submissionId);
    const [, error] = await GradeSubmissionAction(submissionId, score, draft.feedback || undefined);
    setSavingId(null);
    setMessage(error || "Submission graded");
    load();
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!assignment) return <p className="p-6">Assignment not found</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(`/lms-home/tutor/courses/${courseId}`)}
        className="flex items-center text-gray-700 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold">{assignment.title}</h1>
        <p className="text-sm text-gray-500">
          Due {new Date(assignment.dueDate).toLocaleDateString()} · Max score: {assignment.maxScore}
        </p>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Submissions ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No students have submitted this assignment yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => {
              const draft = drafts[s.id] ?? { score: s.score?.toString() ?? "", feedback: s.feedback ?? "" };
              return (
                <div key={s.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{studentName(s.student)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.status}</span>
                  </div>
                  {s.content && <p className="text-sm text-gray-700">{s.content}</p>}
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                      {s.fileUrl}
                    </a>
                  )}
                  <div className="flex gap-2 items-start pt-2">
                    <Input
                      type="number"
                      placeholder="Score"
                      className="w-24"
                      value={draft.score}
                      onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...draft, score: e.target.value } })}
                    />
                    <Textarea
                      placeholder="Feedback (optional)"
                      className="flex-1"
                      value={draft.feedback}
                      onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...draft, feedback: e.target.value } })}
                    />
                    <Button size="sm" onClick={() => handleGrade(s.id)} disabled={savingId === s.id}>
                      {s.status === "GRADED" ? "Update" : "Grade"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
