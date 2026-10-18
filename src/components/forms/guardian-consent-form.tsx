"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { GuardianConsentConfirmAction, GuardianConsentPreviewAction } from "@/server/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ToastError } from "../ui/custom/toast";

type Preview = { childName: string; parentEmail: string; expiresAt: string };

// Shown to the parent after they open the emailed link. Confirming needs three things together: the link itself, a PARENT account signed
// in with the email the link was sent to (the server checks this), and the declaration below.
export default function GuardianConsentForm({ token, signedIn }: { token: string; signedIn: boolean }) {
  const [state, setState] = useState<"loading" | "ready" | "invalid" | "done">("loading");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [relationship, setRelationship] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setMessage("This link is missing its confirmation code. Please use the link in the email exactly as it was sent.");
      return;
    }
    GuardianConsentPreviewAction(token).then(([res, error]) => {
      if (res?.data) {
        setPreview(res.data);
        setState("ready");
      } else {
        setState("invalid");
        setMessage(error ?? "This confirmation link is invalid or has expired.");
      }
    });
  }, [token]);

  const next = `/guardian-consent?token=${encodeURIComponent(token)}`;

  const confirm = async () => {
    setSubmitting(true);
    const [res, error] = await GuardianConsentConfirmAction({ token, relationship: relationship.trim(), accept: accepted });
    setSubmitting(false);
    if (res) {
      setMessage(res.message);
      setState("done");
    } else {
      ToastError(error ?? "Could not confirm. Please try again.");
    }
  };

  if (state === "loading") {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
        <p className="text-gray-600">Checking your link...</p>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="text-center space-y-4">
        <XCircle className="mx-auto h-10 w-10 text-red-500" />
        <p className="text-gray-700">{message}</p>
        <p className="text-sm text-gray-500">The student can ask for a new link from the login page.</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <p className="text-gray-700">{message}</p>
        <Link href="/lms-home" className="underline underline-offset-4 text-sm">
          Go to my dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm text-gray-700">
      <p>
        <strong>{preview?.childName}</strong> signed up and named this email address ({preview?.parentEmail}) as their parent or guardian. Because
        they are under 18, they cannot use the account until you confirm it.
      </p>

      {!signedIn ? (
        <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p>To confirm, sign in to (or create) a parent account using the same email address this link was sent to.</p>
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href={`/auth/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/auth/register?next=${encodeURIComponent(next)}&role=PARENT`}>Create parent account</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="font-medium" htmlFor="relationship">
              Your relationship to {preview?.childName}
            </label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Mother, Father, Legal guardian"
            />
          </div>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>
              I confirm I am {preview?.childName}&apos;s parent or legal guardian, that they may use this platform, and that I take responsibility
              for their use of it.
            </span>
          </label>
          <Button className="w-full" disabled={submitting || !accepted || relationship.trim().length < 2} onClick={confirm}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm account
          </Button>
          <p className="text-xs text-gray-500">
            Signed in with a different email? Log out, then open the link in the email again.
          </p>
        </div>
      )}
    </div>
  );
}
