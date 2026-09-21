"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { VerifyEmailAction } from "@/server/auth";
import { ROUTES } from "@/config/routes";

// A verification token is single-use, so running the request twice makes the
// second call fail with "invalid or expired" even though the first one worked
// (React strict mode double-runs effects in dev, and some mail clients/scanners
// open the link before the person does). Sharing one in-flight request per
// token keeps a successful verification from being overwritten by that error.
const inFlight = new Map<string, ReturnType<typeof VerifyEmailAction>>();
function verifyOnce(token: string) {
  let request = inFlight.get(token);
  if (!request) {
    request = VerifyEmailAction(token);
    inFlight.set(token, request);
  }
  return request;
}

export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }
      const [res, error] = await verifyOnce(token);
      if (res) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("error");
        setMessage(
          error
            ? `${error.replace(/\.$/, "")}. If you have already verified your email, you can log in.`
            : "Verification failed. If you have already verified your email, you can log in."
        );
      }
    };
    run();
  }, [token]);

  return (
    <div className="text-center space-y-4">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-600">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
          <p className="text-gray-700">{message}</p>
          <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4 text-sm">
            Continue to login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="text-gray-700">{message}</p>
          <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4 text-sm">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}
