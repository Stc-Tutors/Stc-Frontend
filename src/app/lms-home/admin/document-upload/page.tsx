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
  ApproveTutorApplicationAction,
  GetTutorApplicationsAction,
  RejectTutorApplicationAction,
} from "@/server/tutor-application";
import { TutorApplication, TutorApplicationApplicant, TutorApplicationStatus } from "@/types/tutor-application";

interface DocumentRow {
  applicationId: string;
  applicantName: string;
  documentUrl: string;
  submittedAt: string;
  status: TutorApplicationStatus;
}

export default function AdminDocumentUploadPage() {
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [filter, setFilter] = useState<TutorApplicationStatus>(TutorApplicationStatus.PENDING);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetTutorApplicationsAction(filter);
    const applications = res?.data ?? [];
    const flattened: DocumentRow[] = [];
    applications.forEach((app: TutorApplication) => {
      const applicant = typeof app.user === "string" ? null : (app.user as TutorApplicationApplicant);
      app.documentUrls.forEach((url) => {
        flattened.push({
          applicationId: app.id,
          applicantName: applicant ? `${applicant.firstName} ${applicant.lastName}` : "Applicant",
          documentUrl: url,
          submittedAt: app.createdAt,
          status: app.status,
        });
      });
    });
    setRows(flattened);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (applicationId: string) => {
    const [, error] = await ApproveTutorApplicationAction(applicationId);
    setMessage(error || "Application approved");
    load();
  };

  const handleReject = async (applicationId: string) => {
    const [, error] = await RejectTutorApplicationAction(applicationId, "Document rejected by admin");
    setMessage(error || "Application rejected");
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Document Upload</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TutorApplicationStatus)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {Object.values(TutorApplicationStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No documents to review.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={`${row.applicationId}-${i}`}>
                <TableCell>{row.applicantName}</TableCell>
                <TableCell className="text-sm text-blue-600">Document {i + 1}</TableCell>
                <TableCell className="text-xs text-gray-500">{new Date(row.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={row.documentUrl} target="_blank" rel="noreferrer"><Eye className="w-4 h-4 text-gray-500" /></a>
                    </Button>
                    {row.status === TutorApplicationStatus.PENDING && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleApprove(row.applicationId)}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleReject(row.applicationId)}>
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
