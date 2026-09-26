"use client";

import { AlertTriangle, CheckCircle2, Clock, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { formatDateTime } from "@/lib/datetime";
import { formatMinutes } from "@/lib/live-class-format";
import { GetMyTutorSessionsAction } from "@/server/hours";
import { SESSION_FLAG_LABELS, SESSION_TRUST_LABELS, type TutorSessionLine, type TutorSessionsReport } from "@/types/live-class";

const REVIEW_BADGE: Record<string, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  APPROVED: { label: "Approved", variant: "success" },
  PENDING_REVIEW: { label: "Awaiting review", variant: "secondary" },
  FLAGGED: { label: "Held", variant: "destructive" },
};

function Tile({ icon: Icon, label, minutes, tone }: { icon: typeof Clock; label: string; minutes: number; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <span className={`rounded-full p-2 ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold">{formatMinutes(minutes)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionRow({ session }: { session: TutorSessionLine }) {
  const review = REVIEW_BADGE[session.reviewStatus ?? "PENDING_REVIEW"];
  // Everything except "ran over" is worth telling the tutor about - it's the
  // reason a session might be paid less or looked at.
  const notes = session.flags.filter((f) => f !== "OVERRAN_CAPPED");
  const capped = session.flags.includes("OVERRAN_CAPPED");

  return (
    <li className="space-y-1.5 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {session.courseTitle} <span className="font-normal text-gray-500">· {session.title}</span>
          </p>
          <p className="text-xs text-gray-500">
            {formatDateTime(session.scheduledDate)} · {session.source === "LIVEKIT" ? "In-app classroom" : "External link"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatMinutes(session.billableMinutes)}</span>
          {session.billableMinutes < session.scheduledMinutes && (
            <span className="text-xs text-gray-400">of {formatMinutes(session.scheduledMinutes)}</span>
          )}
          <Badge variant={review.variant}>{review.label}</Badge>
        </div>
      </div>
      {(notes.length > 0 || capped || session.flagReason) && (
        <div className="space-y-1 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {session.trust && session.trust !== "HIGH" && (
            <p className="font-medium">{SESSION_TRUST_LABELS[session.trust]}</p>
          )}
          {notes.map((flag) => (
            <p key={flag}>• {SESSION_FLAG_LABELS[flag]}</p>
          ))}
          {capped && <p>• You ran over - only the scheduled time is counted and paid.</p>}
          {session.flagReason && <p>• Reviewer note: {session.flagReason}</p>}
        </div>
      )}
    </li>
  );
}

export default function TutorHoursPage() {
  const { data, error, isLoading } = useCachedQuery<TutorSessionsReport>(
    "tutor-hours",
    async () => (await unwrap(GetMyTutorSessionsAction())) ?? { verifiedMinutes: 0, pendingMinutes: 0, flaggedMinutes: 0, sessions: [] },
    { ttl: 30_000, tags: ["lessons", "hours"] }
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My hours</h1>
        <p className="text-sm text-gray-500">
          The time you&apos;ve taught, and where each session stands. Payment is for approved sessions, for the time the
          class actually ran, up to its scheduled length.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error && !data ? (
        <p className="text-sm text-red-600">Couldn&apos;t load your hours: {error.message}</p>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={CheckCircle2} label="Approved (payable)" minutes={data.verifiedMinutes} tone="bg-emerald-100 text-emerald-700" />
            <Tile icon={Hourglass} label="Awaiting review" minutes={data.pendingMinutes} tone="bg-blue-100 text-blue-700" />
            <Tile icon={AlertTriangle} label="Held for a check" minutes={data.flaggedMinutes} tone="bg-amber-100 text-amber-700" />
          </div>

          <p className="flex items-start gap-2 text-sm text-gray-600">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              For classes in the in-app classroom your time is recorded automatically from when you and your student are
              both in the room. For classes on an external link, your clock-in and clock-out are compared with your
              student&apos;s - confirmed sessions are approved faster.
            </span>
          </p>

          {data.sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed py-12 text-center text-sm text-gray-500">
              Sessions you complete will show up here.
            </p>
          ) : (
            <Card>
              <ul className="divide-y">
                {data.sessions.map((s) => (
                  <SessionRow key={s.lessonId} session={s} />
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
