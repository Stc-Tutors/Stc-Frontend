"use client";

import { useEffect, useState } from "react";
import { Eye, Check, X } from "lucide-react";
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
  ApproveResourceAction,
  GetResourcesForAdminAction,
  RejectResourceAction,
} from "@/server/resource";
import { CourseResource, ResourceStatus } from "@/types/resource";

export default function AdminResourcesPage() {
  const [rows, setRows] = useState<CourseResource[]>([]);
  const [filter, setFilter] = useState<ResourceStatus>(ResourceStatus.PENDING);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetResourcesForAdminAction(filter);
    setRows(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveResourceAction(id);
    setMessage(error || "Resource approved");
    load();
  };

  const handleReject = async (id: string) => {
    const [, error] = await RejectResourceAction(id, "Rejected by admin");
    setMessage(error || "Resource rejected");
    load();
  };

  // uploadedBy is never populated by the backend - the course's tutor is
  // shown instead since it's the practically-relevant "who uploaded this" signal.
  const uploaderName = (course: CourseResource["course"]) =>
    typeof course === "string" || !course.tutor ? "-" : `${course.tutor.firstName} ${course.tutor.lastName}`;

  const courseTitle = (course: CourseResource["course"]) =>
    typeof course === "string" ? course : course.title;

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ResourceStatus)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {Object.values(ResourceStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No resources to review.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{courseTitle(row.course)}</TableCell>
                <TableCell>{uploaderName(row.course)}</TableCell>
                <TableCell className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={row.fileUrl} target="_blank" rel="noreferrer"><Eye className="w-4 h-4 text-gray-500" /></a>
                    </Button>
                    {row.status === ResourceStatus.PENDING && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleApprove(row.id)}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleReject(row.id)}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
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
