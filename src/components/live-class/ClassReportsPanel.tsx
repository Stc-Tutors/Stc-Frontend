"use client";

import { useMemo, useState } from "react";
import { ClipboardList, PlayCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { formatDateTime } from "@/lib/datetime";
import { formatMinutes } from "@/lib/live-class-format";
import { GetMyClassReportsAction, SubmitSessionFeedbackAction } from "@/server/session-feedback";
import { FEEDBACK_TAGS, FEEDBACK_TAG_LABELS, POSITIVE_TAGS, type ClassReport, type FeedbackTag } from "@/types/live-class";
import RecordingPlayerDialog from "@/components/live-class/RecordingPlayerDialog";

function Stars({ value, onChange, size = 22 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const icon = <Star style={{ width: size, height: size }} className={filled ? "fill-amber-400 text-amber-400" : "text-gray-300"} />;
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange(n)}
            className="rounded p-0.5 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </div>
  );
}

function TagChips({ selected, onToggle }: { selected: string[]; onToggle?: (tag: FeedbackTag) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FEEDBACK_TAGS.map((tag) => {
        const on = selected.includes(tag);
        const positive = POSITIVE_TAGS.includes(tag);
        if (!onToggle && !on) return null;
        return (
          <button
            key={tag}
            type="button"
            disabled={!onToggle}
            aria-pressed={on}
            onClick={() => onToggle?.(tag)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              on
                ? positive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-amber-50 text-amber-800"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {FEEDBACK_TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}

function RateForm({ report, onDone }: { report: ClassReport; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      ToastError("Choose a star rating first");
      return;
    }
    setSaving(true);
    const [, err] = await SubmitSessionFeedbackAction({
      lessonId: report.lessonId,
      studentId: report.studentId,
      rating,
      tags,
      comment: comment.trim() || undefined,
    });
    setSaving(false);
    if (err) {
      ToastError(err);
      return;
    }
    ToastSuccess("Thanks - your feedback was sent");
    onDone();
  };

  return (
    <div className="space-y-3 rounded-lg border bg-gray-50 p-3">
      <p className="text-sm font-medium">How was this class?</p>
      <Stars value={rating} onChange={setRating} />
      {rating > 0 && (
        <>
          <TagChips
            selected={tags}
            onToggle={(tag) => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))}
          />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            placeholder={rating <= 2 ? "Tell us what went wrong so we can put it right (optional)" : "Anything you'd like to add? (optional)"}
            rows={3}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={saving}>
              {saving ? "Sending..." : "Send feedback"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ClassReportsPanel() {
  const { data, error, isLoading, refresh } = useCachedQuery<ClassReport[]>(
    "class-reports",
    async () => (await unwrap(GetMyClassReportsAction())) ?? [],
    { ttl: 30_000, tags: ["lessons", "feedback"] }
  );
  const [childFilter, setChildFilter] = useState<string>("all");
  const [playing, setPlaying] = useState<{ id: string; title: string } | null>(null);

  const children = useMemo(() => {
    const map = new Map<string, string>();
    (data ?? []).forEach((r) => map.set(r.studentId, r.studentName));
    return Array.from(map.entries());
  }, [data]);

  const rows = (data ?? []).filter((r) => childFilter === "all" || r.studentId === childFilter);

  if (isLoading) return <p className="text-sm text-gray-500">Loading class reports...</p>;
  if (error && !data) return <p className="text-sm text-red-600">Couldn&apos;t load class reports: {error.message}</p>;

  return (
    <div className="space-y-4">
      <RecordingPlayerDialog lessonId={playing?.id ?? null} title={playing?.title} onClose={() => setPlaying(null)} />

      {children.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by child">
          {[["all", "All children"], ...children].map(([id, name]) => (
            <button
              key={id}
              role="tab"
              aria-selected={childFilter === id}
              onClick={() => setChildFilter(id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                childFilter === id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center text-gray-500">
          <ClipboardList className="h-7 w-7" />
          <p className="text-sm">After each class, your tutor&apos;s progress report will appear here.</p>
        </div>
      ) : (
        rows.map((report) => (
          <Card key={`${report.lessonId}:${report.studentId}`}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{report.courseTitle}</p>
                  <p className="text-xs text-gray-500">
                    {report.studentName} · with {report.tutorName} · {formatDateTime(report.scheduledDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formatMinutes(report.billableMinutes)} counted</Badge>
                  {report.recordingAvailable && (
                    <Button size="sm" variant="outline" onClick={() => setPlaying({ id: report.lessonId, title: report.courseTitle })}>
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Watch recording
                    </Button>
                  )}
                </div>
              </div>

              {report.report.length > 0 && (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {report.report.map((field) => (
                    <div key={field.key}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{field.label}</dt>
                      <dd className="whitespace-pre-wrap text-sm text-gray-800">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {report.myFeedback ? (
                <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Your feedback</p>
                  <Stars value={report.myFeedback.rating} size={16} />
                  <TagChips selected={report.myFeedback.tags} />
                  {report.myFeedback.comment && <p className="text-sm text-gray-700">{report.myFeedback.comment}</p>}
                </div>
              ) : (
                report.canRate && <RateForm report={report} onDone={() => void refresh()} />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
