"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { GetMyTutorProfileAction } from "@/server/tutor-profile";

export default function TutorProfileIncompleteBanner() {
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorProfileAction();
      setIncomplete(res?.data ? !res.data.profileCompleted : false);
    })();
  }, []);

  if (!incomplete) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-2 text-amber-800 text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>
        Your public profile isn&apos;t complete yet.{" "}
        <Link href="/lms-home/tutor/profile-details" className="underline font-medium">
          Add your bio, subjects, and availability
        </Link>{" "}
        so students and parents can see it.
      </span>
    </div>
  );
}
