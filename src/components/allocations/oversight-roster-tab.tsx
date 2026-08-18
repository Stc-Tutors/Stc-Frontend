"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GetUsersAction } from "@/server/admin";
import { AssignOversightToEnrollmentsAction, GetOversightRosterForAdminAction, ListUnmanagedOversightAction } from "@/server/allocation-hub";
import { AdminOversightAllocation, SubjectEnrollment } from "@/types/allocation-hub";
import { User, UserRole } from "@/types/user";
import DualPaneTransferList from "./dual-pane-transfer-list";

function enrollmentToItem(e: SubjectEnrollment) {
  return { id: e.id, primary: e.student.fullName, secondary: e.subject };
}

function allocationToItem(a: AdminOversightAllocation) {
  return { id: a.subjectEnrollment.id, primary: a.subjectEnrollment.student.fullName, secondary: a.subjectEnrollment.subject };
}

// Workflow B: pick an STC_Admin/TUTOR_ADMIN -> move unmanaged subject
// enrollments (any status - a tutor doesn't need to exist yet) into their
// oversight roster. The Admin's own dashboard then inherits exactly this
// subject/tutor/parent scope.
export default function OversightRosterTab({ jumpToken }: { jumpToken: number }) {
  const [admins, setAdmins] = useState<User[]>([]);
  const [adminId, setAdminId] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [unmanaged, setUnmanaged] = useState<SubjectEnrollment[]>([]);
  const [roster, setRoster] = useState<AdminOversightAllocation[]>([]);
  const [isLoadingLeft, setIsLoadingLeft] = useState(false);
  const [isLoadingRight, setIsLoadingRight] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      GetUsersAction({ role: UserRole.STC_ADMIN, limit: 1000 }),
      GetUsersAction({ role: UserRole.TUTOR_ADMIN, limit: 1000 }),
    ]).then(([[stc], [tutorAdmin]]) => {
      setAdmins([...(stc?.data ?? []), ...(tutorAdmin?.data ?? [])]);
    });
  }, []);

  function refreshLeft() {
    setIsLoadingLeft(true);
    ListUnmanagedOversightAction({ subject: subjectFilter || undefined }).then(([res]) => {
      setUnmanaged(res?.data ?? []);
      setIsLoadingLeft(false);
    });
  }

  useEffect(() => {
    refreshLeft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectFilter]);

  useEffect(() => {
    if (jumpToken > 0) refreshLeft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  function refreshRight() {
    if (!adminId) {
      setRoster([]);
      return;
    }
    setIsLoadingRight(true);
    GetOversightRosterForAdminAction(adminId).then(([res]) => {
      setRoster((res?.data ?? []).filter((a) => a.subjectEnrollment));
      setIsLoadingRight(false);
    });
  }

  useEffect(() => {
    refreshRight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const handleTransfer = async (ids: string[]) => {
    if (!adminId) {
      toast.error("Pick an admin first");
      return;
    }
    setIsAssigning(true);
    const [res, error] = await AssignOversightToEnrollmentsAction(ids, adminId);
    setIsAssigning(false);
    if (error || !res?.data) {
      toast.error(error || "Failed to assign oversight");
      return;
    }
    toast.success(res.message);
    refreshLeft();
    refreshRight();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Admin (STC_ADMIN / TUTOR_ADMIN)</label>
          <select
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            <option value="">Select an admin...</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName} ({a.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Filter unmanaged by subject</label>
          <input
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder="e.g. IGCSE Math"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {!adminId ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg p-6 text-center">
          Pick an admin to see their current oversight roster and assign more subjects to them.
        </p>
      ) : (
        <DualPaneTransferList
          leftTitle="Unmanaged enrollments"
          rightTitle="This admin's oversight roster"
          leftItems={unmanaged.map(enrollmentToItem)}
          rightItems={roster.map(allocationToItem)}
          isLoading={isLoadingLeft || isLoadingRight}
          isTransferring={isAssigning}
          transferLabel="Assign oversight"
          onTransfer={handleTransfer}
          searchPlaceholder="Search student..."
        />
      )}
    </div>
  );
}
