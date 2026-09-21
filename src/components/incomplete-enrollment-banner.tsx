"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { EnrollmentStatus, Student } from "@/types/student";
import { hasServiceToPay } from "@/lib/enrollment-payable";

// Surfaces a child whose registration was started but never finished, right
// on the dashboard - mirrors the DRAFT/PENDING actions already in
// enrollment-list.tsx, since that dedicated list is easy to miss. DRAFT
// resumes the wizard from where it stopped (see enrollment-context.tsx's
// loadEnrollment); PENDING just needs the outstanding payment completed.
export default function IncompleteEnrollmentBanner({
  basePath,
  source,
}: {
  basePath: string;
  source: "mine" | "linked";
}) {
  const router = useRouter();
  const [incomplete, setIncomplete] = useState<Student[]>([]);
  // Children who only have a login so far - nothing unfinished, just a next step.
  const [noService, setNoService] = useState<Student[]>([]);

  useEffect(() => {
    (async () => {
      const [res] = source === "linked" ? await GetLinkedStudentsAction() : await GetEnrollmentsAction();
      const students = res?.data ?? [];
      setIncomplete(
        students.filter(
          (s) =>
            s.enrollmentStatus === EnrollmentStatus.DRAFT ||
            (s.enrollmentStatus === EnrollmentStatus.PENDING && hasServiceToPay(s))
        )
      );
      setNoService(
        source === "linked"
          ? students.filter((s) => s.enrollmentStatus === EnrollmentStatus.PENDING && !hasServiceToPay(s))
          : []
      );
    })();
  }, [source]);

  if (incomplete.length === 0 && noService.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-blue-800 font-medium">
        <AlertCircle className="w-4 h-4" />
        {incomplete.length > 0 ? "Unfinished registration" : "Next step"}
      </div>
      {incomplete.map((s) => (
        <div
          key={s.id}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-blue-700"
        >
          <p>
            <strong>{s.fullName}</strong>&apos;s registration is{" "}
            {s.enrollmentStatus === EnrollmentStatus.DRAFT ? "incomplete" : "awaiting payment"}.
          </p>
          {s.enrollmentStatus === EnrollmentStatus.DRAFT ? (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`${basePath}/new?continue=${s.id}&step=subjects`)}
            >
              Continue Registration
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                router.push(source === "linked" ? "/lms-home/parent/payments" : "/lms-home/student/payments")
              }
            >
              Complete Payment
            </Button>
          )}
        </div>
      ))}
      {noService.map((s) => (
        <div
          key={s.id}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-blue-700"
        >
          <p>
            <strong>{s.fullName}</strong> has a login but isn&apos;t enrolled in a service yet.
          </p>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/lms-home/parent/marketplace")}
          >
            Choose a service
          </Button>
        </div>
      ))}
    </div>
  );
}
