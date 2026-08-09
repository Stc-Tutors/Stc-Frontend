"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { lmsEnrollmentBasePath } from "@/config/routes";
import Loader from "@/components/loading";

// Enrollment now lives inside the LMS - this route just forwards
// authenticated users (including the backend notification deep link
// StudentService.updateStatus still generates) to the right place.
export default function EnrollmentDetailRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useUser();
  const enrollmentId = params?.id as string;

  useEffect(() => {
    if (!isLoading) {
      router.replace(`${lmsEnrollmentBasePath(user?.role)}/${enrollmentId}`);
    }
  }, [isLoading, user, router, enrollmentId]);

  return <Loader />;
}
