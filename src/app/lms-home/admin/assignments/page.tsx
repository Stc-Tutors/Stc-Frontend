"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApproveAssignmentAction,
  GetPendingAssignmentsForAdminAction,
  RejectAssignmentAction,
} from "@/server/assignment";
import { Assignment, AssignmentCourseRef } from "@/types/assignment";

export default function AdminAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetPendingAssignmentsForAdminAction();
    setRows(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveAssignmentAction(id);
    setMessage(error || "Assignment approved - now visible to students");
    load();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    const [, error] = await RejectAssignmentAction(id, reason);
    setMessage(error || "Assignment rejected");
    load();
  };

  const courseTitle = (course: Assignment["course"]) =>
    typeof course === "string" ? course : (course as AssignmentCourseRef).title;
  const creatorName = (createdBy: Assignment["createdBy"]) =>
    typeof createdBy === "string" ? createdBy : `${createdBy.firstName} ${createdBy.lastName}`;

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assignment Approvals</h1>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Tutors without an assignment auto-approve grant (set by a super admin on their profile) have their
        assignments held here until an admin approves them - students can't see a pending assignment.
      </p>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No assignments awaiting approval.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{courseTitle(row.course)}</TableCell>
                <TableCell>{creatorName(row.createdBy)}</TableCell>
                <TableCell className="text-xs text-gray-500">{new Date(row.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleApprove(row.id)}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleReject(row.id)}>
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
