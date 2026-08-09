"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetEnrollmentsByStatusAction } from "@/server/admin";
import { EnrollmentStatus, Student } from "@/types/student";

export default function AdminEnrollmentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        Object.values(EnrollmentStatus).map((status) => GetEnrollmentsByStatusAction(status))
      );
      const all = results.flatMap(([res]) => res?.data ?? []);
      setStudents(all);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Enrollments</h1>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading enrollments...</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No enrollments yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Parent Email</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.parentEmail || "Hidden"}</TableCell>
                <TableCell>{s.serviceDetails?.selectedSubjects?.join(", ")}</TableCell>
                <TableCell>{s.enrollmentStatus}</TableCell>
                <TableCell className="text-right">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => router.push(`/lms-home/admin/enrollments/${s.id}`)}
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
