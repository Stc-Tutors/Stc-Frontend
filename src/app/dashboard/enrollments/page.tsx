"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { lmsEnrollmentBasePath } from "@/config/routes";
import Loader from "@/components/loading";

// Enrollment now lives inside the LMS - this route just forwards
// authenticated users (and any old bookmarks/links) to the right place.
export default function EnrollmentsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      router.replace(lmsEnrollmentBasePath(user?.role));
    }
  }, [isLoading, user, router]);

  return <Loader />;
}
