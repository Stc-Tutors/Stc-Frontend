"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateUserAction, GetUsersAction } from "@/server/admin";
import { User, UserRole } from "@/types/user";
import { ROLE_LABELS } from "@/lib/roles";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const CREATABLE_ROLES = [UserRole.STUDENT, UserRole.PARENT, UserRole.TUTOR];

export default function AdminUsersPage() {
  const router = useRouter();
  const { hasPermission } = useUser();
  const canManageUsers = hasPermission(AdminPermission.MANAGE_USERS);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>(UserRole.TUTOR);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetUsersAction({ search: search || undefined, role: role || undefined });
    setUsers(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      setMessage("All fields are required");
      return;
    }
    const [, error] = await CreateUserAction({
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      password: newPassword,
      role: newRole,
    });
    setMessage(error || "User created");
    if (!error) {
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      setShowCreate(false);
    }
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        {canManageUsers && (
          <Button onClick={() => setShowCreate((s) => !s)}>{showCreate ? "Cancel" : "+ Create user"}</Button>
        )}
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {canManageUsers && showCreate && (
        <div className="border rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-semibold text-sm">Create a tutor, student, or parent account</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="First name" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
            <Input placeholder="Last name" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
            <Input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Input
              type="password"
              placeholder="Temporary password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="border rounded-md px-3 py-2 text-sm col-span-2"
            >
              {CREATABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {Object.values(UserRole).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <Button onClick={load}>Filter</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No users found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell>{u.email || "Hidden"}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell>{u.status ?? "ACTIVE"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/lms-home/admin/users/${u.id}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
