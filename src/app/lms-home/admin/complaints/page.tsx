"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatDate } from "@/lib/datetime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetAllComplaintsAction, AssignComplaintAction, ResolveComplaintAction } from "@/server/complaint";
import { GetUserByIdAction, GetUsersAction } from "@/server/admin";
import { Complaint, ComplaintCategory, ComplaintStatus } from "@/types/complaint";
import { User, UserRole } from "@/types/user";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const ASSIGNEE_ROLES = [UserRole.HOD, UserRole.STC_ADMIN, UserRole.TUTOR_ADMIN, UserRole.SUPER_ADMIN];

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  [ComplaintCategory.PAYMENT]: "Payment",
  [ComplaintCategory.TUTOR_CONDUCT]: "Tutor Conduct",
  [ComplaintCategory.STUDENT_CONDUCT]: "Student Conduct",
  [ComplaintCategory.SESSION_QUALITY]: "Session Quality",
  [ComplaintCategory.TECHNICAL]: "Technical",
  [ComplaintCategory.OTHER]: "Other",
};

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.OPEN]: "bg-amber-100 text-amber-700",
  [ComplaintStatus.INVESTIGATING]: "bg-blue-100 text-blue-700",
  [ComplaintStatus.RESOLVED]: "bg-green-100 text-green-700",
  [ComplaintStatus.DISMISSED]: "bg-gray-100 text-gray-700",
};

export default function AdminComplaintsPage() {
  const { hasPermission } = useUser();
  const canManageComplaints = hasPermission(AdminPermission.MANAGE_COMPLAINTS);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeRole, setAssigneeRole] = useState<UserRole>(UserRole.STC_ADMIN);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [assigneeResults, setAssigneeResults] = useState<User[]>([]);
  const [assignedToName, setAssignedToName] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ComplaintStatus.RESOLVED | ComplaintStatus.DISMISSED>(
    ComplaintStatus.RESOLVED
  );
  const [resolutionNotes, setResolutionNotes] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetAllComplaintsAction({
      status: (statusFilter as ComplaintStatus) || undefined,
      category: (categoryFilter as ComplaintCategory) || undefined,
    });
    setComplaints(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = complaints.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected?.assignedTo) {
      setAssignedToName(null);
      return;
    }
    GetUserByIdAction(selected.assignedTo).then(([res]) => {
      setAssignedToName(res?.data ? `${res.data.firstName} ${res.data.lastName}` : null);
    });
  }, [selected?.assignedTo]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      GetUsersAction({ role: assigneeRole, search: assigneeSearch || undefined, limit: 10 }).then(([res]) =>
        setAssigneeResults(res?.data ?? [])
      );
    }, 250);
    return () => clearTimeout(timeout);
  }, [assigneeRole, assigneeSearch]);

  const handleAssign = async () => {
    if (!selectedId || !assigneeId) {
      ToastError("Pick an assignee");
      return;
    }
    const [, error] = await AssignComplaintAction(selectedId, assigneeId);
    if (error) ToastError(error);
    else ToastSuccess("Complaint assigned");
    setAssigneeId("");
    setAssigneeSearch("");
    load();
  };

  const handleResolve = async () => {
    if (!selectedId || !resolutionNotes.trim()) {
      ToastError("Enter resolution notes");
      return;
    }
    const [, error] = await ResolveComplaintAction(selectedId, resolutionStatus, resolutionNotes.trim());
    if (error) ToastError(error);
    else ToastSuccess("Complaint resolved");
    setResolutionNotes("");
    setSelectedId(null);
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Complaints</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(ComplaintStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {Object.values(ComplaintCategory).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <Button onClick={load}>Filter</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No complaints found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Filed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.subject}</TableCell>
                <TableCell>{CATEGORY_LABELS[c.category]}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(c.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                  >
                    {selectedId === c.id ? "Close" : "View"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selected && (
        <div className="mt-6 border rounded-lg p-4 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800">{selected.subject}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {CATEGORY_LABELS[selected.category]} &middot; Filed {formatDateTime(selected.createdAt)}
            </p>
            <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
            {selected.assignedTo && (
              <p className="text-xs text-gray-500 mt-2">Assigned to: {assignedToName ?? "..."}</p>
            )}
            {selected.resolutionNotes && (
              <p className="text-sm text-gray-500 mt-2 border-t pt-2">
                <span className="font-medium">Resolution:</span> {selected.resolutionNotes}
              </p>
            )}
          </div>

          {canManageComplaints && selected.status !== ComplaintStatus.RESOLVED && selected.status !== ComplaintStatus.DISMISSED && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Assign</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <select
                    value={assigneeRole}
                    onChange={(e) => {
                      setAssigneeRole(e.target.value as UserRole);
                      setAssigneeId("");
                    }}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    {ASSIGNEE_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Search by name..."
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                {assigneeResults.length > 0 && (
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto border rounded-md p-2 mb-2">
                    {assigneeResults.map((u) => (
                      <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={assigneeId === u.id} onChange={() => setAssigneeId(u.id)} />
                        {u.firstName} {u.lastName}
                      </label>
                    ))}
                  </div>
                )}
                <Button size="sm" onClick={handleAssign} disabled={!assigneeId}>
                  Assign
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Resolve</h3>
                <div className="flex flex-wrap gap-2 items-start">
                  <select
                    value={resolutionStatus}
                    onChange={(e) =>
                      setResolutionStatus(e.target.value as ComplaintStatus.RESOLVED | ComplaintStatus.DISMISSED)
                    }
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                    <option value={ComplaintStatus.DISMISSED}>Dismissed</option>
                  </select>
                  <Input
                    placeholder="Resolution notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button size="sm" onClick={handleResolve}>
                    Submit
                  </Button>
                </div>
              </div>
            </>
          )}

          {!canManageComplaints && (
            <p className="text-xs text-gray-400 border-t pt-4">
              You don&apos;t have permission to assign or resolve complaints.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
