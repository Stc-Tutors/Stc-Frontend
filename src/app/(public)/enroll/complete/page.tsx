import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { GetUserAction } from "@/server/user";
import { GetMyStudentsAction } from "@/server/bootstrap";
import { EnrollmentStatus } from "@/types/student";
import { lmsDashboardPath } from "@/config/routes";
import ResendVerificationButton from "@/components/shared/ResendVerificationButton";

export const metadata: Metadata = { title: "Enrolment" };

// Where the /enroll page sends a family after paying (or leaving the wizard).
// An unverified family can't open the LMS yet, so this says what's done and
// what's left: verify the email, then the dashboard opens.
export default async function EnrollCompletePage() {
  const [res] = await GetUserAction();
  const user = res?.data;
  if (!user) redirect("/enroll");

  const [students] = await GetMyStudentsAction();
  const list = students ?? [];
  const enrolled = list.some(
    (s) => s.enrollmentStatus !== EnrollmentStatus.DRAFT && s.enrollmentStatus !== EnrollmentStatus.PENDING
  );
  const verified = user.emailVerified !== false;

  return (
    <main className="w-full flex-1 bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-5">
          <CheckCircle2 className="size-10 text-green-600" aria-hidden />
          <h1 className="text-2xl font-bold text-gray-900">{enrolled ? "You're enrolled" : "Your progress is saved"}</h1>
          <p className="text-gray-700">
            {enrolled
              ? "Thank you - we've received your enrolment. We'll match a tutor and confirm the class times with you."
              : "Everything you've entered so far is saved. You can finish and pay whenever you're ready."}
          </p>

          {!enrolled && (
            <Link href="/enroll" className="inline-block bg-[#0a7ac2] hover:bg-[#08629c] text-white text-sm font-medium px-4 py-2 rounded-md">
              Continue enrolling
            </Link>
          )}

          {verified ? (
            <Link href={lmsDashboardPath(user.role)} className="block underline underline-offset-4 text-sm text-[#0a7ac2]">
              Go to your dashboard
            </Link>
          ) : (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MailCheck className="size-5 mt-0.5 shrink-0 text-[#0a7ac2]" aria-hidden />
                <p className="text-sm text-gray-800">
                  <span className="font-medium">One last thing: verify your email.</span> We sent a link to{" "}
                  <span className="font-medium">{user.email}</span>. Your dashboard (classes, tutor, messages) opens once it&apos;s
                  verified.
                </p>
              </div>
              {user.email && <ResendVerificationButton email={user.email} />}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
