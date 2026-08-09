"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListStudentsForAdminAction, GetTutorPerformanceReportAction } from "@/server/admin";
import { Student, studentAvatarUrl } from "@/types/student";
import { TutorPerformanceStat } from "@/types/admin";

export default function UserManagementTable() {
  const router = useRouter();
  const [tab, setTab] = useState<"students" | "tutors">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<TutorPerformanceStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (tab === "students") {
        const [res] = await ListStudentsForAdminAction({ limit: 8 });
        setStudents(res?.data ?? []);
      } else {
        const [res] = await GetTutorPerformanceReportAction();
        setTutors((res?.data ?? []).slice(0, 8));
      }
      setIsLoading(false);
    };
    load();
  }, [tab]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">User Management</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs">
          <button
            onClick={() => setTab("students")}
            className={`px-3 py-1 rounded-md ${tab === "students" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            Students
          </button>
          <button
            onClick={() => setTab("tutors")}
            className={`px-3 py-1 rounded-md ${tab === "tutors" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            Tutors
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : tab === "students" ? (
        students.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No students yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                <th className="py-2">Name</th>
                <th>Grade</th>
                <th>Parent Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-b last:border-none cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/lms-home/admin/students/${s.id}`)}
                >
                  <td className="py-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={s.photoUrl || studentAvatarUrl(s.user)} alt={s.fullName} />
                      <AvatarFallback>{s.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    {s.fullName}
                  </td>
                  <td>{s.grade || "—"}</td>
                  <td>{s.parentName || "—"}</td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      {s.suspensionReason ? "Suspended" : s.enrollmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : tutors.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No tutors yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b">
              <th className="py-2">Name</th>
              <th>Rating</th>
              <th>Hours</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {tutors.map((t) => (
              <tr
                key={t.tutorId}
                className="border-b last:border-none cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/lms-home/admin/users/${t.tutorId}`)}
              >
                <td className="py-2">{t.name}</td>
                <td>
                  {t.totalRatings > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {t.averageRating?.toFixed(1)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{t.totalHours.toFixed(1)}h</td>
                <td>{t.completionRate != null ? `${t.completionRate}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
