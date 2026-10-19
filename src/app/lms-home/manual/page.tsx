"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ManualViewer from "@/components/manual/manual-viewer";
import { GetManualsAction } from "@/server/docs";
import { useUser } from "@/contexts/user-context";
import { lmsDashboardPath } from "@/config/routes";
import type { ManualSectionDto } from "@/types/manual";

// One page for every signed-in role. The backend returns only the manuals that role may read, so this page needs no role logic.
export default function ManualPage() {
  const { user } = useUser();
  const [sections, setSections] = useState<ManualSectionDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    GetManualsAction().then(([res, err]) => {
      if (cancelled) return;
      if (err || !res?.data) setError(err || res?.message || "The manual could not be loaded.");
      else setSections(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 print:hidden sm:px-6">
        <Link
          href={user ? lmsDashboardPath(user.role) : "/lms-home"}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 dark:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to my dashboard
        </Link>
      </div>

      {error && <p className="mx-auto max-w-3xl p-6 text-sm text-red-600">{error}</p>}
      {!error && !sections && <p className="mx-auto max-w-3xl p-6 text-sm text-gray-500">Loading the manual...</p>}
      {sections && (
        <ManualViewer
          sections={sections}
          title="User Manual"
          intro="A plain-English guide to everything you can do on the platform and exactly how to do it. Pick a chapter, or search for a word."
        />
      )}
    </div>
  );
}
