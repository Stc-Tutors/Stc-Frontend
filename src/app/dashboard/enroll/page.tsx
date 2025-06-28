'use client';

import { EnrollmentProvider } from "@/contexts/enrollment-context";
import EnrollmentFlow from "@/components/enrollment-flow";

export default function EnrollPage() {
  return (
    <EnrollmentProvider>
      <EnrollmentFlow />
    </EnrollmentProvider>
  )
}
