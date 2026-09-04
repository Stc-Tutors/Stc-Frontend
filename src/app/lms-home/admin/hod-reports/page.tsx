"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { GetHodOverviewAction, HodScopeOverview } from "@/server/hod";
import { HodDetailedReportTable } from "@/components/hod/HodDetailedReportTable";
import { HodPermission } from "@/types/hod";

// VIEW_REPORTS-scoped view of an HOD's own service(s) - one card per scope,
// not a blended platform-wide total (see stcbe's HodService.getScopeOverview).
export default function HodReportsPage() {
  const { hasHodPermission, isLoading: isLoadingUser } = useUser();
  const [overview, setOverview] = useState<HodScopeOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canView = hasHodPermission(HodPermission.VIEW_REPORTS);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetHodOverviewAction();
    if (error) toast.error(error);
    setOverview(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (canView) load();
    else setIsLoading(false);
  }, [canView, load]);

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">HOD Reports</h1>
        <p className="text-sm text-gray-500">
          You need View Reports granted on at least one HOD scope to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">HOD Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Courses, tutors and enrollments within your scope(s).</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : overview.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing to report yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview.map((scope, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <p className="font-medium text-gray-900">{scope.service}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-semibold text-gray-800">{scope.totalCourses}</p>
                  <p className="text-xs text-gray-500">Courses</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800">{scope.tutorCount}</p>
                  <p className="text-xs text-gray-500">Tutors</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800">{scope.totalEnrollments}</p>
                  <p className="text-xs text-gray-500">Enrollments</p>
                </div>
              </div>
              {Object.keys(scope.coursesByStatus).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-500">
                  {Object.entries(scope.coursesByStatus).map(([status, count]) => (
                    <span key={status}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && overview.length > 0 && <HodDetailedReportTable />}
    </div>
  );
}
