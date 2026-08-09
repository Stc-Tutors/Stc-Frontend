"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListStudentsForAdminAction, SuspendStudentAction, RemoveStudentAction } from "@/server/admin";
import { EnrollmentStatus, Student, studentAvatarUrl } from "@/types/student";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const STATUS_COLORS: Record<string, string> = {
  [EnrollmentStatus.ENROLLED]: "bg-green-100 text-green-700",
  [EnrollmentStatus.PENDING]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.PENDING_PARENT_CONFIRMATION]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.COMPLETED]: "bg-blue-100 text-blue-700",
  [EnrollmentStatus.CANCELLED]: "bg-gray-100 text-gray-600",
};

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
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [suspendTarget, setSuspendTarget] = useState<Student | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = async (searchTerm?: string) => {
    setIsLoading(true);
    const [res] = await ListStudentsForAdminAction({ search: searchTerm, limit: 100 });
    setStudents(res?.data ?? []);
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

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) return;
    setIsSaving(true);
    const [, error] = await SuspendStudentAction(
      suspendTarget.id,
      suspendReason.trim(),
      suspendDuration ? Number(suspendDuration) : undefined
    );
    setIsSaving(false);
    setMessage(error || `${suspendTarget.fullName} suspended`);
    setSuspendTarget(null);
    setSuspendReason("");
    setSuspendDuration("");
    load(search);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setIsSaving(true);
    const [, error] = await RemoveStudentAction(removeTarget.id);
    setIsSaving(false);
    setMessage(error || `${removeTarget.fullName} removed`);
    setRemoveTarget(null);
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

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading students...</p>
      ) : students.length === 0 ? (
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="text-xs text-gray-500">{student.studentIdCode || "—"}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
                    <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  {student.fullName}
                </TableCell>
                <TableCell>{student.grade || "—"}</TableCell>
                <TableCell>{student.parentName || "—"}</TableCell>
                <TableCell className="text-sm text-gray-500">{student.parentEmail || student.parentPhone || "—"}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[student.enrollmentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                    {student.suspensionReason ? "Suspended" : student.enrollmentStatus}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lms-home/admin/students/${student.id}`)}>
                        Student Performance
                      </DropdownMenuItem>
                      {canManageStudents && (
                        <>
                          {student.suspensionReason ? (
                            <DropdownMenuItem onClick={() => router.push(`/lms-home/admin/students/${student.id}`)}>
                              Reactivate Student
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setSuspendTarget(student)}>Suspend Student</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => setRemoveTarget(student)}>
                            Remove Student
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Suspend modal */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Student</DialogTitle>
            <DialogDescription>{suspendTarget?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (days, optional)</label>
              <Input
                type="number"
                min="1"
                placeholder="Leave blank for indefinite"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Suspension</label>
              <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Go Back</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={isSaving || !suspendReason.trim()}>
              {isSaving ? "Suspending..." : "Suspend student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm modal */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are You Sure You Want to Remove {removeTarget?.fullName}?</DialogTitle>
            <DialogDescription>
              This will remove the student&apos;s enrollment and access to all lessons, resources, and assignments.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Go Back</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isSaving}>
              {isSaving ? "Removing..." : "Remove student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
