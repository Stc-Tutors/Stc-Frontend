"use client";

import { useEffect, useState } from "react";
import {
  CreateServicePricingAction,
  DeleteServicePricingAction,
  GetAdminServicePricingAction,
  UpdateServicePricingAction,
} from "@/server/service-pricing";
import { GetCoursesAction } from "@/server/course";
import { GetServicesAction } from "@/server/service-catalog";
import { CURRENCIES, CurrencyCode, EnrollmentServiceType, PricePoint, ServicePricing } from "@/types/service-pricing";
import { Course } from "@/types/course";
import { IService } from "@/types/service-catalog";
import { CurriculumNode, CurriculumNodeType } from "@/types/curriculum";
import CurriculumTreeBrowser from "@/components/curriculum-tree-browser";

// Same management screen as Stc-SuperAdmin's service-pricing page (same
// component even, CurriculumTreeBrowser), ported here so an ADMIN with the
// MANAGE_PRICING permission (not just SUPER_ADMIN) can also set rates - see
// stcbe ServicePricingService.assertCanManagePricing. The service list and
// the Country/Curriculum/Grade Level/Subject picker are both driven by the
// live Service Catalog (see IService.taxonomyStages) rather than a hardcoded
// list, so any service a Super Admin adds gets priced the same way - and
// picking from the tree (rather than typing) is what actually makes a row
// match a real student's price quote, since ServicePricingRepository.
// findMatching is a strict exact match per dimension.
type DraftPrice = { currency: CurrencyCode; rateField: "ratePerHour" | "flatRate"; rateValue: string };

function emptyDraftPrice(): DraftPrice {
  return { currency: "NGN", rateField: "ratePerHour", rateValue: "" };
}

function draftPricesToPricePoints(rows: DraftPrice[]): PricePoint[] | null {
  const prices: PricePoint[] = [];
  for (const row of rows) {
    const value = Number(row.rateValue);
    if (!row.rateValue || Number.isNaN(value) || value < 0) return null;
    prices.push({ currency: row.currency, [row.rateField]: value });
  }
  return prices.length > 0 ? prices : null;
}

function PriceRowsEditor({ rows, onChange }: { rows: DraftPrice[]; onChange: (rows: DraftPrice[]) => void }) {
  const update = (i: number, patch: Partial<DraftPrice>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={row.currency}
            onChange={(e) => update(i, { currency: e.target.value as CurrencyCode })}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={row.rateField}
            onChange={(e) => update(i, { rateField: e.target.value as DraftPrice["rateField"] })}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            <option value="ratePerHour">Rate per hour</option>
            <option value="flatRate">Flat rate</option>
          </select>
          <input
            type="number"
            min={0}
            placeholder="Amount"
            value={row.rateValue}
            onChange={(e) => update(i, { rateValue: e.target.value })}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-28"
          />
          {rows.length > 1 && (
            <button onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-red-600 text-xs hover:underline">
              Remove
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...rows, emptyDraftPrice()])} className="text-xs font-medium text-blue-600 hover:underline">
        + Add a price in another currency
      </button>
    </div>
  );
}

export default function ServicePricingPage() {
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [serviceType, setServiceType] = useState<EnrollmentServiceType>("");
  const [curriculum, setCurriculum] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [courseId, setCourseId] = useState("");
  const [country, setCountry] = useState("");
  const [draftPrices, setDraftPrices] = useState<DraftPrice[]>([emptyDraftPrice()]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<DraftPrice[]>([]);

  // The taxonomy tree this service actually has - [] means no tree at all
  // (e.g. Adult Education), so Country/Curriculum/Subject are plain free-text
  // context fields instead of picked from a tree.
  const stages = services.find((s) => s.slug === serviceType)?.taxonomyStages ?? [];
  const hasTree = stages.length > 0;

  // Picking a node in the tree resolves Country/Curriculum/Grade Level/
  // Subject from its breadcrumb path.
  const handleTaxonomySelect = (node: CurriculumNode, path: CurriculumNode[]) => {
    setSelectedNodeId(node.id);
    const fullPath = [...path, node];
    setCountry(fullPath.find((n) => n.type === CurriculumNodeType.COUNTRY)?.name ?? "");
    setCurriculum(fullPath.find((n) => n.type === CurriculumNodeType.CURRICULUM)?.name ?? "");
    setGradeLevel(fullPath.find((n) => n.type === CurriculumNodeType.LEVEL)?.name ?? "");
    setSubject(fullPath.find((n) => n.type === CurriculumNodeType.SUBJECT)?.name ?? "");
  };

  // Switching services invalidates whatever node was picked in the old tree.
  useEffect(() => {
    setSelectedNodeId(undefined);
    setCountry("");
    setCurriculum("");
    setGradeLevel("");
    setSubject("");
  }, [serviceType]);

  const load = async () => {
    setIsLoading(true);
    const [[pricingRes], [coursesRes], [servicesRes]] = await Promise.all([
      GetAdminServicePricingAction(),
      GetCoursesAction({}),
      GetServicesAction(),
    ]);
    setPricing(pricingRes?.data ?? []);
    setCourses(coursesRes?.data ?? []);
    setServices(servicesRes?.data ?? []);
    setServiceType((prev) => prev || servicesRes?.data?.[0]?.slug || "");
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const courseTitleById = (id?: string) => courses.find((c) => c.id === id)?.title ?? id;

  const handleCreate = async () => {
    const prices = draftPricesToPricePoints(draftPrices);
    if (!prices) {
      setMessage("Enter a valid non-negative amount for every currency row");
      return;
    }
    setIsSaving(true);
    const [, error] = await CreateServicePricingAction({
      serviceType,
      curriculum: curriculum || undefined,
      gradeLevel: gradeLevel || undefined,
      subject: subject || undefined,
      courseId: courseId || undefined,
      country: country || undefined,
      prices,
    });
    setIsSaving(false);
    setMessage(error || "Pricing row created");
    if (!error) {
      setCurriculum("");
      setGradeLevel("");
      setSubject("");
      setCourseId("");
      setCountry("");
      setSelectedNodeId(undefined);
      setDraftPrices([emptyDraftPrice()]);
    }
    load();
  };

  const startEditingPrices = (row: ServicePricing) => {
    setEditingRowId(row.id);
    setEditingPrices(
      row.prices.map((p) => ({
        currency: p.currency,
        rateField: p.flatRate != null ? "flatRate" : "ratePerHour",
        rateValue: String(p.flatRate ?? p.ratePerHour ?? ""),
      }))
    );
  };

  const saveEditingPrices = async () => {
    if (!editingRowId) return;
    const prices = draftPricesToPricePoints(editingPrices);
    if (!prices) {
      setMessage("Enter a valid non-negative amount for every currency row");
      return;
    }
    const [, error] = await UpdateServicePricingAction(editingRowId, { prices });
    setMessage(error || "Updated");
    setEditingRowId(null);
    load();
  };

  const handleToggleActive = async (row: ServicePricing) => {
    const [, error] = await UpdateServicePricingAction(row.id, { isActive: !row.isActive });
    setMessage(error || (row.isActive ? "Deactivated" : "Activated"));
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing row?")) return;
    const [, error] = await DeleteServicePricingAction(id);
    setMessage(error || "Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Service Pricing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Every priced combination of service, curriculum, grade level, subject, course, and country is its own
          explicit row — exact match only, no fallback pricing. Each row can carry a distinct amount per currency.
        </p>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Add pricing row</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.serviceName}
              </option>
            ))}
          </select>
          {!hasTree && (
            <>
              <input placeholder="Curriculum (optional)" value={curriculum} onChange={(e) => setCurriculum(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input placeholder="Country (optional)" value={country} onChange={(e) => setCountry(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input placeholder="Grade level (optional)" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </>
          )}
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">No specific course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        {hasTree && (
          <div className="space-y-2">
            {(curriculum || gradeLevel || subject || country) && (
              <p className="text-xs text-gray-500">
                Selected: {country || "—"} · {curriculum || "—"} · {gradeLevel || "—"} · {subject || "—"}
              </p>
            )}
            <CurriculumTreeBrowser
              key={serviceType}
              serviceType={serviceType}
              stages={stages}
              selectable
              selectedId={selectedNodeId}
              onSelect={handleTaxonomySelect}
            />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1.5">Prices</p>
          <PriceRowsEditor rows={draftPrices} onChange={setDraftPrices} />
        </div>
        <button
          onClick={handleCreate}
          disabled={isSaving}
          className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Add row"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-6">Loading...</p>
        ) : pricing.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No pricing rows yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Service</th>
                <th className="p-3">Curriculum</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Course</th>
                <th className="p-3">Country</th>
                <th className="p-3">Prices</th>
                <th className="p-3">Active</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pricing.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="p-3">{row.serviceType}</td>
                  <td className="p-3">{row.curriculum ?? "-"}</td>
                  <td className="p-3">{row.gradeLevel ?? "-"}</td>
                  <td className="p-3">{row.subject ?? "-"}</td>
                  <td className="p-3">{courseTitleById(row.courseId) ?? "-"}</td>
                  <td className="p-3">{row.country ?? "-"}</td>
                  <td className="p-3">
                    {editingRowId === row.id ? (
                      <div className="space-y-2">
                        <PriceRowsEditor rows={editingPrices} onChange={setEditingPrices} />
                        <div className="flex gap-2">
                          <button onClick={saveEditingPrices} className="text-xs font-medium text-blue-600 hover:underline">
                            Save
                          </button>
                          <button onClick={() => setEditingRowId(null)} className="text-xs text-gray-500 hover:underline">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {row.prices.map((p, i) => (
                          <div key={i} className="text-gray-700">
                            {p.currency} {p.flatRate ?? p.ratePerHour} {p.flatRate != null ? "(flat)" : "(/hr)"}
                          </div>
                        ))}
                        <button onClick={() => startEditingPrices(row)} className="text-xs font-medium text-blue-600 hover:underline">
                          Edit prices
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleToggleActive(row)} className={row.isActive ? "text-green-600" : "text-gray-400"}>
                      {row.isActive ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:underline">
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
