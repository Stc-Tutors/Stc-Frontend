"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, GraduationCap, Star, Activity } from "lucide-react";
import { GetAdminOverviewAction, GetTutorPerformanceReportAction } from "@/server/admin";
import { AdminOverview } from "@/types/admin";
import SchoolPerformanceChart from "@/components/adminDashboard/SchoolPerformanceChart";
import AdminCalendar from "@/components/adminDashboard/AdminCalendar";
import AnnouncementFeed from "@/components/adminDashboard/AnnouncementFeed";
import UserManagementTable from "@/components/adminDashboard/UserManagementTable";
import AdminFinanceChart from "@/components/adminDashboard/AdminFinanceChart";
import { useUser } from "@/contexts/user-context";
import { isAdminOrAbove } from "@/lib/roles";
import { HOD_PERMISSION_LABELS } from "@/types/hod";

export default function AdminDashboardPage() {
  const { user, isLoading: isLoadingUser, hodAssignment } = useUser();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [platformRating, setPlatformRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // GET /admin/reports/overview (and the tutor-performance report) are
  // gated to STC_ADMIN/TUTOR_ADMIN/SUPER_ADMIN/ALMIGHTY_ADMIN on the backend
  // - a dedicated UserRole.HOD user (no other role) 403s on both, so this
  // platform-wide view only ever loads for an actual admin-or-above viewer.
  // A pure HOD instead sees their own scope below.
  const isAdminViewer = !isLoadingUser && !!user && isAdminOrAbove(user.role);

  useEffect(() => {
    if (!isAdminViewer) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      const [res] = await GetAdminOverviewAction();
      setOverview(res?.data ?? null);

      const [tutorsRes] = await GetTutorPerformanceReportAction();
      const rated = (tutorsRes?.data ?? []).filter((t) => t.totalRatings > 0);
      setPlatformRating(
        rated.length > 0 ? rated.reduce((sum, t) => sum + (t.averageRating ?? 0), 0) / rated.length : null
      );

      setIsLoading(false);
    };
    load();
  }, [isAdminViewer]);

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!isAdminViewer) {
    return (
      <div className="space-y-6">
        <section className="bg-[#38b6ff] p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-white">HOD Overview</h2>
          <p className="text-white mt-1">Your Head of Department scope and where to act on it.</p>
        </section>

        {!hodAssignment || hodAssignment.hodScopes.length === 0 ? (
          <p className="text-sm text-gray-500">No HOD scope assigned yet - ask a Super Admin to grant one.</p>
        ) : (
          <div className="space-y-3">
            {hodAssignment.hodScopes.map((scope, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                <p className="font-medium text-gray-900">{scope.service}</p>
                <p className="text-sm text-gray-500">{scope.permissions.map((p) => HOD_PERMISSION_LABELS[p]).join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/lms-home/admin/hod-scope" className="text-sm text-blue-600 hover:underline">
            Full scope details →
          </Link>
          <Link href="/lms-home/admin/hod-reports" className="text-sm text-blue-600 hover:underline">
            HOD Reports →
          </Link>
          <Link href="/lms-home/admin/hod-unassigned-queue" className="text-sm text-blue-600 hover:underline">
            Unassigned Queue →
          </Link>
        </div>
      </div>
    );
  }

  const enrolledStudents = overview?.enrollmentsByStatus?.ENROLLED ?? 0;
  const teachers = overview?.usersByRole?.TUTOR ?? 0;
  const activeSessions = overview
    ? Object.entries(overview.enrollmentsByStatus)
        .filter(([status]) => status === "ENROLLED")
        .reduce((sum, [, count]) => sum + count, 0)
    : 0;

  const cards = [
    { title: "Enrolled Students", value: enrolledStudents, icon: Users, iconColor: "text-blue-500", bgColor: "bg-blue-100" },
    { title: "Teachers", value: teachers, icon: GraduationCap, iconColor: "text-purple-500", bgColor: "bg-purple-100" },
    {
      title: "LMS Rating",
      value: platformRating != null ? platformRating.toFixed(1) : "—",
      icon: Star,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    { title: "Active Enrollments", value: activeSessions, icon: Activity, iconColor: "text-green-500", bgColor: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-[#38b6ff] p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-white">Admin Overview</h2>
        <p className="text-white mt-1">Platform-wide users, courses, enrollments and revenue at a glance.</p>
      </section>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading overview...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm">
              <div className={`rounded-md p-3 ${bgColor}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{value.toLocaleString?.() ?? value}</p>
                <p className="text-sm text-gray-600">{title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SchoolPerformanceChart />
        <AdminCalendar />
        <AdminFinanceChart />
        <AnnouncementFeed />
      </div>

      <UserManagementTable />
    </div>
  );
}
