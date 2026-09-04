"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { GetScopedTutorsAction } from "@/server/hod";
import { HodBroadcastDialog } from "@/components/hod/HodBroadcastDialog";
import { HodPermission } from "@/types/hod";
import { User, UserStatus } from "@/types/user";

// Tutors related to the caller's own HOD scope only (see stcbe's
// HodService.getScopedTutors) - never the whole platform roster. Contact
// info (email/phone) is redacted server-side regardless of role or status
// filter - reach a tutor through in-LMS messaging or an admin instead.
export default function HodTutorsPage() {
  const { hasHodPermission, isLoading: isLoadingUser } = useUser();
  const [tutors, setTutors] = useState<Partial<User>[]>([]);
  const [status, setStatus] = useState<UserStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);

  // Mirrors HodAuthorizationService.getVisibleTutorIds, which resolves
  // scoped tutors off MANAGE_COURSES/VIEW_REPORTS courses - either grant is
  // sufficient here, same as the underlying backend query.
  const canView = hasHodPermission(HodPermission.MANAGE_COURSES) || hasHodPermission(HodPermission.VIEW_REPORTS);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetScopedTutorsAction(status || undefined);
    if (error) toast.error(error);
    setTutors(res?.data ?? []);
    setIsLoading(false);
  }, [status]);

  useEffect(() => {
    if (canView) load();
    else setIsLoading(false);
  }, [canView, load]);

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">My Tutors (HOD Scope)</h1>
        <p className="text-sm text-gray-500">
          You need Manage Courses or View Reports granted on at least one HOD scope to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tutors (HOD Scope)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tutors teaching within your HOD scope(s) only. Contact details are hidden here - use messaging or go
            through an admin to reach a tutor directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus | "")}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {Object.values(UserStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <HodBroadcastDialog />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-6">Loading...</p>
        ) : tutors.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No tutors in your scope yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tutors.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/lms-home/profile/${t.id}`} className="text-blue-600 hover:underline">
                      {t.firstName} {t.lastName}
                    </Link>
                  </td>
                  <td className="p-3">{t.status ?? "ACTIVE"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
