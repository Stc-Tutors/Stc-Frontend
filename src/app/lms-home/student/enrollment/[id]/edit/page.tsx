"use client";

import { useParams } from "next/navigation";
import EditEnrollmentForm from "@/components/edit-enrollment-form";

export default function StudentEnrollmentEditPage() {
  const { id } = useParams();
  return <EditEnrollmentForm enrollmentId={id as string} basePath="/lms-home/student/enrollment" />;
}
