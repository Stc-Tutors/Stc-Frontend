// Client-side CSV export for the People lists (Tutors, Students, Parents, Users).
// Rows come from the same list endpoints the tables use, so the backend's
// per-viewer contact masking already applies - an admin can never export more
// than they can see on screen.

export type CsvColumn<T> = { header: string; value: (row: T) => unknown };

// Spreadsheet apps execute cells starting with these as formulas (CSV injection).
// A user-controlled name like "=HYPERLINK(...)" must land as plain text.
// Phone numbers ("+234 801 ...") and plain numbers can't carry a payload, so they stay untouched.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const PHONE_OR_NUMBER = /^[+-]?[\d\s().-]+$/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (FORMULA_PREFIX.test(text) && !PHONE_OR_NUMBER.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((c) => cell(c.header)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => cell(c.value(row))).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel opens UTF-8 names (accents, non-Latin scripts) correctly.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function csvFilename(base: string) {
  return `${base}-${new Date().toISOString().slice(0, 10)}.csv`;
}

type PageResult<T> = [{ data?: T[]; meta?: { total: number; limit: number } } | null, string | null];

// Walks every page of a paginated list endpoint. Stops on an error, an empty or
// short page, or once `total` is reached; hard-capped so a bad `total` can't loop forever.
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PageResult<T>>,
  pageSize = 100,
  maxPages = 500
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const [res, error] = await fetchPage(page, pageSize);
    if (error) throw new Error(error);
    const items = res?.data ?? [];
    all.push(...items);
    const total = res?.meta?.total;
    if (items.length < pageSize || (total !== undefined && all.length >= total)) break;
  }
  return all;
}

export function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}
