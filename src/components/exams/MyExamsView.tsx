"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, X } from "lucide-react";
import { GetMyExamsAction, LaunchExamAction } from "@/server/exam";
import { ExamLaunchMode, MyExam } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import MockExamsSection from "@/components/exams/MockExamsSection";

function statusLabel(seat: MyExam["seat"]): { text: string; className: string } {
  if (seat.status === "SUBMITTED") return { text: "Submitted", className: "bg-green-100 text-green-700" };
  if (seat.status === "IN_PROGRESS") return { text: "In progress", className: "bg-amber-100 text-amber-700" };
  return { text: "Not started", className: "bg-gray-100 text-gray-700" };
}

// Tests a student or parent can sit through STC Exams, shared by both areas (the backend scopes everything to the logged-in family).
// A parent sees one row per child. Each test opens either in a new browser tab or in a frame inside this page, as the admin chose.
export default function MyExamsView() {
  const [exams, setExams] = useState<MyExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [frame, setFrame] = useState<{ url: string; title: string } | null>(null);

  const load = useCallback(async () => {
    const [res, error] = await GetMyExamsAction();
    if (error) ToastError(error);
    setExams(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const start = async (exam: MyExam) => {
    const key = `${exam.assessment.id}:${exam.learner.key}`;
    setBusyKey(key);
    // A tab opened after an await is treated as a popup and blocked, so reserve it now and point it at the link once we have it.
    const tab = exam.assessment.launchMode === ExamLaunchMode.NEW_TAB ? window.open("", "_blank") : null;
    const [res, error] = await LaunchExamAction(exam.assessment.id, exam.learner.key);
    setBusyKey(null);
    if (error || !res?.data) {
      tab?.close();
      ToastError(error ?? "Could not open this exam");
      return;
    }
    if (res.data.launchMode === ExamLaunchMode.EMBEDDED) {
      setFrame({ url: res.data.launchUrl, title: res.data.title });
    } else if (tab) {
      tab.opener = null;
      tab.location.href = res.data.launchUrl;
    } else {
      // The browser refused to open a tab - fall back to this one rather than lose the one-time link.
      window.location.assign(res.data.launchUrl);
    }
  };

  const closeFrame = () => {
    setFrame(null);
    // The result may already have arrived while they were in the frame.
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Exams</h1>
      </div>
      <p className="text-sm text-gray-500">
        Timed tests set for you. Some use your camera or full screen to keep the test fair - you will be told before you begin.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No exams have been set for you yet.</p>
      ) : (
        <ul className="divide-y">
          {exams.map((exam) => {
            const key = `${exam.assessment.id}:${exam.learner.key}`;
            const badge = statusLabel(exam.seat);
            const done = exam.seat.status === "SUBMITTED";
            return (
              <li key={key} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{exam.assessment.title}</p>
                  <p className="text-xs text-gray-500">
                    {exam.learner.fullName} · {exam.assessment.durationMinutes} min
                    {exam.assessment.proctoring.length > 0 ? " · monitored" : ""}
                  </p>
                  {exam.assessment.description && <p className="text-sm text-gray-600">{exam.assessment.description}</p>}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${badge.className}`}>{badge.text}</span>
                    {done && exam.seat.score != null && exam.seat.totalMarks != null && (
                      <span className="text-sm font-medium">
                        {exam.seat.score}/{exam.seat.totalMarks}
                        {exam.seat.percentage != null ? ` (${exam.seat.percentage}%)` : ""}
                      </span>
                    )}
                    {done && exam.seat.score == null && (
                      <span className="text-xs text-gray-500">Score pending (some answers are still being marked)</span>
                    )}
                  </div>
                </div>
                {!done && (
                  <Button onClick={() => start(exam)} disabled={busyKey === key}>
                    {busyKey === key ? "Opening..." : exam.seat.status === "IN_PROGRESS" ? "Resume" : "Start exam"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <MockExamsSection />

      {frame && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="flex items-center justify-between bg-white px-4 py-2">
            <p className="font-medium truncate">{frame.title}</p>
            <Button variant="outline" size="sm" onClick={closeFrame}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          </div>
          {/* `allow` is what lets a proctored test use the camera, microphone, screen share and full screen inside a frame. */}
          <iframe
            src={frame.url}
            title={frame.title}
            className="flex-1 w-full bg-white"
            allow="camera; microphone; display-capture; fullscreen"
          />
        </div>
      )}
    </div>
  );
}
