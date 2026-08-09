"use client";

import EnrollmentList from "@/components/enrollment-list";

export default function ParentEnrollmentPage() {
  return <EnrollmentList source="linked" basePath="/lms-home/parent/enrollment" />;
}
