"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { GetTutorFilterOptionsAction, type TutorFilterOptions } from "@/server/tutor-filters";

export type TutorSortKey = "newest" | "oldest" | "experience" | "name";

export interface TutorFilterValues {
  q: string;
  service: string[];
  subject: string[];
  curriculum: string[];
  gradeLevel: string[];
  examBoard: string[];
  ageRange: string[];
  country: string[];
  language: string[];
  qualification: string[];
  classFormat: string[];
  minYears: string;
  maxYears: string;
  // Hourly pay the tutor expects: matches tutors whose own range overlaps this one (amounts are converted to payCurrency).
  minPay: string;
  maxPay: string;
  payCurrency: string;
  availableDay: string[];
  availableFrom: string;
  availableTo: string;
  dateFrom: string;
  dateTo: string;
  sort: TutorSortKey;
}

export const emptyTutorFilters = (): TutorFilterValues => ({
  q: "",
  service: [],
  subject: [],
  curriculum: [],
  gradeLevel: [],
  examBoard: [],
  ageRange: [],
  country: [],
  language: [],
  qualification: [],
  classFormat: [],
  minYears: "",
  maxYears: "",
  minPay: "",
  maxPay: "",
  payCurrency: "NGN",
  availableDay: [],
  availableFrom: "",
  availableTo: "",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
});

// Query-string params the backend understands (see stcbe's core/utils/tutor-facets.ts parseTutorFilters). Empty values are left out.
// The users list calls its name search "search", the applications list calls it "q" - pass searchKey to pick.
export function tutorFiltersToParams(v: TutorFilterValues, opts: { searchKey?: string } = {}): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (k: string, val: string | string[]) => {
    const s = Array.isArray(val) ? val.join(",") : val.trim();
    if (s) out[k] = s;
  };
  put(opts.searchKey ?? "q", v.q);
  (["service", "subject", "curriculum", "gradeLevel", "examBoard", "ageRange", "country", "language", "qualification", "classFormat", "availableDay"] as const).forEach((k) => put(k, v[k]));
  (["minYears", "maxYears", "availableFrom", "availableTo", "dateFrom", "dateTo"] as const).forEach((k) => put(k, v[k]));
  // The currency only means something alongside an amount.
  if (v.minPay.trim() || v.maxPay.trim()) {
    put("minPay", v.minPay);
    put("maxPay", v.maxPay);
    put("payCurrency", v.payCurrency);
  }
  if (v.sort !== "newest") out.sort = v.sort;
  return out;
}

export function activeTutorFilterCount(v: TutorFilterValues): number {
  const arrays = [v.service, v.subject, v.curriculum, v.gradeLevel, v.examBoard, v.ageRange, v.country, v.language, v.qualification, v.classFormat, v.availableDay];
  const strings = [v.minYears, v.maxYears, v.minPay, v.maxPay, v.availableFrom, v.availableTo, v.dateFrom, v.dateTo];
  return arrays.filter((a) => a.length > 0).length + strings.filter((s) => s !== "").length;
}

const PAY_CURRENCIES = ["NGN", "USD", "GBP", "EUR", "CAD", "GHS", "ZAR", "KES", "AUD", "AED", "INR"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CLASS_FORMATS = [
  { value: "ONE_ON_ONE_ONLY", label: "One-on-one" },
  { value: "GROUP_ONLY", label: "Group" },
  { value: "BOTH", label: "Both" },
];

// Checkbox dropdown with its own filter box - handles long lists (hundreds of subjects) without a heavy combobox dependency.
function CheckDropdown({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const shown = options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm bg-white ${value.length ? "border-blue-500 text-blue-700" : "text-gray-600"}`}
      >
        <span className="truncate">{value.length ? `${label} (${value.length})` : label}</span>
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-64 rounded-md border bg-white p-2 shadow-lg">
            {options.length > 8 && (
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`Find ${label.toLowerCase()}...`} className="mb-2 w-full rounded border px-2 py-1 text-sm" />
            )}
            <div className="max-h-56 overflow-y-auto">
              {shown.length === 0 ? (
                <p className="px-2 py-1 text-sm text-gray-400">Nothing to choose from yet.</p>
              ) : (
                shown.map((o) => (
                  <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
                    <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
                    <span>{o.label}</span>
                  </label>
                ))
              )}
            </div>
            {value.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="mt-2 text-xs text-blue-600 hover:underline">
                Clear
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const plain = (list: string[] | undefined) => (list ?? []).map((v) => ({ value: v, label: v }));

interface Props {
  value: TutorFilterValues;
  onChange: (v: TutorFilterValues) => void;
  // Application review list only: filter by when the application was submitted.
  showDates?: boolean;
  // Hide the name/email box where the host screen already has its own search.
  hideSearch?: boolean;
  // Lists whose order is fixed by the host screen (e.g. the allocation picker).
  hideSort?: boolean;
  searchPlaceholder?: string;
}

// Shared filter + sort panel for tutors: review list, approved roster, allocation pickers. Every filter is applied server-side.
export function TutorFilterBar({ value, onChange, showDates, hideSearch, hideSort, searchPlaceholder }: Props) {
  const [options, setOptions] = useState<TutorFilterOptions | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [qDraft, setQDraft] = useState(value.q);
  const set = <K extends keyof TutorFilterValues>(key: K, v: TutorFilterValues[K]) => onChange({ ...value, [key]: v });
  const count = activeTutorFilterCount(value);

  useEffect(() => {
    GetTutorFilterOptionsAction().then(([res]) => setOptions(res?.data ?? null));
  }, []);

  // Typing in the search box applies after a short pause rather than on every keystroke.
  useEffect(() => {
    if (qDraft === value.q) return;
    const t = setTimeout(() => set("q", qDraft), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDraft]);
  useEffect(() => setQDraft(value.q), [value.q]);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {!hideSearch && (
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={qDraft} onChange={(e) => setQDraft(e.target.value)} placeholder={searchPlaceholder ?? "Search name or email..."} className="w-full rounded-md border py-2 pl-9 pr-3 text-sm" />
          </div>
        )}
        <button type="button" onClick={() => setExpanded((e) => !e)} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          Filters{count > 0 ? ` (${count})` : ""}
        </button>
        {!hideSort && (
        <select value={value.sort} onChange={(e) => set("sort", e.target.value as TutorSortKey)} className="rounded-md border bg-white px-3 py-2 text-sm" aria-label="Sort tutors">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="experience">Most experienced</option>
          <option value="name">Name A-Z</option>
        </select>
        )}
        {(count > 0 || value.q) && (
          <button type="button" onClick={() => onChange({ ...emptyTutorFilters(), sort: value.sort })} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <X className="h-4 w-4" /> Clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">What they teach</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <CheckDropdown label="Service" options={plain(options?.services)} value={value.service} onChange={(v) => set("service", v)} />
              <CheckDropdown label="Subject" options={plain(options?.subjects)} value={value.subject} onChange={(v) => set("subject", v)} />
              <CheckDropdown label="Curriculum" options={plain(options?.curricula)} value={value.curriculum} onChange={(v) => set("curriculum", v)} />
              <CheckDropdown label="Grade level" options={plain(options?.gradeLevels)} value={value.gradeLevel} onChange={(v) => set("gradeLevel", v)} />
              <CheckDropdown label="Exam board" options={plain(options?.examBoards)} value={value.examBoard} onChange={(v) => set("examBoard", v)} />
              <CheckDropdown label="Age range" options={plain(options?.ageRanges)} value={value.ageRange} onChange={(v) => set("ageRange", v)} />
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">When they are free (their own timezone)</p>
            <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-4">
              <CheckDropdown label="Day" options={WEEKDAYS.map((d) => ({ value: d, label: d }))} value={value.availableDay} onChange={(v) => set("availableDay", v)} />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                From
                <input type="time" value={value.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                To
                <input type="time" value={value.availableTo} onChange={(e) => set("availableTo", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-400">Pick several days to find tutors free on all of them; add a time window to require it fits inside their open hours.</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Profile</p>
            <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-4">
              <CheckDropdown label="Country" options={plain(options?.countries)} value={value.country} onChange={(v) => set("country", v)} />
              <CheckDropdown label="Language" options={plain(options?.languages)} value={value.language} onChange={(v) => set("language", v)} />
              <CheckDropdown label="Qualification" options={plain(options?.qualifications)} value={value.qualification} onChange={(v) => set("qualification", v)} />
              <CheckDropdown label="Class format" options={CLASS_FORMATS} value={value.classFormat} onChange={(v) => set("classFormat", v)} />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Min yrs
                <input type="number" min={0} value={value.minYears} onChange={(e) => set("minYears", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Max yrs
                <input type="number" min={0} value={value.maxYears} onChange={(e) => set("maxYears", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
              </label>
              <div className="col-span-2 md:col-span-4">
                <p className="mb-1 text-xs text-gray-500">Expected pay per hour - finds tutors whose own range overlaps yours</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={value.payCurrency} onChange={(e) => set("payCurrency", e.target.value)} aria-label="Currency" className="rounded-md border bg-white px-2 py-1.5 text-sm">
                    {PAY_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Min
                    <input type="number" min={0} value={value.minPay} onChange={(e) => set("minPay", e.target.value)} className="w-28 rounded-md border px-2 py-1.5" />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Max
                    <input type="number" min={0} value={value.maxPay} onChange={(e) => set("maxPay", e.target.value)} className="w-28 rounded-md border px-2 py-1.5" />
                  </label>
                </div>
              </div>
              {showDates && (
                <>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Applied from
                    <input type="date" value={value.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    to
                    <input type="date" value={value.dateTo} onChange={(e) => set("dateTo", e.target.value)} className="w-full rounded-md border px-2 py-1.5" />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
