"use client";

import { useEffect, useState } from "react";
import InlineLoader from "@/components/shared/InlineLoader";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetUsersAction, ListStudentsForAdminAction } from "@/server/admin";
import { User, UserRole } from "@/types/user";
import { Student } from "@/types/student";

// Read-only view of what GET /users?role=TUTOR and /enrollments/admin/all
// already return for THIS admin - both are scoped server-side to the
// caller's assigned cluster (AdminAuthorizationService.getVisibleScope /
// StudentService.applyAdminScope), so no client-side filtering or
// edit/reassign action is needed or possible here (reassignment is
// SUPER_ADMIN-only, via the separate tutor-allocation endpoints).
export default function AdminMyTutorsPage() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  // studentId -> tutor full name, built by asking listAllForAdmin's existing
  // `tutorId` filter for each in-scope tutor's own roster (one call per
  // tutor - the "reverse" of subject/tutor id lookup, since Student itself
  // carries no tutor reference) - the same subject/tutorId filter the
  // Reports/Resources pickers already rely on, not new backend work.
  const [tutorNameByStudentId, setTutorNameByStudentId] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tutorsRes] = await GetUsersAction({ role: UserRole.TUTOR });
      const scopedTutors = tutorsRes?.data ?? [];
      setTutors(scopedTutors);

      const [studentsRes] = await ListStudentsForAdminAction({ limit: 200 });
      setStudents(studentsRes?.data ?? []);

      const perTutorResults = await Promise.all(
        scopedTutors.map((t) => ListStudentsForAdminAction({ tutorId: t.id, limit: 200 }))
      );
      const byStudentId: Record<string, string> = {};
      perTutorResults.forEach(([res], i) => {
        const tutorName = `${scopedTutors[i].firstName} ${scopedTutors[i].lastName}`;
        for (const s of res?.data ?? []) byStudentId[s.id] = tutorName;
      });
      setTutorNameByStudentId(byStudentId);

      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <InlineLoader />;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">My Tutors</h1>
        <p className="text-sm text-gray-500 mb-4">
          Tutors and students within your assigned scope. This is read-only - tutor/student
          reassignment is managed by a Super Admin.
        </p>

        {tutors.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No tutors in your scope.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link href={`/lms-home/profile/${t.id}`} className="text-blue-600 hover:underline">
                      {t.firstName} {t.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{t.email || "Hidden"}</TableCell>
                  <TableCell>{t.status ?? "ACTIVE"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">Students in Your Scope</h2>
        <p className="text-sm text-gray-500 mb-4">
          Students allocated to your assigned tutors (and their parents, where linked).
        </p>

        {students.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No students in your scope.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.parentName || "-"}</TableCell>
                  <TableCell>{tutorNameByStudentId[s.id] ?? "-"}</TableCell>
                  <TableCell>{s.enrollmentStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
