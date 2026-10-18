"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, MailCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { formatDate } from "@/lib/datetime";
import { GetMyTutorApplicationAction, ReplaceMyReferenceAction, ResendMyReferenceAction } from "@/server/tutor-application";
import { referenceDaysLeft, referencesLocked } from "@/lib/tutor-references";
import type { TutorApplication } from "@/types/tutor-application";

type Slot = 1 | 2;

const slotData = (app: TutorApplication, slot: Slot) =>
  slot === 1
    ? { name: app.reference1Name, relationship: app.reference1Relationship, contact: app.reference1Contact, response: app.reference1Response }
    : { name: app.reference2Name, relationship: app.reference2Relationship, contact: app.reference2Contact, response: app.reference2Response };

function ReferenceCard({ app, slot, onChanged }: { app: TutorApplication; slot: Slot; onChanged: () => void }) {
  const ref = slotData(app, slot);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ref.name ?? "");
  const [relationship, setRelationship] = useState(ref.relationship ?? "");
  const [contact, setContact] = useState(ref.contact ?? "");
  const [busy, setBusy] = useState(false);

  if (!ref.name && !ref.contact) return null;

  const resend = async () => {
    setBusy(true);
    const [, error] = await ResendMyReferenceAction(slot);
    setBusy(false);
    if (error) return ToastError(error);
    ToastSuccess("Email sent - ask them to check their inbox and spam folder");
  };

  const replace = async () => {
    setBusy(true);
    const [, error] = await ReplaceMyReferenceAction(slot, { name, relationship: relationship || undefined, contact });
    setBusy(false);
    if (error) return ToastError(error);
    ToastSuccess("Referee updated and emailed");
    setEditing(false);
    onChanged();
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{ref.name}</p>
          <p className="text-sm text-gray-500">
            {ref.relationship ? `${ref.relationship} · ` : ""}
            {ref.contact}
          </p>
        </div>
        {ref.response ? (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Received
          </span>
        ) : (
          <span className="text-sm font-medium text-amber-600">Waiting for their reply</span>
        )}
      </div>

      {!ref.response && !editing && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={resend} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck className="mr-2 h-4 w-4" />}
            Send the email again
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>
            Use a different referee
          </Button>
        </div>
      )}

      {editing && (
        <div className="mt-3 space-y-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="How they know you (e.g. former head of department)" />
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Their email address" type="email" />
          <div className="flex gap-2">
            <Button size="sm" onClick={replace} disabled={busy || !name.trim() || !contact.trim()}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save and email them
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// An approved tutor's references: who has replied, who hasn't, and the way to chase or replace a referee. Reachable even when the
// dashboard is locked for missing references - this page is how it gets unlocked.
export default function TutorReferencesPage() {
  const [app, setApp] = useState<TutorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [res] = await GetMyTutorApplicationAction();
    setApp(res?.data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) return <div className="flex items-center gap-2 py-8 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;
  if (!app) return <p className="py-8 text-sm text-gray-600">No application found for this account.</p>;

  const locked = referencesLocked(app);
  const days = referenceDaysLeft(app);
  const allIn = !!(!app.reference1Contact || app.reference1Response) && !!(!app.reference2Contact || app.reference2Response);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Your references</h1>
        <p className="text-sm text-gray-600">We ask two people who know your teaching to vouch for you. Both need to reply.</p>
      </div>

      {locked && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The deadline ({app.referenceDeadline ? formatDate(app.referenceDeadline) : ""}) has passed, so the rest of your dashboard is locked. It opens again as soon as
            every reference has arrived - resend the email below, or give us a different referee.
          </span>
        </div>
      )}
      {!locked && !allIn && days !== null && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Both references must be in {days <= 0 ? "today" : `within ${days} day${days === 1 ? "" : "s"}`} (by {formatDate(app.referenceDeadline!)}), or your dashboard will be locked.
        </div>
      )}
      {allIn && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">All your references are in - thank you.</div>}

      <ReferenceCard app={app} slot={1} onChanged={load} />
      <ReferenceCard app={app} slot={2} onChanged={load} />
    </div>
  );
}
