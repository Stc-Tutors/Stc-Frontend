"use client";

import dynamic from "next/dynamic";
import { EnrollmentProvider } from "@/contexts/enrollment-context";
import { ROUTES } from "@/config/routes";

const EnrollmentFlow = dynamic(() => import("@/components/enrollment-flow"), { ssr: false });

export default function NewParentEnrollmentPage() {
  return (
    <EnrollmentProvider>
      <EnrollmentFlow
        forcedUserType="parent"
        dashboardPath={ROUTES.LMS.PARENT.ENROLLMENT}
        paymentHistoryPath={ROUTES.LMS.PARENT.PAYMENT_HISTORY}
      />
    </EnrollmentProvider>
  );
}
