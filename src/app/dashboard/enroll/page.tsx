"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { lmsEnrollmentBasePath } from "@/config/routes";
import Loader from "@/components/loading";

// Enrollment now lives inside the LMS - this route just forwards
// authenticated users (and any old bookmarks/links) to the right place.
export default function EnrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      const service = searchParams.get("service");
      const target = `${lmsEnrollmentBasePath(user?.role)}/new`;
      router.replace(service ? `${target}?service=${service}` : target);
    }
  }, [isLoading, user, router, searchParams]);

  return <Loader />;
}
