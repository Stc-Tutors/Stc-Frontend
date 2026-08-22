"use client";

import { useUser } from "@/contexts/user-context";
import { Badge } from "@/components/ui/badge";
import { HOD_PERMISSION_LABELS } from "@/types/hod";

// "Express the permission given to them" - the one page every HOD-scoped
// user (whatever their base role) can check to see exactly what they've
// been granted, since HOD status is additive and otherwise invisible in
// the rest of the UI. Read-only - scopes are edited from Stc-SuperAdmin's
// HOD Assignments page.
export default function HodScopePage() {
  const { hodAssignment, isLoading } = useUser();

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!hodAssignment || hodAssignment.hodScopes.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">My HOD Scope</h1>
        <p className="text-sm text-gray-500">
          You don&apos;t hold any Head of Department scope yet. This page will list what you&apos;ve been granted
          once a Super Admin assigns one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My HOD Scope</h1>
        <p className="text-gray-500 text-sm mt-1">
          What you&apos;ve been granted as Head of Department - additive to your normal account role, not a
          replacement for it.
        </p>
      </div>

      <div className="space-y-3">
        {hodAssignment.hodScopes.map((scope, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <p className="font-medium text-gray-900">{scope.service}</p>

            {scope.taxonomyNodeIds && scope.taxonomyNodeIds.length > 0 && (
              <p className="text-sm text-gray-600">{scope.taxonomyNodeIds.length} curriculum node(s) scoped</p>
            )}
            {scope.courseIds && scope.courseIds.length > 0 && (
              <p className="text-sm text-gray-600">{scope.courseIds.length} specific course(s) scoped</p>
            )}
            {scope.context && (
              <p className="text-sm text-gray-600">
                {Object.entries(scope.context)
                  .filter(([, v]) => v?.length)
                  .map(([field, v]) => `${field}: ${(v as string[]).join(", ")}`)
                  .join(" · ")}
              </p>
            )}
            {scope.subjects && scope.subjects.length > 0 && (
              <p className="text-sm text-gray-600">Subjects: {scope.subjects.join(", ")}</p>
            )}
            {!scope.taxonomyNodeIds?.length && !scope.courseIds?.length && !scope.context && !scope.subjects?.length && (
              <p className="text-sm text-gray-400">Whole service - no further narrowing.</p>
            )}

            <div className="flex flex-wrap gap-1 pt-1">
              {scope.permissions.map((p) => (
                <Badge key={p} variant="secondary">
                  {HOD_PERMISSION_LABELS[p]}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
