"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Printer, Search, X } from "lucide-react";
import { Markdown, buildSearchIndex, buildToc } from "./markdown";

export interface ManualSection {
  id: string;
  title: string;
  summary: string;
  // True for the manual(s) that describe the signed-in person's own role; the rest are reference reading.
  primary: boolean;
  markdown: string;
}

interface Props {
  sections: ManualSection[];
  title?: string;
  intro?: string;
}

// Reads a long Markdown manual comfortably: one tab per manual, a contents list that follows the page, search across everything the
// person may read, and a print button (the page prints without the menus, so "Save as PDF" gives a clean copy).
export default function ManualViewer({ sections, title = "User Manual", intro }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  const tocs = useMemo(() => Object.fromEntries(sections.map((s) => [s.id, buildToc(s.markdown, s.id)])), [sections]);
  const indexes = useMemo(() => sections.map((s) => ({ section: s, entries: buildSearchIndex(s.markdown, s.id) })), [sections]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: { sectionId: string; sectionTitle: string; headingId: string; heading: string; snippet: string }[] = [];
    const seen = new Set<string>();
    for (const { section, entries } of indexes) {
      for (const e of entries) {
        const at = e.text.toLowerCase().indexOf(q);
        if (at < 0) continue;
        const key = `${section.id}:${e.headingId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const start = Math.max(0, at - 50);
        hits.push({
          sectionId: section.id,
          sectionTitle: section.title,
          headingId: e.headingId,
          heading: e.heading,
          snippet: (start > 0 ? "..." : "") + e.text.slice(start, at + q.length + 90) + (e.text.length > at + q.length + 90 ? "..." : ""),
        });
        if (hits.length >= 40) return hits;
      }
    }
    return hits;
  }, [query, indexes]);

  const jump = (sectionId: string, headingId: string) => {
    setActiveId(sectionId);
    setQuery("");
    // Wait for the chosen manual to render before scrolling to its heading.
    window.setTimeout(() => document.getElementById(headingId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  // Switching manual starts the new one at the top (scrollIntoView works whichever element the page scrolls inside). Skipped on first load.
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ block: "start" });
  }, [activeId]);

  if (!active) {
    return <p className="p-6 text-sm text-gray-500">No manual is available for your account yet.</p>;
  }

  const primary = sections.filter((s) => s.primary);
  const reference = sections.filter((s) => !s.primary);
  const toc = tocs[active.id] ?? [];

  const tabButton = (s: ManualSection) => (
    <button
      key={s.id}
      type="button"
      onClick={() => setActiveId(s.id)}
      aria-current={s.id === active.id ? "page" : undefined}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
        s.id === active.id
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
      }`}
    >
      {s.title}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div ref={topRef} aria-hidden />
      <header className="mb-6 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
              <BookOpen className="h-6 w-6 text-blue-600" aria-hidden /> {title}
            </h1>
            {intro && <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">{intro}</p>}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
          >
            <Printer className="h-4 w-4" aria-hidden /> Print or save as PDF
          </button>
        </div>

        <div className="relative mt-4 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the manual (for example: reschedule, payout, wallet)..."
            aria-label="Search the manual"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {query.trim().length >= 2 && (
          <div className="mt-3 max-w-3xl rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Nothing found for &ldquo;{query}&rdquo;. Try a simpler word.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
                {results.map((r) => (
                  <li key={`${r.sectionId}:${r.headingId}`}>
                    <button type="button" onClick={() => jump(r.sectionId, r.headingId)} className="block w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-800">
                      <span className="block text-xs text-gray-500">{r.sectionTitle}</span>
                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{r.heading || "Introduction"}</span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400">{r.snippet}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {primary.length > 0 && <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Your manual</span>}
            {primary.map(tabButton)}
          </div>
          {reference.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Other roles (reference)</span>
              {reference.map(tabButton)}
            </div>
          )}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Contents" className="mb-6 print:hidden lg:sticky lg:top-4 lg:mb-0 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">On this page</p>
          <ul className="space-y-1 border-l border-gray-200 text-sm dark:border-gray-700">
            {toc
              .filter((t) => t.level >= 2)
              .map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`block border-l-2 border-transparent py-0.5 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 ${
                      t.level === 3 ? "pl-6 text-gray-500" : "pl-3 font-medium text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {t.text}
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8 print:border-0 print:p-0 print:shadow-none">
          <p className="mb-4 text-sm text-gray-500">{active.summary}</p>
          <Markdown markdown={active.markdown} idPrefix={active.id} />
        </article>
      </div>
    </div>
  );
}
