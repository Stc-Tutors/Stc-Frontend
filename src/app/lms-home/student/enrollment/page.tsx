"use client";

import EnrollmentList from "@/components/enrollment-list";

export default function StudentEnrollmentPage() {
  return <EnrollmentList source="mine" basePath="/lms-home/student/enrollment" />;
}
