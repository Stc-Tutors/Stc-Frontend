"use client";

import { useEffect, useState } from "react";
import { GetMyTutorApplicationAction } from "@/server/tutor-application";
import { TutorApplication } from "@/types/tutor-application";
import FullApplicationDetails from "./full-application-details";

// The tutor-facing half of crossCuttingRequirements.fullVisibilityPrinciple:
// every field captured at registration, visible on the tutor's own profile -
// not just to admins. Built from the exact same TUTOR_FIELD_REGISTRY as the
// admin's FullApplicationDetails (via the shared component itself), so this
// can never drift out of sync with what admins see. Read-only: the fields
// here that are meant to be kept up to date live editable elsewhere on this
// profile page (bio, subjects, availability, etc. - see
// crossCuttingRequirements.postApprovalEditing, which flags that per-field
// edit-vs-re-review triage as still unresolved) - this section is the
// permanent record of what was actually submitted at registration.
export default function MyApplicationRecord() {
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorApplicationAction();
      setApplication(res?.data ?? null);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) return <p className="text-sm text-gray-500">Loading your registration record...</p>;
  if (!application) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Everything you submitted when you applied. This is a permanent record - some of it (bio, subjects, availability,
        and the rest of the sections above) can be updated directly on this page; the rest can be changed by contacting
        STC support.
      </p>
      <FullApplicationDetails app={application} />
    </div>
  );
}
