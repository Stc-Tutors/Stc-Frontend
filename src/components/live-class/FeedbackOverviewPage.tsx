"use client";

import { useState } from "react";
import { EyeOff, Eye, MessageSquarePlus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { formatDateTime } from "@/lib/datetime";
import { AddFeedbackNoteAction, GetFeedbackOverviewAction, SetFeedbackHiddenAction } from "@/server/session-feedback";
import { FEEDBACK_TAG_LABELS, POSITIVE_TAGS, type FeedbackOverview, type FeedbackTag, type OverviewFeedbackItem } from "@/types/live-class";

const nameOf = (v: OverviewFeedbackItem["student"], fallback: string) =>
  typeof v === "object" && v ? ("fullName" in v ? v.fullName : "") : fallback;
const tutorName = (v: OverviewFeedbackItem["tutor"]) =>
  typeof v === "object" && v ? `${v.firstName} ${v.lastName}`.trim() : "Tutor";
const courseTitle = (v: OverviewFeedbackItem["course"]) => (typeof v === "object" && v ? v.title : "Course");

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </span>
  );
}

function FeedbackRow({ item, onChanged }: { item: OverviewFeedbackItem; onChanged: () => void }) {
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleHidden = async () => {
    setBusy(true);
    const [, err] = await SetFeedbackHiddenAction(item.id, !item.hidden);
    setBusy(false);
    if (err) return ToastError(err);
    ToastSuccess(item.hidden ? "Review is visible again" : "Review hidden from public view");
    onChanged();
  };

  const saveNote = async () => {
    if (note.trim().length < 2) return;
    setBusy(true);
    const [, err] = await AddFeedbackNoteAction(item.id, note.trim());
    setBusy(false);
    if (err) return ToastError(err);
    setNote("");
    setNoting(false);
    ToastSuccess("Note saved (only staff can see it)");
    onChanged();
  };

  return (
    <li className={`space-y-2 px-4 py-3 ${item.hidden ? "bg-gray-50" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Stars value={item.rating} />
            {item.rating <= 2 && <Badge variant="destructive">Low</Badge>}
            {item.hidden && <Badge variant="secondary">Hidden</Badge>}
          </div>
          <p className="text-sm font-medium">
            {courseTitle(item.course)} <span className="font-normal text-gray-500">· {tutorName(item.tutor)}</span>
          </p>
          <p className="text-xs text-gray-500">
            {nameOf(item.student, "Student")} · {formatDateTime(item.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setNoting((v) => !v)}>
            <MessageSquarePlus className="mr-1.5 h-4 w-4" /> Note
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={toggleHidden}>
            {item.hidden ? <Eye className="mr-1.5 h-4 w-4" /> : <EyeOff className="mr-1.5 h-4 w-4" />}
            {item.hidden ? "Unhide" : "Hide"}
          </Button>
        </div>
      </div>

      {(item.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(item.tags ?? []).map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2 py-0.5 text-xs ${
                POSITIVE_TAGS.includes(tag as FeedbackTag)
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {FEEDBACK_TAG_LABELS[tag as FeedbackTag] ?? tag}
            </span>
          ))}
        </div>
      )}
      {item.comment && <p className="text-sm text-gray-700">&ldquo;{item.comment}&rdquo;</p>}

      {(item.internalNotes ?? []).length > 0 && (
        <div className="space-y-1 rounded-md border-l-2 border-blue-300 bg-blue-50 px-3 py-2">
          <p className="text-xs font-semibold text-blue-800">Staff notes (never shown to the family or tutor)</p>
          {(item.internalNotes ?? []).map((n, i) => (
            <p key={i} className="text-xs text-blue-900">
              {n.note} <span className="text-blue-500">· {formatDateTime(n.createdAt)}</span>
            </p>
          ))}
        </div>
      )}

      {noting && (
        <div className="flex gap-2">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a follow-up note for staff..." maxLength={1000} />
          <Button size="sm" disabled={busy || note.trim().length < 2} onClick={saveNote}>
            Save
          </Button>
        </div>
      )}
    </li>
  );
}

// Staff view of how classes are being received - scoped by the server to the
// courses the viewer manages (an admin's assigned scope and/or an HOD's
// department), so nobody sees feedback outside what they oversee.
export default function FeedbackOverviewPage() {
  const [lowOnly, setLowOnly] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const { data, error, isLoading, refresh } = useCachedQuery<FeedbackOverview>(
    `feedback-overview:${lowOnly}:${showHidden}`,
    async () =>
      (await unwrap(GetFeedbackOverviewAction({ lowOnly, includeHidden: showHidden }))) ?? {
        stats: { total: 0, averageRating: 0, lowCount: 0, byStar: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
        items: [],
      },
    { ttl: 20_000, tags: ["feedback"] }
  );

  const stats = data?.stats;
  const maxStar = Math.max(1, ...Object.values(stats?.byStar ?? { "1": 0 }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Class feedback</h1>
        <p className="text-sm text-gray-500">How families are rating classes, for the tutors and courses you oversee.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error && !data ? (
        <p className="text-sm text-red-600">Couldn&apos;t load feedback: {error.message}</p>
      ) : data && stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Average rating</p>
                <p className="text-2xl font-bold">{stats.total ? stats.averageRating.toFixed(2) : "—"}</p>
                <p className="text-xs text-gray-500">{stats.total} review{stats.total === 1 ? "" : "s"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Low ratings (1–2 stars)</p>
                <p className={`text-2xl font-bold ${stats.lowCount > 0 ? "text-red-600" : ""}`}>{stats.lowCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 pt-5">
                {(["5", "4", "3", "2", "1"] as const).map((star) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-500">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-amber-400" style={{ width: `${(stats.byStar[star] / maxStar) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-500">{stats.byStar[star]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
              Low ratings only
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
              Include hidden reviews
            </label>
          </div>

          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed py-12 text-center text-sm text-gray-500">
              No feedback to show{lowOnly ? " with those filters" : " yet"}.
            </p>
          ) : (
            <Card>
              <ul className="divide-y">
                {data.items.map((item) => (
                  <FeedbackRow key={item.id} item={item} onChanged={() => void refresh()} />
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
