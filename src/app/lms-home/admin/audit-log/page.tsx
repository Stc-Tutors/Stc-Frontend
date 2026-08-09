"use client";

import { useEffect, useState } from "react";
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
import { GetAuditLogsAction } from "@/server/audit-log";
import { AuditLog, AuditLogActor } from "@/types/audit-log";

const PAGE_SIZE = 20;

const actorLabel = (actor: AuditLogActor) =>
  typeof actor === "string" ? actor : `${actor.firstName} ${actor.lastName} (${actor.email})`;

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async (targetPage: number) => {
    setIsLoading(true);
    const [res] = await GetAuditLogsAction({
      entityType: entityType || undefined,
      action: action || undefined,
      from: from || undefined,
      to: to || undefined,
      page: targetPage,
      limit: PAGE_SIZE,
    });
    setLogs(res?.data ?? []);
    setTotal(res?.total ?? 0);
    setPage(res?.page ?? targetPage);
    setIsLoading(false);
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => load(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Entity type (e.g. Lesson)"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="max-w-[12rem]"
        />
        <Input
          placeholder="Action (e.g. APPROVE)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="max-w-[12rem]"
        />
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="max-w-[10rem]" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="max-w-[10rem]" />
        <Button onClick={handleFilter}>Filter</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading audit log...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No audit log entries found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{actorLabel(log.actor)}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entityType}
                    {log.entityId ? ` · ${log.entityId}` : ""}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.description || "—"}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} &middot; {total} total entries
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => load(page - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => load(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
