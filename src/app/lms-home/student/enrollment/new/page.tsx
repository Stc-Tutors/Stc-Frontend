"use client";

import dynamic from "next/dynamic";
import { EnrollmentProvider } from "@/contexts/enrollment-context";
import { IntakeGate } from "@/components/intake-closed";
import { ROUTES } from "@/config/routes";

const EnrollmentFlow = dynamic(() => import("@/components/enrollment-flow"), { ssr: false });

export default function NewStudentEnrollmentPage() {
  return (
    <IntakeGate targets={["ENROLLMENT"]} backHref={ROUTES.LMS.STUDENT.ENROLLMENT}>
    <EnrollmentProvider>
      <EnrollmentFlow
        forcedUserType="student"
        dashboardPath={ROUTES.LMS.STUDENT.ENROLLMENT}
        paymentHistoryPath={ROUTES.LMS.STUDENT.PAYMENT_HISTORY}
      />
    </EnrollmentProvider>
    </IntakeGate>
  );
}
