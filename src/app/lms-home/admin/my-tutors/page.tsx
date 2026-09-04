"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetUsersAction } from "@/server/admin";
import { User, UserRole } from "@/types/user";

// Read-only view of what GET /users?role=TUTOR / role=STUDENT already return
// for THIS admin - both are scoped server-side to the caller's assigned
// cluster (AdminAuthorizationService.getVisibleScope), so no client-side
// filtering or edit/reassign action is needed or possible here (reassignment
// is SUPER_ADMIN-only, via the separate tutor-allocation endpoints).
export default function AdminMyTutorsPage() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tutorsRes] = await GetUsersAction({ role: UserRole.TUTOR });
      const [studentsRes] = await GetUsersAction({ role: UserRole.STUDENT });
      setTutors(tutorsRes?.data ?? []);
      setStudents(studentsRes?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading...</p>;

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
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>{s.email || "Hidden"}</TableCell>
                  <TableCell>{s.status ?? "ACTIVE"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
