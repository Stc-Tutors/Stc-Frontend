"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserSearchSelect } from "@/components/user-search-select";
import { GetUserByIdAction } from "@/server/admin";
import {
  GetTutorMessagingPermissionsAction,
  GrantTutorMessagingPermissionAction,
  RevokeTutorMessagingPermissionAction,
} from "@/server/tutor-messaging-permission";
import { ITutorMessagingPermission } from "@/types/tutor-messaging-permission";
import { User, UserRole } from "@/types/user";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import { ROLE_LABELS } from "@/lib/roles";

type GrantRow = ITutorMessagingPermission & { tutorUser?: User; counterpartUser?: User };

// GET /users only ever returns STUDENT/PARENT/TUTOR for an admin-tier caller
// (see stcbe's UserService.listUsers) - HOD isn't searchable through this
// picker even though the backend grant itself accepts HOD as either party
// (TutorMessagingPermissionService.ELIGIBLE_ROLES). Grant an HOD a direct
// contact from Stc-SuperAdmin instead, which isn't scoped this way.
const SEARCHABLE_ROLES = [UserRole.STUDENT, UserRole.PARENT, UserRole.TUTOR];

// Everyone's default messaging is admin-mediated - this is the one place
// that default is deliberately overridden, one relationship at a time.
// Never a blanket role-pair toggle: pick exactly two people (any combination
// of TUTOR/PARENT/STUDENT/HOD) and grant just that pair - see stcbe's
// TutorMessagingPermissionService.grant.
export default function MessagingPermissionsPage() {
  const { hasPermission, isLoading: isLoadingUser } = useUser();
  const canManage = hasPermission(AdminPermission.MANAGE_MESSAGING_PERMISSIONS);

  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tutorRole, setTutorRole] = useState<UserRole>(UserRole.TUTOR);
  const [tutorId, setTutorId] = useState("");
  const [counterpartRole, setCounterpartRole] = useState<UserRole>(UserRole.PARENT);
  const [counterpartId, setCounterpartId] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetTutorMessagingPermissionsAction();
    if (error) toast.error(error);
    const list = res?.data ?? [];
    const withUsers = await Promise.all(
      list.map(async (g): Promise<GrantRow> => {
        const [[tutorRes], [counterpartRes]] = await Promise.all([
          GetUserByIdAction(g.tutor),
          GetUserByIdAction(g.counterpart),
        ]);
        return { ...g, tutorUser: tutorRes?.data, counterpartUser: counterpartRes?.data };
      })
    );
    setGrants(withUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    if (canManage) load();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const handleGrant = async () => {
    if (!tutorId || !counterpartId) {
      toast.error("Pick both people");
      return;
    }
    setIsGranting(true);
    const [, error] = await GrantTutorMessagingPermissionAction({ tutorId, counterpartId });
    setIsGranting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Permission granted");
    setTutorId("");
    setCounterpartId("");
    load();
  };

  const handleRevoke = async (id: string) => {
    const [, error] = await RevokeTutorMessagingPermissionAction(id);
    if (error) toast.error(error);
    else toast.success("Permission revoked");
    load();
  };

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!canManage) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Messaging Permissions</h1>
        <p className="text-gray-500 text-sm mt-2">
          You need the Manage Messaging Permissions permission to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Messaging Permissions</h1>
        <p className="text-gray-500 text-sm mt-1">
          By default, tutors, parents, students, and HODs only message the admin(s) actually assigned to them.
          Grant two specific people direct access to message each other here - one relationship at a time.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Grant direct messaging</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 block">Person A</label>
            <select
              value={tutorRole}
              onChange={(e) => {
                setTutorRole(e.target.value as UserRole);
                setTutorId("");
              }}
              className="border rounded-md px-2 py-1.5 text-xs w-full"
            >
              {SEARCHABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <UserSearchSelect role={tutorRole} value={tutorId} onChange={setTutorId} placeholder="Search by name or email..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 block">Person B</label>
            <select
              value={counterpartRole}
              onChange={(e) => {
                setCounterpartRole(e.target.value as UserRole);
                setCounterpartId("");
              }}
              className="border rounded-md px-2 py-1.5 text-xs w-full"
            >
              {SEARCHABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <UserSearchSelect
              role={counterpartRole}
              value={counterpartId}
              onChange={setCounterpartId}
              placeholder="Search by name or email..."
            />
          </div>
        </div>
        <Button size="sm" onClick={handleGrant} disabled={isGranting}>
          {isGranting ? "Granting..." : "Grant permission"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : grants.length === 0 ? (
        <p className="text-sm text-gray-500">No direct messaging permissions granted yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {grants.map((g) => (
            <div key={g.id} className="p-4 flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {g.tutorUser ? `${g.tutorUser.firstName} ${g.tutorUser.lastName}` : g.tutor}
                </span>
                <span className="text-gray-400"> ({g.tutorUser ? ROLE_LABELS[g.tutorUser.role] : "?"}) </span>
                <span className="text-gray-400">&harr;</span>{" "}
                <span className="font-medium text-gray-900">
                  {g.counterpartUser ? `${g.counterpartUser.firstName} ${g.counterpartUser.lastName}` : g.counterpart}
                </span>
                <span className="text-gray-400"> ({g.counterpartUser ? ROLE_LABELS[g.counterpartUser.role] : "?"})</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    Revoke
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke this messaging permission?</AlertDialogTitle>
                    <AlertDialogDescription>
                      They&apos;ll no longer be able to message each other directly - existing message history is
                      unaffected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRevoke(g.id)}>Revoke</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
