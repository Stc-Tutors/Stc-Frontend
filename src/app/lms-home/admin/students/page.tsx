"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListGroupedStudentsForAdminAction } from "@/server/admin";
import { EnrollmentStatus, GroupedStudent, studentAvatarUrl, studentLoginId } from "@/types/student";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const STATUS_COLORS: Record<string, string> = {
  [EnrollmentStatus.ENROLLED]: "bg-green-100 text-green-700",
  [EnrollmentStatus.PENDING]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.PENDING_PARENT_CONFIRMATION]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.COMPLETED]: "bg-blue-100 text-blue-700",
  [EnrollmentStatus.DRAFT]: "bg-gray-100 text-gray-500",
  [EnrollmentStatus.CANCELLED]: "bg-gray-100 text-gray-600",
};

// One badge per distinct status this child has an enrollment in, e.g. a
// child with 2 ENROLLED and 1 DRAFT shows "2 Enrolled" + "1 Draft" - lets an
// admin tell "3 active courses" apart from "1 real enrollment, 2 abandoned
// wizard drafts" without opening the profile.
function EnrollmentBadges({ statusCounts }: { statusCounts: GroupedStudent["statusCounts"] }) {
  const entries = Object.entries(statusCounts).filter(([, count]) => (count ?? 0) > 0);
  if (entries.length === 0) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1 max-w-[220px]">
      {entries.map(([status, count]) => (
        <span
          key={status}
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {count} {status.replace(/_/g, " ").toLowerCase()}
        </span>
      ))}
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading...</p>}>
      <AdminStudentsPageInner />
    </Suspense>
  );
}

function AdminStudentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useUser();
  const canManageStudents = hasPermission(AdminPermission.MANAGE_STUDENTS);
  const [children, setChildren] = useState<GroupedStudent[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);

  const load = async (searchTerm?: string) => {
    setIsLoading(true);
    const [res] = await ListGroupedStudentsForAdminAction({ search: searchTerm, limit: 100 });
    setChildren(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load(searchParams.get("search") || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        {canManageStudents && (
          <Button onClick={() => router.push("/lms-home/admin/students/new")}>
            <Plus className="w-4 h-4 mr-1" /> Add New Student
          </Button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading students...</p>
      ) : children.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No students found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Parent Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow
                key={child.childId}
                className="cursor-pointer"
                onClick={() => router.push(`/lms-home/admin/students/child/${child.childId}`)}
              >
                <TableCell className="text-xs text-gray-500">
                  {studentLoginId(child.studentUser) || child.studentIdCode || "—"}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={child.photoUrl || studentAvatarUrl(child.user)} alt={child.fullName} />
                    <AvatarFallback>{child.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  {child.fullName}
                  {child.suspended && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                  )}
                </TableCell>
                <TableCell>{child.grade || "—"}</TableCell>
                <TableCell>{child.parentName || "—"}</TableCell>
                <TableCell className="text-sm text-gray-500">{child.parentEmail || child.parentPhone || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{child.enrollmentCount}</span>
                    <EnrollmentBadges statusCounts={child.statusCounts} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="h-4 w-4 text-gray-400 inline-block" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
