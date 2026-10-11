"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import ExamForm, { EMPTY_EXAM_FORM, ExamFormValues } from "@/components/exams/ExamForm";
import { CreateExamAction, GetExamStatusAction, GetExamsAction } from "@/server/exam";
import { Exam, ExamApprovalStatus, ExamRemoteStatus } from "@/types/exam";

function badge(exam: Exam): { text: string; className: string } {
  if (exam.approvalStatus === ExamApprovalStatus.PENDING) return { text: "Awaiting approval", className: "bg-blue-100 text-blue-700" };
  if (exam.approvalStatus === ExamApprovalStatus.REJECTED) return { text: "Not approved", className: "bg-red-100 text-red-700" };
  if (exam.remoteStatus === ExamRemoteStatus.PENDING_PAYMENT) return { text: "Payment pending", className: "bg-red-100 text-red-700" };
  if (exam.published) return { text: "Published", className: "bg-green-100 text-green-700" };
  return { text: "Draft", className: "bg-amber-100 text-amber-700" };
}

// Proctored tests run on STC Exams; this screen creates them there through its API and tracks who sits them here.
export default function ExamsManager({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [configured, setConfigured] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const [[statusRes, statusError], [listRes, error]] = await Promise.all([GetExamStatusAction(), GetExamsAction()]);
    // Only call it "not connected" when the backend actually said so - a failed status call (permissions, backend down) is not that.
    setConfigured(statusRes?.data ? statusRes.data.configured : true);
    setIsStaff(statusRes?.data?.isStaff ?? false);
    if (statusError) ToastError(statusError);
    if (error) ToastError(error);
    setExams(listRes?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (v: ExamFormValues) => {
    const [res, error] = await CreateExamAction({
      title: v.title,
      description: v.description || undefined,
      expectedParticipantCount: v.expectedParticipantCount,
      durationMinutes: v.durationMinutes,
      proctoring: v.proctoring,
      launchMode: v.launchMode,
      audienceType: v.audienceType,
      courseIds: v.audienceType === "COURSE" ? v.courseIds : [],
      acceptFeatureAddon: v.acceptFeatureAddon,
    });
    if (error || !res?.data) {
      ToastError(error ?? "Could not create the exam");
      return;
    }
    ToastSuccess("Exam created");
    router.push(`${basePath}/${res.data.id}`);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exams</h1>
        <div className="flex gap-2">
          {isStaff && (
            <Link href="/lms-home/admin/exams/mock">
              <Button variant="outline">Mock exam coins</Button>
            </Link>
          )}
          <Button onClick={() => setCreating((c) => !c)}>{creating ? "Cancel" : "New exam"}</Button>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Proctored tests run on STC Exams. Create one, add its questions and choose who sits it.
        {isStaff ? " Exams written by tutors and heads of department appear here for approval." : " An admin approves your exam before learners can see it."}
      </p>

      {!configured && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          STC Exams is not connected yet. Set <code>STC_EXAMS_API_KEY</code> on the server to turn this on.
        </div>
      )}

      {creating && (
        <div className="rounded-xl border p-4">
          <ExamForm initial={EMPTY_EXAM_FORM} isNew submitLabel="Create exam" onSubmit={create} />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No exams created yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              {isStaff && <TableHead>Created by</TableHead>}
              <TableHead>Opens</TableHead>
              <TableHead>Learners</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => {
              const b = badge(exam);
              return (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Link href={`${basePath}/${exam.id}`} className="text-blue-600 hover:underline">
                      {exam.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${b.className}`}>{b.text}</span>
                  </TableCell>
                  {isStaff && <TableCell>{exam.createdByName}</TableCell>}
                  <TableCell>{exam.launchMode === "EMBEDDED" ? "Embedded" : "New tab"}</TableCell>
                  <TableCell>{exam.audienceType === "COURSE" ? `${exam.courseIds.length} course(s)` : exam.seatCount ?? 0}</TableCell>
                  <TableCell>{exam.submittedCount ?? 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
