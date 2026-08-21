"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Pencil } from "lucide-react";
import {
  GetTutorApplicationStatusAction,
  GetTutorApplicationSupportMessagesAction,
  SendTutorApplicationSupportMessageAction,
} from "@/server/tutor-application";
import { TutorApplicationStatus } from "@/types/tutor-application";
import { Message } from "@/types/message";
import { FLAGGABLE_FIELDS_BY_ID } from "@/lib/tutor-application-fields";

const STATUS_STORAGE_KEY = "stc_tutor_application_status";
// Same key tutor-application-context.tsx reads on the wizard page - writing
// to it here (with the status token standing in for a draft token, which
// stcbe's tutorApplicationEditMiddleware accepts either of) lets "Edit this
// section" reuse the entire wizard instead of building a second editor.
const DRAFT_STORAGE_KEY = "stc_tutor_application_draft";

const STATUS_LABELS: Record<TutorApplicationStatus, string> = {
  [TutorApplicationStatus.DRAFT]: "Draft",
  [TutorApplicationStatus.PENDING]: "Pending Review",
  [TutorApplicationStatus.RECOMMENDED]: "Under Final Review",
  [TutorApplicationStatus.NEEDS_MORE_INFO]: "Needs More Info",
  [TutorApplicationStatus.APPROVED]: "Approved",
  [TutorApplicationStatus.REJECTED]: "Not Approved",
};

const STATUS_COLORS: Record<TutorApplicationStatus, string> = {
  [TutorApplicationStatus.DRAFT]: "bg-gray-100 text-gray-700",
  [TutorApplicationStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TutorApplicationStatus.RECOMMENDED]: "bg-blue-100 text-blue-800",
  [TutorApplicationStatus.NEEDS_MORE_INFO]: "bg-orange-100 text-orange-800",
  [TutorApplicationStatus.APPROVED]: "bg-green-100 text-green-800",
  [TutorApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
};

function readStatusRef(): { applicationId: string; statusToken: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STATUS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.applicationId && parsed?.statusToken) return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function TutorApplicationStatusView() {
  const router = useRouter();
  const [ref, setRef] = useState<{ applicationId: string; statusToken: string } | null>(null);
  const [status, setStatus] = useState<TutorApplicationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);
  const [needsMoreInfoNote, setNeedsMoreInfoNote] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStatusRef();
    setRef(stored);
    if (!stored) {
      setError("We couldn't find your application on this device. Use the link from your confirmation email instead.");
      setIsLoading(false);
      return;
    }
    Promise.all([
      GetTutorApplicationStatusAction(stored.applicationId, stored.statusToken),
      GetTutorApplicationSupportMessagesAction(stored.applicationId, stored.statusToken),
    ]).then(([[statusRes, statusErr], [messagesRes]]) => {
      if (statusErr || !statusRes?.data) {
        setError(statusErr || "Could not load your application status");
      } else {
        setStatus(statusRes.data.status);
        setRejectionReason(statusRes.data.rejectionReason);
        setFlaggedFields(statusRes.data.flaggedFields ?? []);
        setNeedsMoreInfoNote(statusRes.data.needsMoreInfoNote);
      }
      setMessages(messagesRes?.data ?? []);
      setIsLoading(false);
    });
  }, []);

  const handleEditSection = (step: number) => {
    if (!ref) return;
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ applicationId: ref.applicationId, draftToken: ref.statusToken })
    );
    router.push(`/auth/apply-tutor?editStep=${step}`);
  };

  const handleSend = async () => {
    if (!ref || !newMessage.trim()) return;
    setIsSending(true);
    const [res, err] = await SendTutorApplicationSupportMessageAction(ref.applicationId, ref.statusToken, newMessage.trim());
    if (res?.data) {
      setMessages((prev) => [...prev, res.data!]);
      setNewMessage("");
    } else if (err) {
      setError(err);
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-8 text-center text-sm text-gray-600">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Application Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {status && <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>}
          {status === TutorApplicationStatus.PENDING && (
            <p className="text-sm text-gray-600">
              Our team is reviewing your application. We&apos;ll email you as soon as there&apos;s an update.
            </p>
          )}
          {status === TutorApplicationStatus.RECOMMENDED && (
            <p className="text-sm text-gray-600">Your application has passed the first review and is awaiting final approval.</p>
          )}
          {status === TutorApplicationStatus.NEEDS_MORE_INFO && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Our team needs a bit more from you before they can continue reviewing.
              </p>
              {needsMoreInfoNote && (
                <p className="text-sm bg-orange-50 border border-orange-200 text-orange-800 rounded-md p-3">
                  {needsMoreInfoNote}
                </p>
              )}
              {flaggedFields.length > 0 && (
                <div className="space-y-2">
                  {flaggedFields.map((fieldId) => {
                    const field = FLAGGABLE_FIELDS_BY_ID[fieldId];
                    return (
                      <div key={fieldId} className="flex items-center justify-between border rounded-md p-2 text-sm">
                        <span>{field ? `${field.label} (${field.stepTitle})` : fieldId}</span>
                        {field && (
                          <Button variant="outline" size="sm" onClick={() => handleEditSection(field.step)}>
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <Button onClick={() => handleEditSection(flaggedFields.length > 0 ? (FLAGGABLE_FIELDS_BY_ID[flaggedFields[0]]?.step ?? 3) : 3)}>
                Update My Application
              </Button>
            </div>
          )}
          {status === TutorApplicationStatus.APPROVED && (
            <p className="text-sm text-gray-600">You&apos;re approved! You can now log in and set up your tutor profile.</p>
          )}
          {status === TutorApplicationStatus.REJECTED && (
            <p className="text-sm text-gray-600">
              We won&apos;t be moving forward with your application at this time.
              {rejectionReason ? ` Reason: ${rejectionReason}` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet - ask us anything about your application.</p>}
            {messages.map((m) => (
              <div key={m.id} className="text-sm border rounded-md p-2">
                <p>{m.body}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your question..."
              rows={2}
            />
            <Button onClick={handleSend} disabled={isSending || !newMessage.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {error && status && <p className="text-red-600 text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
