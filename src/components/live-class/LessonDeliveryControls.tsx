"use client";

import { useState } from "react";
import { Circle, Link2, Monitor, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  GetRecordingReadinessAction,
  SetCourseDeliveryModeAction,
  SetCourseRecordingAction,
  SetLessonDeliveryModeAction,
  SetLessonRecordingAction,
} from "@/server/live-class";
import { LessonDeliveryMode, type LessonRecording, type RecordingReadiness } from "@/types/live-class";

// Only what the controls read/write, so any app's own lesson type fits.
export interface ControlLesson {
  id: string;
  deliveryMode?: LessonDeliveryMode;
  recording?: LessonRecording;
}

interface LessonDeliveryControlsProps {
  lesson: ControlLesson;
  courseId: string;
  // Choosing external-link vs in-app is the same power as setting a meeting
  // link (server: assertCanManageMeetingLinks).
  canChooseDelivery: boolean;
  // The server enforces the real rule (permission + scope + consent); this
  // only decides whether to offer the control at all.
  canManageRecording: boolean;
  onChanged: (lesson: ControlLesson) => void;
  onBulkChanged?: () => void;
}

// One compact control per upcoming class: how it's delivered, and - for an
// in-app class - whether it's recorded. Recording never turns on silently: the
// panel shows exactly which children still need a parent's consent.
export default function LessonDeliveryControls({
  lesson,
  courseId,
  canChooseDelivery,
  canManageRecording,
  onChanged,
  onBulkChanged,
}: LessonDeliveryControlsProps) {
  const mode = lesson.deliveryMode ?? LessonDeliveryMode.EXTERNAL;
  const inApp = mode === LessonDeliveryMode.LIVEKIT;
  const recording = !!lesson.recording?.enabled;

  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [readiness, setReadiness] = useState<RecordingReadiness | null>(null);
  const [reason, setReason] = useState("");

  const changeMode = async (next: LessonDeliveryMode, wholeCourse: boolean) => {
    setBusy(true);
    if (wholeCourse) {
      const [res, err] = await SetCourseDeliveryModeAction(courseId, next);
      setBusy(false);
      if (err) return ToastError(err);
      ToastSuccess(`${res?.data?.updated ?? 0} upcoming class(es) updated`);
      onBulkChanged?.();
      return;
    }
    const [res, err] = await SetLessonDeliveryModeAction(lesson.id, next);
    setBusy(false);
    if (err || !res?.data) return ToastError(err || "Couldn't change how this class is delivered");
    onChanged(res.data);
  };

  const openPanel = async () => {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) {
      const [res, err] = await GetRecordingReadinessAction(lesson.id);
      if (err) ToastError(err);
      setReadiness(res?.data ?? null);
    }
  };

  const setRecording = async (enabled: boolean, wholeCourse: boolean) => {
    setBusy(true);
    if (wholeCourse) {
      const [res, err] = await SetCourseRecordingAction(courseId, enabled, reason.trim() || undefined);
      setBusy(false);
      if (err) return ToastError(err);
      ToastSuccess(`Recording ${enabled ? "turned on for" : "turned off for"} ${res?.data?.updated ?? 0} upcoming class(es)`);
      onBulkChanged?.();
      return;
    }
    const [res, err] = await SetLessonRecordingAction(lesson.id, enabled, reason.trim() || undefined);
    setBusy(false);
    if (err || !res?.data) return ToastError(err || "Couldn't change recording");
    ToastSuccess(enabled ? "This class will be recorded" : "Recording turned off for this class");
    onChanged(res.data);
    setPanelOpen(false);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex overflow-hidden rounded-md border" role="group" aria-label="How this class is delivered">
          <button
            type="button"
            disabled={!canChooseDelivery || busy}
            onClick={() => inApp && changeMode(LessonDeliveryMode.EXTERNAL, false)}
            aria-pressed={!inApp}
            className={`flex items-center gap-1 px-2 py-1 ${!inApp ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"} disabled:opacity-60`}
          >
            <Link2 className="h-3 w-3" /> Link
          </button>
          <button
            type="button"
            disabled={!canChooseDelivery || busy}
            onClick={() => !inApp && changeMode(LessonDeliveryMode.LIVEKIT, false)}
            aria-pressed={inApp}
            className={`flex items-center gap-1 border-l px-2 py-1 ${inApp ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"} disabled:opacity-60`}
          >
            <Monitor className="h-3 w-3" /> In-app
          </button>
        </div>

        {inApp && canManageRecording && (
          <button
            type="button"
            onClick={openPanel}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 ${
              recording ? "border-red-300 bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Circle className={`h-2.5 w-2.5 ${recording ? "fill-current" : ""}`} />
            {recording ? "Recording on" : "Not recorded"}
          </button>
        )}
        {inApp && !canManageRecording && recording && (
          <span className="flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-red-700">
            <Circle className="h-2.5 w-2.5 fill-current" /> Recorded
          </span>
        )}
      </div>

      {canChooseDelivery && (
        <button
          type="button"
          disabled={busy}
          onClick={() => changeMode(inApp ? LessonDeliveryMode.EXTERNAL : LessonDeliveryMode.LIVEKIT, true)}
          className="text-blue-600 hover:underline disabled:opacity-60"
        >
          Apply {inApp ? "link" : "in-app"} to all upcoming classes of this course
        </button>
      )}

      {panelOpen && (
        <div className="space-y-2 rounded-lg border bg-gray-50 p-3">
          {!readiness ? (
            <p className="text-gray-500">Checking...</p>
          ) : (
            <>
              {!readiness.recordingConfigured && (
                <p className="flex items-start gap-1.5 text-amber-800">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Recording storage isn&apos;t set up on the server yet, so recording can&apos;t start.
                </p>
              )}
              {readiness.missingConsent.length > 0 ? (
                <div className="text-amber-800">
                  <p className="flex items-start gap-1.5">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    A parent&apos;s consent is needed first for:
                  </p>
                  <ul className="ml-5 list-disc">
                    {readiness.missingConsent.map((c) => (
                      <li key={c.studentId}>{c.fullName}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Every enrolled child has a parent&apos;s consent.
                </p>
              )}

              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Why (kept in the audit log)"
                className="h-7 text-xs"
              />
              <div className="flex flex-wrap gap-2">
                {recording ? (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={busy} onClick={() => setRecording(false, false)}>
                    Stop recording this class
                  </Button>
                ) : (
                  <Button size="sm" className="h-7 px-2 text-xs" disabled={busy || !readiness.canStart} onClick={() => setRecording(true, false)}>
                    Record this class
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={busy || (!recording && !readiness.canStart)}
                  onClick={() => setRecording(!recording, true)}
                >
                  {recording ? "Stop for all upcoming" : "Record all upcoming"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
