"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ResendVerificationAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

export default function ResendVerificationButton({ email, className }: { email: string; className?: string }) {
  const [sending, setSending] = useState(false);
  return (
    <button
      type="button"
      disabled={sending}
      onClick={async () => {
        setSending(true);
        const [res, error] = await ResendVerificationAction(email);
        setSending(false);
        if (error) ToastError(error);
        else ToastSuccess(res?.message || "Verification email sent");
      }}
      className={className ?? "inline-flex items-center text-sm font-medium text-[#0a7ac2] underline underline-offset-4 disabled:opacity-60"}
    >
      {sending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
      Resend the email
    </button>
  );
}
