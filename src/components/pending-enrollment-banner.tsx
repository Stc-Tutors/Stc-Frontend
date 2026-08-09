"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { EnrollmentStatus, Student } from "@/types/student";

export default function PendingEnrollmentBanner({ basePath, source }: { basePath: string; source: "mine" | "linked" }) {
  const [pending, setPending] = useState<Student[]>([]);

  useEffect(() => {
    (async () => {
      const [res] = source === "linked" ? await GetLinkedStudentsAction() : await GetEnrollmentsAction();
      const students = res?.data ?? [];
      setPending(students.filter((s) => s.enrollmentStatus === EnrollmentStatus.PENDING_PARENT_CONFIRMATION));
    })();
  }, [source]);

  if (pending.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-800 font-medium">
        <AlertCircle className="w-4 h-4" />
        Action needed
      </div>
      {pending.map((s) => (
        <p key={s.id} className="text-sm text-amber-700">
          <strong>{s.fullName}</strong>{" "}
          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-xs font-medium align-middle">
            Pending Verification
          </span>{" "}
          - an admin added this profile on your behalf.{" "}
          <Link href={`${basePath}/${s.id}`} className="underline font-medium">
            Review and confirm the details
          </Link>
          .
        </p>
      ))}
    </div>
  );
}
