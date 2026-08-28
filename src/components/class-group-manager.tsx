"use client";

import { useEffect, useState } from "react";
import { CreateClassGroupAction, DeleteClassGroupAction, GetAdminClassGroupsAction, UpdateClassGroupAction } from "@/server/class-group";
import { GetAdminServicesAction } from "@/server/service-catalog";
import { CLASS_GROUP_STATUS_LABELS, ClassGroupStatus, IClassGroup, IService } from "@/types/service-catalog";

interface GroupForm {
  serviceType: string;
  course: string;
  subject: string;
  ageRange: string;
  label: string;
  capacity: string;
  startDate: string;
}

const emptyForm = (defaultServiceType: string): GroupForm => ({
  serviceType: defaultServiceType,
  course: "",
  subject: "",
  ageRange: "",
  label: "",
  capacity: "",
  startDate: "",
});

function statusBadgeClass(status: ClassGroupStatus): string {
  if (status === ClassGroupStatus.OPEN) return "bg-green-100 text-green-700";
  if (status === ClassGroupStatus.FULL) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-500";
}

function CapacityBar({ confirmed, capacity }: { confirmed: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((confirmed / capacity) * 100)) : 0;
  const barColor = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-32 space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {confirmed}/{capacity}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Cohorts an admin pre-provisions ahead of time (e.g. a "9-12 years, Jan
// 2026 batch, capacity 15" Tech-for-Kids group) that students pick directly
// during signup for cohort-based services, plus ad-hoc group classes the
// backend auto-creates for non-cohort services. Shared between the
// standalone /lms-home/admin/class-groups page and the per-service
// workspace's Class Groups tab (passing `serviceType` scopes the list
// server-side and locks new groups to that service) - mirrors
// Stc-SuperAdmin's component of the same name.
export function ClassGroupManager({ serviceType, hideHeading }: { serviceType?: string; hideHeading?: boolean } = {}) {
  const [groups, setGroups] = useState<IClassGroup[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<GroupForm>(emptyForm(serviceType ?? ""));
  const [isSaving, setIsSaving] = useState(false);

  const serviceLocked = !!serviceType;

  const load = async () => {
    setIsLoading(true);
    const [[groupsRes, groupsErr], [servicesRes]] = await Promise.all([
      GetAdminClassGroupsAction(serviceType),
      GetAdminServicesAction(),
    ]);
    setIsLoading(false);
    if (groupsErr) {
      setMessage(groupsErr);
      return;
    }
    setGroups(groupsRes?.data ?? []);
    setServices(servicesRes?.data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(serviceType ?? services[0]?.slug ?? ""));
    setShowCreate(true);
  };

  const openEdit = (group: IClassGroup) => {
    setShowCreate(false);
    setEditingId(group.id);
    setForm({
      serviceType: group.serviceType,
      course: group.course ?? "",
      subject: group.subject ?? "",
      ageRange: group.ageRange ?? "",
      label: group.label,
      capacity: String(group.capacity),
      startDate: group.startDate ? new Date(group.startDate).toISOString().slice(0, 10) : "",
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowCreate(false);
  };

  const handleSave = async () => {
    const capacity = Number(form.capacity);
    if (!form.label.trim() || !capacity || capacity <= 0) {
      setMessage("Label and a positive capacity are required.");
      return;
    }
    if (!editingId && !form.serviceType.trim()) {
      setMessage("Select a service type.");
      return;
    }
    setIsSaving(true);
    const [, error] = editingId
      ? await UpdateClassGroupAction(editingId, {
          label: form.label.trim(),
          capacity,
          startDate: form.startDate || undefined,
        })
      : await CreateClassGroupAction({
          serviceType: form.serviceType.trim(),
          course: form.course.trim() || undefined,
          subject: form.subject.trim() || undefined,
          ageRange: form.ageRange.trim() || undefined,
          label: form.label.trim(),
          capacity,
          startDate: form.startDate || undefined,
        });
    setIsSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage(editingId ? "Class group updated." : "Class group created.");
    cancelForm();
    load();
  };

  const handleDelete = async (group: IClassGroup) => {
    if (!confirm(`Delete class group "${group.label}"?`)) return;
    const [, error] = await DeleteClassGroupAction(group.id);
    setMessage(error || "Deleted.");
    load();
  };

  const formOpen = showCreate || !!editingId;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {!hideHeading ? (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Class Groups / Cohorts</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Cohorts pre-provisioned ahead of time for students to pick during signup, plus ad-hoc group classes the
              backend auto-creates for non-cohort services. Watch confirmed/waitlist counts to spot groups nearing
              capacity.
            </p>
          </div>
        ) : (
          <div />
        )}
        <button onClick={openCreate} className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 shrink-0">
          Add class group
        </button>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {formOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">{editingId ? "Edit class group" : "Add class group"}</h2>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Service type</label>
            {editingId || serviceLocked ? (
              <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 font-mono">{form.serviceType}</div>
            ) : (
              <select
                value={form.serviceType}
                onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.serviceName} ({s.slug})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Label</label>
            <input
              placeholder="Tech-for-Kids · 9-12 years · Jan 2026 batch"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          {!editingId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Course (optional)</label>
                <input
                  value={form.course}
                  onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Subject (optional)</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Age Range (optional)</label>
                <input
                  placeholder="9-12 years"
                  value={form.ageRange}
                  onChange={(e) => setForm((p) => ({ ...p, ageRange: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Capacity</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Start date (optional)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create class group"}
            </button>
            <button onClick={cancelForm} className="text-sm text-gray-500 hover:underline px-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-6">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No class groups yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Label</th>
                <th className="p-3">Service type</th>
                <th className="p-3">Course / Subject / Age Range</th>
                <th className="p-3">Fill</th>
                <th className="p-3">Waitlist</th>
                <th className="p-3">Start date</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map((g) => (
                <tr key={g.id}>
                  <td className="p-3">{g.label}</td>
                  <td className="p-3 font-mono text-xs">{g.serviceType}</td>
                  <td className="p-3 text-xs text-gray-500">{[g.course, g.subject, g.ageRange].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="p-3">
                    <CapacityBar confirmed={g.confirmedCount} capacity={g.capacity} />
                  </td>
                  <td className="p-3">{g.waitlistCount}</td>
                  <td className="p-3">{g.startDate ? new Date(g.startDate).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${statusBadgeClass(g.status)}`}>{CLASS_GROUP_STATUS_LABELS[g.status]}</span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(g)} className="text-xs text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(g)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
