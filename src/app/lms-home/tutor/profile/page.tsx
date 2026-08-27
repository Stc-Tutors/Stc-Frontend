"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Folded into "/lms-home/tutor/profile-details" (now labeled just
// "Profile" in the sidebar) so there's one page for a tutor's account +
// profile instead of two. This route stays as a redirect for anyone with
// the old link/bookmark.
export default function TutorProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lms-home/tutor/profile-details");
  }, [router]);

  return null;
}
