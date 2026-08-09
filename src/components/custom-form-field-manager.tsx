"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreateCustomFormFieldAction,
  DeleteCustomFormFieldAction,
  GetAdminCustomFormFieldsAction,
  UpdateCustomFormFieldAction,
} from "@/server/custom-form-field";
import { GetAdminServicesAction } from "@/server/service-catalog";
import {
  CUSTOM_FORM_FIELD_TYPE_LABELS,
  CUSTOM_FORM_STAGE_LABELS,
  CUSTOM_FORM_STAGES,
  CustomFormFieldType,
  CustomFormStage,
  FIELD_TYPES_WITH_OPTIONS,
  ICustomFormField,
  IService,
} from "@/types/service-catalog";

interface FieldForm {
  stage: CustomFormStage;
  serviceType: string;
  label: string;
  fieldType: CustomFormFieldType;
  options: string;
  required: boolean;
  order: string;
}

const emptyForm = (stage: CustomFormStage, defaultServiceType: string): FieldForm => ({
  stage,
  serviceType: defaultServiceType,
  label: "",
  fieldType: CustomFormFieldType.TEXT,
  options: "",
  required: false,
  order: "0",
});

const parseOptions = (value: string): string[] =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// A schema-driven form builder, not hardcoded fields - lets an admin add
// extra questions to any student-registration/tutor-onboarding step without
// a code change (rendered by dynamic-question-field.tsx via
// use-custom-form-fields.ts). Fields are grouped by stage, one "Add field"
// per stage. Shared between the standalone /lms-home/admin/custom-form-fields
// page and the per-service workspace's Custom Questions tab (passing
// `serviceType` scopes the list and locks new fields to that service) -
// mirrors Stc-SuperAdmin's component of the same name.
export function CustomFormFieldManager({ serviceType, hideHeading }: { serviceType?: string; hideHeading?: boolean } = {}) {
  const [fields, setFields] = useState<ICustomFormField[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [createStage, setCreateStage] = useState<CustomFormStage | null>(null);
  const [form, setForm] = useState<FieldForm>(emptyForm(CUSTOM_FORM_STAGES[0], serviceType ?? ""));
  const [isSaving, setIsSaving] = useState(false);

  const serviceLocked = !!serviceType;

  const load = async () => {
    setIsLoading(true);
    const [[fieldsRes, fieldsErr], [servicesRes]] = await Promise.all([
      GetAdminCustomFormFieldsAction(serviceType),
      GetAdminServicesAction(),
    ]);
    setIsLoading(false);
    if (fieldsErr) {
      setMessage(fieldsErr);
      return;
    }
    setFields(fieldsRes?.data ?? []);
    setServices(servicesRes?.data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType]);

  const fieldsByStage = useMemo(() => {
    const map = new Map<CustomFormStage, ICustomFormField[]>();
    for (const stage of CUSTOM_FORM_STAGES) map.set(stage, []);
    for (const field of fields) {
      const list = map.get(field.stage);
      if (list) list.push(field);
      else map.set(field.stage, [field]);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [fields]);

  const openCreate = (stage: CustomFormStage) => {
    setEditingId(null);
    setForm(emptyForm(stage, serviceType ?? ""));
    setCreateStage(stage);
  };

  const openEdit = (field: ICustomFormField) => {
    setCreateStage(null);
    setEditingId(field.id);
    setForm({
      stage: field.stage,
      serviceType: field.serviceType ?? "",
      label: field.label,
      fieldType: field.fieldType,
      options: (field.options ?? []).join(", "),
      required: field.required,
      order: String(field.order),
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreateStage(null);
  };

  const needsOptions = FIELD_TYPES_WITH_OPTIONS.includes(form.fieldType);

  const handleSave = async () => {
    if (!form.label.trim()) {
      setMessage("Label is required.");
      return;
    }
    const options = parseOptions(form.options);
    if (needsOptions && options.length === 0) {
      setMessage(`${CUSTOM_FORM_FIELD_TYPE_LABELS[form.fieldType]} fields need at least one option.`);
      return;
    }
    setIsSaving(true);
    const order = Number(form.order) || 0;
    const [, error] = editingId
      ? await UpdateCustomFormFieldAction(editingId, {
          label: form.label.trim(),
          options: needsOptions ? options : undefined,
          required: form.required,
          order,
        })
      : await CreateCustomFormFieldAction({
          stage: form.stage,
          serviceType: form.serviceType || undefined,
          label: form.label.trim(),
          fieldType: form.fieldType,
          options: needsOptions ? options : undefined,
          required: form.required,
          order,
        });
    setIsSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage(editingId ? "Field updated." : "Field created.");
    cancelForm();
    load();
  };

  const handleToggleActive = async (field: ICustomFormField) => {
    const [, error] = await UpdateCustomFormFieldAction(field.id, { isActive: !field.isActive });
    setMessage(error || (field.isActive ? "Deactivated." : "Activated."));
    load();
  };

  const handleDelete = async (field: ICustomFormField) => {
    if (!confirm(`Delete field "${field.label}"?`)) return;
    const [, error] = await DeleteCustomFormFieldAction(field.id);
    setMessage(error || "Deleted.");
    load();
  };

  const formOpen = !!createStage || !!editingId;

  return (
    <div className="space-y-8">
      {!hideHeading && (
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Custom Form Fields</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Add extra questions to any student-registration or tutor-onboarding step without a code change. Fields
            can be scoped to a single service (by slug) or left unscoped to appear for all services.
          </p>
        </div>
      )}

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {formOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">{editingId ? "Edit field" : `Add field — ${CUSTOM_FORM_STAGE_LABELS[form.stage]}`}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Service scope</label>
              {editingId || serviceLocked ? (
                <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 font-mono">{form.serviceType || "All services"}</div>
              ) : (
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.serviceName} ({s.slug})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Field type</label>
              {editingId ? (
                <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50">{CUSTOM_FORM_FIELD_TYPE_LABELS[form.fieldType]}</div>
              ) : (
                <select
                  value={form.fieldType}
                  onChange={(e) => setForm((p) => ({ ...p, fieldType: e.target.value as CustomFormFieldType }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {Object.values(CustomFormFieldType).map((t) => (
                    <option key={t} value={t}>
                      {CUSTOM_FORM_FIELD_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-500">Label</label>
              <input
                placeholder="What is your preferred learning style?"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {needsOptions && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-500">Options (comma-separated)</label>
                <textarea
                  rows={2}
                  placeholder="Visual, Auditory, Kinesthetic"
                  value={form.options}
                  onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))}
                className="rounded border-gray-300"
                id="cff-required"
              />
              <label htmlFor="cff-required" className="text-sm text-gray-700">
                Required
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create field"}
            </button>
            <button onClick={cancelForm} className="text-sm text-gray-500 hover:underline px-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {CUSTOM_FORM_STAGES.map((stage) => (
        <div key={stage} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{CUSTOM_FORM_STAGE_LABELS[stage]}</h2>
            <button onClick={() => openCreate(stage)} className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50">
              Add field
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <p className="text-sm text-gray-500 p-6">Loading...</p>
            ) : (fieldsByStage.get(stage) ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 p-4">No custom fields for this stage yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="p-3 w-16">Order</th>
                    <th className="p-3">Label</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Options</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Service scope</th>
                    <th className="p-3">Active</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(fieldsByStage.get(stage) ?? []).map((f) => (
                    <tr key={f.id}>
                      <td className="p-3">{f.order}</td>
                      <td className="p-3">{f.label}</td>
                      <td className="p-3 text-xs">{CUSTOM_FORM_FIELD_TYPE_LABELS[f.fieldType]}</td>
                      <td className="p-3 text-xs text-gray-500">{f.options && f.options.length > 0 ? f.options.join(", ") : "—"}</td>
                      <td className="p-3">
                        {f.required ? (
                          <span className="text-xs rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">Required</span>
                        ) : (
                          <span className="text-xs text-gray-400">Optional</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs">{f.serviceType || "All services"}</td>
                      <td className="p-3">
                        <button onClick={() => handleToggleActive(f)} className={f.isActive ? "text-green-600" : "text-gray-400"}>
                          {f.isActive ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(f)} className="text-xs text-blue-600 hover:underline mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(f)} className="text-xs text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
