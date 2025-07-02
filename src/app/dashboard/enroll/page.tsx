'use client';

import dynamic from 'next/dynamic';
import { EnrollmentProvider } from "@/contexts/enrollment-context";
// import EnrollmentFlow from "@/components/enrollment-flow";
 
const EnrollmentFlow = dynamic(
  () => import('@/components/enrollment-flow'),
  { ssr: false }
)

export default function EnrollPage() {
  return (
    <EnrollmentProvider>
      <EnrollmentFlow />
    </EnrollmentProvider>
  )
}
