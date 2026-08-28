"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  BatchUploadServicesAction,
  CreateServiceAction,
  DeleteServiceAction,
  GetAdminServicesAction,
  UpdateServiceAction,
} from "@/server/service-catalog";
import {
  ArchitecturalPath,
  CreateServiceDto,
  FLOW_REQUIREMENT_KEYS,
  FLOW_REQUIREMENT_LABELS,
  IService,
  IServiceFlowRequirements,
  ServiceCatalogStatus,
} from "@/types/service-catalog";

// Lowercase-kebab-case only - mirrors the backend's CreateServiceDto/
// UpdateServiceDto @Matches validator. This is the machine key
// ServicePricing/Course/class groups/custom form fields/the curriculum tree
// match a service by - it must never be the display name.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STATUS_FILTERS: { value: ServiceCatalogStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: ServiceCatalogStatus.ACTIVE, label: "Active" },
  { value: ServiceCatalogStatus.PLANNED, label: "Planned" },
  { value: ServiceCatalogStatus.ARCHIVED, label: "Archived" },
];

const emptyForm = (): CreateServiceDto => ({
  serviceId: "",
  slug: "",
  serviceName: "",
  targetAudience: "",
  architecturalPath: ArchitecturalPath.ACADEMIC_TUTORING_TAXONOMY,
  flowRequirements: {},
  description: "",
  status: ServiceCatalogStatus.PLANNED,
});

function statusBadgeClass(status: ServiceCatalogStatus): string {
  if (status === ServiceCatalogStatus.ACTIVE) return "bg-green-100 text-green-700";
  if (status === ServiceCatalogStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

// The DB-backed service catalog that replaced the old hardcoded service-type
// lists (SERVICE_TYPE_LABELS et al in src/constants/taxonomy.ts). The
// flowRequirements toggles are the actual point of this screen - the
// student/tutor-facing registration forms (service-selection.tsx and
// friends) read these booleans verbatim to decide which taxonomy steps to
// render, so turning one off means "select None, hide this field
// downstream" for those forms.
export default function ServiceCatalogPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceCatalogStatus | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateServiceDto>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  // Once the admin hand-edits the slug, stop overwriting it as they keep
  // typing the service name.
  const [slugTouched, setSlugTouched] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetAdminServicesAction(statusFilter);
    setIsLoading(false);
    if (error) {
      setMessage(error);
      return;
    }
    setServices(res?.data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setShowCreate(true);
  };

  const openEdit = (service: IService) => {
    setShowCreate(false);
    setEditingId(service.id);
    setForm({
      serviceId: service.serviceId,
      slug: service.slug,
      serviceName: service.serviceName,
      targetAudience: service.targetAudience ?? "",
      architecturalPath: service.architecturalPath,
      flowRequirements: { ...service.flowRequirements },
      description: service.description ?? "",
      status: service.status,
    });
    setSlugTouched(true); // editing an existing service - never auto-overwrite its slug
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowCreate(false);
  };

  const handleServiceNameChange = (value: string) => {
    setForm((p) => ({
      ...p,
      serviceName: value,
      slug: !editingId && !slugTouched ? slugify(value) : p.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setForm((p) => ({ ...p, slug: value }));
  };

  const slugIsValid = SLUG_PATTERN.test(form.slug);

  const toggleFlow = (key: keyof IServiceFlowRequirements) => {
    setForm((prev) => ({
      ...prev,
      flowRequirements: { ...prev.flowRequirements, [key]: !prev.flowRequirements?.[key] },
    }));
  };

  const handleSave = async () => {
    if (!form.serviceId.trim() || !form.slug.trim() || !form.serviceName.trim()) {
      setMessage("Service ID, slug, and name are required.");
      return;
    }
    if (!slugIsValid) {
      setMessage('Slug must be lowercase-kebab-case (e.g. "academic-tutoring") - no spaces or capitals.');
      return;
    }
    setIsSaving(true);
    const payload: CreateServiceDto = {
      ...form,
      serviceId: form.serviceId.trim(),
      slug: form.slug.trim(),
      serviceName: form.serviceName.trim(),
      targetAudience: form.targetAudience?.trim() || undefined,
      description: form.description?.trim() || undefined,
    };
    const [, error] = editingId ? await UpdateServiceAction(editingId, payload) : await CreateServiceAction(payload);
    setIsSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage(editingId ? "Service updated." : "Service created.");
    cancelForm();
    load();
  };

  const handleDelete = async (service: IService) => {
    if (!confirm(`Delete service "${service.serviceName}"?`)) return;
    const [, error] = await DeleteServiceAction(service.id);
    setMessage(error || "Service deleted.");
    load();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const [, error] = await BatchUploadServicesAction(parsed);
      setMessage(error || "Batch upload complete.");
      if (!error) load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not parse the JSON file.");
    } finally {
      setIsUploading(false);
    }
  };

  const formOpen = showCreate || !!editingId;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Service Catalog</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            The single source of truth for every service the platform offers. Each service&apos;s flow requirements
            control which taxonomy fields the student/tutor-facing registration forms render — turning a field off
            means &quot;select None, hide this field downstream.&quot;
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload JSON"}
          </button>
          <button onClick={openCreate} className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800">
            Add service
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="flex items-center gap-2 text-sm">
        <label className="text-gray-500">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceCatalogStatus | "")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">{editingId ? "Edit service" : "Add service"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Service ID</label>
              <input
                placeholder="SRV-001"
                value={form.serviceId}
                disabled={!!editingId}
                onChange={(e) => setForm((p) => ({ ...p, serviceId: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Slug</label>
              <input
                placeholder="academic-tutoring"
                value={form.slug}
                disabled={!!editingId}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 ${
                  !slugIsValid && form.slug ? "border-red-400" : "border-gray-300"
                }`}
              />
              <p className={`text-xs ${!slugIsValid && form.slug ? "text-red-600" : "text-gray-400"}`}>
                {editingId
                  ? "Locked after creation - pricing, courses, class groups, and the curriculum tree already reference this value."
                  : !slugIsValid && form.slug
                    ? 'Lowercase-kebab-case only, e.g. "academic-tutoring" - no spaces or capitals.'
                    : "Auto-filled from the service name. This is the internal key other screens match on - not shown to students."}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-500">Service name</label>
              <input
                placeholder="Academic Tutoring"
                value={form.serviceName}
                onChange={(e) => handleServiceNameChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Target audience</label>
              <input
                placeholder="K-12 students"
                value={form.targetAudience ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Architectural path</label>
              <select
                value={form.architecturalPath}
                onChange={(e) => setForm((p) => ({ ...p, architecturalPath: e.target.value as ArchitecturalPath }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {Object.values(ArchitecturalPath).map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ServiceCatalogStatus }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {Object.values(ServiceCatalogStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Flow requirements</p>
            <p className="text-xs text-gray-500">
              Off = hidden from the registration form (select None downstream). On = shown as a step/field and
              populated from the matching taxonomy list.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 rounded-md p-3">
              {FLOW_REQUIREMENT_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={!!form.flowRequirements?.[key]} onChange={() => toggleFlow(key)} className="rounded border-gray-300" />
                  {FLOW_REQUIREMENT_LABELS[key]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !slugIsValid}
              className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create service"}
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
        ) : services.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No services yet. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Service ID</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Name</th>
                <th className="p-3">Architectural Path</th>
                <th className="p-3">Flow requirements</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((s) => {
                const active = FLOW_REQUIREMENT_KEYS.filter((k) => s.flowRequirements?.[k]);
                return (
                  <tr key={s.id}>
                    <td className="p-3 font-mono text-xs">{s.serviceId}</td>
                    <td className="p-3 font-mono text-xs text-gray-500">{s.slug}</td>
                    <td className="p-3">{s.serviceName}</td>
                    <td className="p-3 text-xs">{s.architecturalPath}</td>
                    <td className="p-3">
                      {active.length > 0 ? (
                        <span className="text-xs text-gray-500" title={active.map((k) => FLOW_REQUIREMENT_LABELS[k]).join(", ")}>
                          {active.length} enabled
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">none</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${statusBadgeClass(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/lms-home/admin/service-catalog/${s.id}`}
                        className="text-xs text-blue-600 hover:underline mr-3 inline-flex items-center gap-1"
                      >
                        Manage
                        <ArrowRight className="size-3" />
                      </Link>
                      <button onClick={() => openEdit(s)} className="text-xs text-gray-600 hover:underline mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
