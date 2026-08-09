"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApproveTutorApplicationAction,
  GetTutorApplicationsAction,
  RejectTutorApplicationAction,
} from "@/server/tutor-application";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TutorApplication, TutorApplicationApplicant, TutorApplicationStatus } from "@/types/tutor-application";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

export default function TutorApplicationsPage() {
  const router = useRouter();
  const { hasPermission } = useUser();
  const canReview = hasPermission(AdminPermission.REVIEW_TUTOR_APPLICATIONS);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [status, setStatus] = useState<TutorApplicationStatus>(TutorApplicationStatus.PENDING);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetTutorApplicationsAction(status);
    setApplications(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveTutorApplicationAction(id);
    setMessage(error || "Application approved");
    load();
  };

  const handleReject = async (id: string) => {
    const [, error] = await RejectTutorApplicationAction(id, rejectReasons[id]);
    setMessage(error || "Application rejected");
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tutor Applications</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TutorApplicationStatus)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {Object.values(TutorApplicationStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No {status.toLowerCase()} applications.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const applicant = app.user as TutorApplicationApplicant;
            return (
              <div key={app.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {typeof app.user !== "string" && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={applicant.avatarUrl} alt={applicant.firstName} />
                        <AvatarFallback>{applicant.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <button
                        onClick={() => typeof app.user !== "string" && router.push(`/lms-home/profile/${applicant.id}`)}
                        className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-left"
                        disabled={typeof app.user === "string"}
                      >
                        {typeof app.user === "string" ? app.user : `${applicant.firstName} ${applicant.lastName}`}
                      </button>
                      <p className="text-sm text-gray-500">
                        {typeof app.user === "string" ? "" : applicant.email || "Hidden"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Subjects:</span>{" "}
                    {app.teachingCombinations.map((c, i) => (
                      <span key={i}>
                        {i > 0 && "; "}
                        {c.country} · {c.curriculum} · {c.gradeLevel}: {c.subjectsTaught.join(", ")}
                      </span>
                    ))}
                  </p>
                  <p>
                    <span className="font-medium">Experience:</span> {app.yearsOfExperience} years
                  </p>
                  <p>
                    <span className="font-medium">Qualifications:</span> {app.qualifications}
                  </p>
                  <p>
                    <span className="font-medium">Availability:</span> {app.availability}
                  </p>
                  {app.screeningAnswers && (
                    <p>
                      <span className="font-medium">Notes:</span> {app.screeningAnswers}
                    </p>
                  )}
                  {app.documentUrls.length > 0 && (
                    <p>
                      <span className="font-medium">Documents:</span>{" "}
                      {app.documentUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline mr-2">
                          Doc {i + 1}
                        </a>
                      ))}
                    </p>
                  )}
                  {app.rejectionReason && (
                    <p className="text-red-600">
                      <span className="font-medium">Rejection reason:</span> {app.rejectionReason}
                    </p>
                  )}
                </div>

                {app.status === TutorApplicationStatus.PENDING && canReview && (
                  <div className="flex gap-2 items-center pt-2">
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="bg-green-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <input
                      placeholder="Rejection reason (optional)"
                      value={rejectReasons[app.id] ?? ""}
                      onChange={(e) => setRejectReasons((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      className="border rounded-md px-2 py-1.5 text-xs flex-1"
                    />
                    <button
                      onClick={() => handleReject(app.id)}
                      className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-xs hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {app.status !== TutorApplicationStatus.PENDING && (
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                      app.status === TutorApplicationStatus.APPROVED
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {app.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
