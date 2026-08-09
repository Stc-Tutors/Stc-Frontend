"use client";

import { useEffect, useRef, useState } from "react";
import {
  BatchUploadTaxonomyOptionsAction,
  CreateTaxonomyOptionAction,
  DeleteTaxonomyOptionAction,
  GetAdminTaxonomyOptionsAction,
  UpdateTaxonomyOptionAction,
} from "@/server/taxonomy-option";
import { BatchTaxonomyOption, ITaxonomyOption, TAXONOMY_OPTION_KIND_LABELS, TaxonomyOptionKind } from "@/types/service-catalog";

const KIND_TABS: TaxonomyOptionKind[] = [TaxonomyOptionKind.COUNTRY, TaxonomyOptionKind.LANGUAGE, TaxonomyOptionKind.AGE_RANGE];

interface OptionForm {
  value: string;
  label: string;
  order: string;
}

const emptyForm = (): OptionForm => ({ value: "", label: "", order: "0" });

// Flat single-level lookup lists (Country / Language / Age Range) - simpler
// than the tree-shaped curriculum taxonomy (see curriculum-taxonomy/page.tsx),
// so one kind selector + shared CRUD table covers all three. Backs
// child-info.tsx's/subjects-schedule.tsx's Country/Age Range dropdowns.
export default function TaxonomyOptionsPage() {
  const [kind, setKind] = useState<TaxonomyOptionKind>(TaxonomyOptionKind.COUNTRY);
  const [options, setOptions] = useState<ITaxonomyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<OptionForm>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetAdminTaxonomyOptionsAction(kind);
    setIsLoading(false);
    if (error) {
      setMessage(error);
      return;
    }
    setOptions(res?.data ?? []);
  };

  useEffect(() => {
    load();
    setEditingId(null);
    setShowCreate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowCreate(true);
  };

  const openEdit = (option: ITaxonomyOption) => {
    setShowCreate(false);
    setEditingId(option.id);
    setForm({ value: option.value, label: option.label, order: String(option.order) });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowCreate(false);
  };

  const handleSave = async () => {
    if (!form.label.trim() || (!editingId && !form.value.trim())) {
      setMessage("Value and label are required.");
      return;
    }
    setIsSaving(true);
    const order = Number(form.order) || 0;
    const [, error] = editingId
      ? await UpdateTaxonomyOptionAction(editingId, { label: form.label.trim(), order })
      : await CreateTaxonomyOptionAction({ kind, value: form.value.trim(), label: form.label.trim(), order });
    setIsSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage(editingId ? "Option updated." : "Option created.");
    cancelForm();
    load();
  };

  const handleToggleActive = async (option: ITaxonomyOption) => {
    const [, error] = await UpdateTaxonomyOptionAction(option.id, { isActive: !option.isActive });
    setMessage(error || (option.isActive ? "Deactivated." : "Activated."));
    load();
  };

  const handleDelete = async (option: ITaxonomyOption) => {
    if (!confirm(`Delete "${option.label}"?`)) return;
    const [, error] = await DeleteTaxonomyOptionAction(option.id);
    setMessage(error || "Deleted.");
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
      const uploadKind: TaxonomyOptionKind = parsed.kind ?? kind;
      const uploaded: BatchTaxonomyOption[] = parsed.options;
      if (!Array.isArray(uploaded)) {
        throw new Error('JSON must be an object shaped { kind, options: [{ value, label, order? }] }.');
      }
      const [, error] = await BatchUploadTaxonomyOptionsAction(uploadKind, uploaded);
      setMessage(error || `Uploaded ${uploaded.length} option(s).`);
      if (!error) {
        setKind(uploadKind);
        load();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not parse the JSON file.");
    } finally {
      setIsUploading(false);
    }
  };

  const formOpen = showCreate || !!editingId;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Taxonomy Options</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Flat lookup lists used by simple single-level dropdowns (Country, Language, Age Range) across
            registration and onboarding forms.
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
            Add option
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="flex gap-6 border-b border-gray-200 text-sm">
        {KIND_TABS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`pb-3 border-b-2 ${kind === k ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-400"}`}
          >
            {TAXONOMY_OPTION_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {formOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit" : "Add"} {TAXONOMY_OPTION_KIND_LABELS[kind].toLowerCase()} option
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Value (machine key)</label>
              <input
                placeholder="NG"
                value={form.value}
                disabled={!!editingId}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Label (shown to users)</label>
              <input
                placeholder="Nigeria"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
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
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create option"}
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
        ) : options.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No {TAXONOMY_OPTION_KIND_LABELS[kind].toLowerCase()} options yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Value</th>
                <th className="p-3">Label</th>
                <th className="p-3">Order</th>
                <th className="p-3">Active</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {options.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono text-xs">{o.value}</td>
                  <td className="p-3">{o.label}</td>
                  <td className="p-3">{o.order}</td>
                  <td className="p-3">
                    <button onClick={() => handleToggleActive(o)} className={o.isActive ? "text-green-600" : "text-gray-400"}>
                      {o.isActive ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(o)} className="text-xs text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(o)} className="text-xs text-red-600 hover:underline">
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
  );
}
