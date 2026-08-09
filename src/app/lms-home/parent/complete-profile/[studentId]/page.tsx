"use client";

import { useParams } from "next/navigation";
import CompleteProfileForm from "@/components/complete-profile-form";

export default function ParentCompleteProfilePage() {
  const { studentId } = useParams();
  return <CompleteProfileForm studentId={studentId as string} dashboardPath="/lms-home/parent/dashboard" />;
}
