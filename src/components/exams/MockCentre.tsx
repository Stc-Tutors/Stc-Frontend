"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import {
  AddMockQuestionsAction,
  CheckoutMockCoinPackageAction,
  DeleteMockQuestionAction,
  GetMockCatalogAdminAction,
  GetMockCoinPackagesAction,
  GetMockCoinPurchaseStatusAction,
  GetMockExamSubjectsAction,
  GetMockPricingAdmin,
  GetMockUnlockStatusAction,
  GiveMockCoinsAction,
  ImportMockQuestionsAction,
  ListMockAccessAction,
  ListMockCoinPurchasesAction,
  ListMockQuestionsAction,
  ListMockResultsAction,
  ListMockStcStudentsAction,
  RetryMockCoinPurchaseAction,
  SaveMockPricingAction,
  SearchMockLearnersAction,
  SetMockAccessAction,
  SetMockExamAccessAction,
  SetMockStudentSubjectsAction,
  UnlockMockExamAction,
} from "@/server/exam-mock";
import type {
  MockAccessRow,
  MockAttempt,
  MockCatalog,
  MockCoinPackages,
  MockExamSubjects,
  MockLearnerHit,
  MockOwnQuestion,
  MockPricing,
  MockPurchase,
  MockStcStudent,
} from "@/types/exam-mock";

type Notify = (text: string, ok?: boolean) => void;
type Tab = "access" | "exams" | "bank" | "students" | "results" | "pricing";

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";
const box = "rounded-xl border bg-white p-4 space-y-3";
const SOURCES = [
  { v: "stc", label: "STC's questions" },
  { v: "own", label: "Our own questions" },
  { v: "both", label: "Both combined" },
];

// The school's whole mock-exam setup in one place (admins and Super Admins; identical in both apps). Everything is live STC Exams
// data except the per-student switch and the family coin price, which belong to the LMS. Pass isSuper to allow editing the price.
export default function MockCentre({ isSuper, backHref }: { isSuper: boolean; backHref: string }) {
  const [tab, setTab] = useState<Tab>("access");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const notify: Notify = (text, ok = false) => setMessage({ text, ok });

  const tabs: { key: Tab; label: string }[] = [
    { key: "access", label: "Who can practise" },
    { key: "exams", label: "Exams" },
    { key: "bank", label: "Question bank" },
    { key: "students", label: "Students & coins" },
    { key: "results", label: "Results" },
    { key: "pricing", label: "Price & purchases" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Link href={backHref} className="text-sm text-blue-600 hover:underline">
          ← All exams
        </Link>
        <h1 className="text-2xl font-bold mt-1">Mock exams</h1>
        <p className="text-sm text-gray-500">
          Practice tests from STC Exams&apos; school question bank. Switch them on for the students who should have them, choose the exams and
          questions, and give or sell coins.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => {
              setTab(t.key);
              setMessage(null);
            }}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {message && (
        <p className={`text-sm rounded-md p-2 ${message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{message.text}</p>
      )}

      {tab === "access" && <AccessTab notify={notify} />}
      {tab === "exams" && <ExamsTab notify={notify} />}
      {tab === "bank" && <BankTab notify={notify} />}
      {tab === "students" && <StudentsTab notify={notify} />}
      {tab === "results" && <ResultsTab notify={notify} />}
      {tab === "pricing" && <PricingTab notify={notify} isSuper={isSuper} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// Who can practise: the per-student switch (off for everyone until an admin turns it on) and subject limits.
// ---------------------------------------------------------------------------------------------------------------------------
function AccessTab({ notify }: { notify: Notify }) {
  const [rows, setRows] = useState<MockAccessRow[]>([]);
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<MockLearnerHit[]>([]);
  const [picked, setPicked] = useState<MockLearnerHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<MockCatalog | null>(null);
  const [editing, setEditing] = useState<MockAccessRow | null>(null);

  const load = useCallback(async () => {
    const [res, error] = await ListMockAccessAction();
    if (error) notify(error);
    setRows(res?.data ?? []);
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const [res] = await SearchMockLearnersAction(search);
      setHits(res?.data ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const enable = async () => {
    setBusy(true);
    const [res, error] = await SetMockAccessAction(picked.map((p) => p.key), true);
    if (error) notify(error);
    else {
      const failed = res?.data?.failed ?? [];
      notify(
        failed.length
          ? `Switched on for ${res?.data?.changed.length ?? 0}. Could not switch on ${failed.length}: ${failed[0].error}`
          : `Mock exams switched on for ${res?.data?.changed.length ?? 0} student(s)`,
        failed.length === 0
      );
      setPicked([]);
      setSearch("");
    }
    await load();
    setBusy(false);
  };

  const disable = async (key: string) => {
    setBusy(true);
    const [, error] = await SetMockAccessAction([key], false);
    if (error) notify(error);
    await load();
    setBusy(false);
  };

  const openLimits = async (row: MockAccessRow) => {
    setEditing(row);
    if (!catalog) {
      const [res, error] = await GetMockCatalogAdminAction();
      if (error) notify(error);
      setCatalog(res?.data ?? null);
    }
  };

  return (
    <div className="space-y-4">
      <section className={box}>
        <h2 className="font-semibold">Switch mock exams on for students</h2>
        <p className="text-xs text-gray-500">Nobody has mock exams until you turn them on here. Search for a child, add them, then switch on.</p>
        <input className={field} placeholder="Search a child by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {hits.length > 0 && (
          <ul className="rounded-md border divide-y text-sm">
            {hits
              .filter((h) => !picked.some((p) => p.key === h.key))
              .map((h) => (
                <li key={h.key}>
                  <button type="button" className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => setPicked([...picked, h])}>
                    {h.fullName} {h.grade ? <span className="text-gray-500">· {h.grade}</span> : null}
                  </button>
                </li>
              ))}
          </ul>
        )}
        {picked.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {picked.map((p) => (
              <span key={p.key} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
                {p.fullName}{" "}
                <button type="button" aria-label={`Remove ${p.fullName}`} onClick={() => setPicked(picked.filter((x) => x.key !== p.key))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <Button onClick={enable} disabled={busy || picked.length === 0}>
          Switch on {picked.length || ""}
        </Button>
      </section>

      <section className={box}>
        <h2 className="font-semibold">Students with mock exams ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">Nobody yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {rows.map((r) => (
              <li key={r.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {r.allowedSubjectIds ? `Limited to ${r.allowedSubjectIds.length} subject(s)` : "All subjects"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openLimits(r)} disabled={busy}>
                    Limit subjects
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => disable(r.learnerKey)} disabled={busy}>
                    Switch off
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <SubjectLimits
          row={editing}
          catalog={catalog}
          notify={notify}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function SubjectLimits({
  row,
  catalog,
  notify,
  onClose,
  onSaved,
}: {
  row: MockAccessRow;
  catalog: MockCatalog | null;
  notify: Notify;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [examId, setExamId] = useState<number | null>(null);
  const [data, setData] = useState<MockExamSubjects | null>(null);
  const [chosen, setChosen] = useState<Set<number>>(new Set(row.allowedSubjectIds ?? []));
  const [busy, setBusy] = useState(false);
  const exams = (catalog?.exams ?? []).filter((e) => e.access_enabled);

  const loadSubjects = async (id: number) => {
    setExamId(id);
    const [res, error] = await GetMockExamSubjectsAction(id);
    if (error) notify(error);
    setData(res?.data ?? null);
  };

  const toggle = (id: number) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChosen(next);
  };

  const save = async (ids: number[] | null) => {
    setBusy(true);
    const [, error] = await SetMockStudentSubjectsAction(row.learnerKey, ids);
    setBusy(false);
    if (error) return notify(error);
    notify(ids ? "Subject limit saved" : "This student can take every subject", true);
    onSaved();
  };

  return (
    <section className={box}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Subjects for {row.fullName}</h2>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Tick the subjects this student may take (across exams). Ticks are kept as you move between exams. &quot;All subjects&quot; removes the limit.
      </p>
      <select className={field} value={examId ?? ""} onChange={(e) => e.target.value && loadSubjects(Number(e.target.value))}>
        <option value="">Choose an exam to see its subjects...</option>
        {exams.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {data.subjects.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={chosen.has(s.id)} onChange={() => toggle(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={() => save(Array.from(chosen))} disabled={busy || chosen.size === 0}>
          Save limit ({chosen.size})
        </Button>
        <Button variant="outline" onClick={() => save(null)} disabled={busy}>
          All subjects
        </Button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// Exams: which are switched on, where their questions come from, and the one-time fee for STC's own bank.
// ---------------------------------------------------------------------------------------------------------------------------
function ExamsTab({ notify }: { notify: Notify }) {
  const [catalog, setCatalog] = useState<MockCatalog | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<MockExamSubjects | null>(null);
  const [pay, setPay] = useState<{ examId: number; link: string; txRef: string } | null>(null);

  const load = useCallback(async () => {
    const [res, error] = await GetMockCatalogAdminAction();
    if (error) notify(error);
    setCatalog(res?.data ?? null);
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (examId: number, isActive: boolean, source: string) => {
    setBusy(true);
    const [, error] = await SetMockExamAccessAction(examId, { is_active: isActive, question_source: source });
    if (error) notify(error);
    await load();
    setBusy(false);
  };

  const unlock = async (examId: number) => {
    setBusy(true);
    const [res, error] = await UnlockMockExamAction(examId);
    if (error || !res?.data) notify(error ?? "Could not start the payment");
    else setPay({ examId, link: res.data.payment_link, txRef: res.data.tx_ref });
    setBusy(false);
  };

  const checkPay = async () => {
    if (!pay) return;
    const [res, error] = await GetMockUnlockStatusAction(pay.txRef);
    if (error) return notify(error);
    if (res?.data?.status === "paid") {
      notify("Payment confirmed - you can switch this exam on now", true);
      setPay(null);
      await load();
    } else notify(`Payment status: ${res?.data?.status ?? "pending"}`);
  };

  const toggleSubjects = async (examId: number) => {
    if (open === examId) return setOpen(null);
    setOpen(examId);
    setSubjects(null);
    const [res, error] = await GetMockExamSubjectsAction(examId);
    if (error) notify(error);
    setSubjects(res?.data ?? null);
  };

  if (!catalog) return <p className="text-sm text-gray-500">Loading exams... (needs the live STC Exams key and the Mock-exam catalog feature)</p>;

  return (
    <div className="space-y-3">
      {pay && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2 text-sm">
          <p>Pay the one-time fee on STC Exams, then press &quot;I&apos;ve paid&quot;.</p>
          <div className="flex gap-2">
            <a href={pay.link} target="_blank" rel="noopener noreferrer">
              <Button size="sm">Pay now</Button>
            </a>
            <Button size="sm" variant="outline" onClick={checkPay}>
              I&apos;ve paid
            </Button>
          </div>
        </section>
      )}
      {catalog.exams.map((e) => (
        <section key={e.id} className={box}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{e.name}</p>
              <p className="text-xs text-gray-500">
                {e.country_name ?? ""} · {e.access_enabled ? (e.ready ? "On and ready" : "On, but not ready (bank fee unpaid)") : "Off"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                value={e.question_source}
                disabled={busy}
                onChange={(ev) => save(e.id, e.access_enabled, ev.target.value)}
                aria-label={`Question source for ${e.name}`}
              >
                {SOURCES.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button size="sm" variant={e.access_enabled ? "outline" : "default"} disabled={busy} onClick={() => save(e.id, !e.access_enabled, e.question_source)}>
                {e.access_enabled ? "Switch off" : "Switch on"}
              </Button>
              {!e.stc_bank_unlocked && e.question_source !== "own" && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => unlock(e.id)}>
                  Unlock STC bank · {formatMoney(e.stc_bank_price, catalog.currency)}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => toggleSubjects(e.id)}>
                {open === e.id ? "Hide topics" : "Subjects & topics"}
              </Button>
            </div>
          </div>
          {open === e.id &&
            (subjects ? (
              <ul className="text-sm divide-y">
                {subjects.subjects.map((s) => (
                  <li key={s.id} className="py-2">
                    <p className="font-medium">
                      {s.name} <span className="text-xs text-gray-500">· {s.available ?? 0} questions available</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.topics.map((t) => `${t.name} (${t.available ?? 0})`).join(" · ") || "No topics"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            ))}
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// The school's own question bank: filed under STC's exams, subjects and topics.
// ---------------------------------------------------------------------------------------------------------------------------
function parseLines(text: string) {
  const questions: { question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string }[] = [];
  const bad: number[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const p = line.split("|").map((x) => x.trim());
    const letter = (p[5] ?? "").toUpperCase();
    if (p.length !== 6 || p.slice(0, 5).some((x) => !x) || !["A", "B", "C", "D"].includes(letter)) bad.push(i + 1);
    else questions.push({ question_text: p[0], option_a: p[1], option_b: p[2], option_c: p[3], option_d: p[4], correct_option: letter });
  });
  return { questions, bad };
}

function BankTab({ notify }: { notify: Notify }) {
  const [catalog, setCatalog] = useState<MockCatalog | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [data, setData] = useState<MockExamSubjects | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<MockOwnQuestion[]>([]);
  const [lines, setLines] = useState("");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [res, error] = await GetMockCatalogAdminAction();
      if (error) notify(error);
      setCatalog(res?.data ?? null);
    })();
  }, [notify]);

  const pickExam = async (id: number) => {
    setExamId(id);
    setTopicId(null);
    setQuestions([]);
    const [res, error] = await GetMockExamSubjectsAction(id);
    if (error) notify(error);
    setData(res?.data ?? null);
  };

  const loadQuestions = useCallback(
    async (id: number) => {
      const [res, error] = await ListMockQuestionsAction(id);
      if (error) notify(error);
      setQuestions(res?.data ?? []);
    },
    [notify]
  );

  const pickTopic = async (id: number) => {
    setTopicId(id);
    await loadQuestions(id);
  };

  const addLines = async () => {
    if (!topicId) return;
    const { questions: parsed, bad } = parseLines(lines);
    if (bad.length) return notify(`Check line(s) ${bad.join(", ")} - each needs question | A | B | C | D | correct letter`);
    if (!parsed.length) return notify("Paste at least one question");
    setBusy(true);
    const [res, error] = await AddMockQuestionsAction(topicId, parsed);
    if (error) notify(error);
    else {
      notify(`${res?.data?.created_count ?? parsed.length} question(s) added`, true);
      setLines("");
      await loadQuestions(topicId);
    }
    setBusy(false);
  };

  const importCsv = async (dryRun: boolean) => {
    if (!csv.trim()) return notify("Paste or load a CSV first");
    setBusy(true);
    const [res, error] = await ImportMockQuestionsAction(csv, { topicId: topicId ?? undefined, examId: examId ?? undefined, dryRun });
    if (error) notify(error);
    else {
      const errs = res?.data?.errors ?? [];
      if (errs.length) notify(`${errs.length} problem(s): ${errs.slice(0, 3).map((x) => `line ${x.line}: ${x.message}`).join("; ")}`);
      else notify(dryRun ? `File is clean (${res?.data?.valid ?? "all"} rows) - nothing saved yet` : `${res?.data?.created ?? 0} question(s) imported`, true);
      if (!dryRun && topicId) await loadQuestions(topicId);
    }
    setBusy(false);
  };

  const remove = async (id: number) => {
    setBusy(true);
    const [, error] = await DeleteMockQuestionAction(id);
    if (error) notify(error);
    else if (topicId) await loadQuestions(topicId);
    setBusy(false);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setCsv(await file.text());
  };

  const exams = (catalog?.exams ?? []).filter((e) => e.access_enabled && e.question_source !== "stc");

  return (
    <div className="space-y-4">
      <section className={box}>
        <h2 className="font-semibold">Where do the questions go?</h2>
        <p className="text-xs text-gray-500">
          Your own questions are used by exams set to &quot;Our own questions&quot; or &quot;Both combined&quot; (change that on the Exams tab). They are live
          straight away and only your students see them.
        </p>
        <select className={field} value={examId ?? ""} onChange={(e) => e.target.value && pickExam(Number(e.target.value))}>
          <option value="">Choose an exam...</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        {data && (
          <select className={field} value={topicId ?? ""} onChange={(e) => e.target.value && pickTopic(Number(e.target.value))}>
            <option value="">Choose a topic...</option>
            {data.subjects.map((s) => (
              <optgroup key={s.id} label={s.name}>
                {s.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
        {catalog && exams.length === 0 && <p className="text-xs text-amber-700">No exam is set to use your own questions yet. Switch one to &quot;Our own&quot; or &quot;Both&quot; on the Exams tab first.</p>}
      </section>

      {topicId && (
        <>
          <section className={box}>
            <h2 className="font-semibold">Your questions in this topic ({questions.length})</h2>
            {questions.length === 0 ? (
              <p className="text-sm text-gray-500">None yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {questions.map((q) => (
                  <li key={q.id} className="py-2 flex items-start justify-between gap-3">
                    <div>
                      <p>{q.question_text}</p>
                      <p className="text-xs text-gray-500">
                        {(q.options ?? []).join(" · ")} - answer: {q.correct_answer}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => remove(q.id)} disabled={busy}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={box}>
            <h2 className="font-semibold">Add questions</h2>
            <textarea
              className={`${field} font-mono`}
              rows={4}
              placeholder="What is 12 x 8? | 84 | 96 | 104 | 88 | B"
              value={lines}
              onChange={(e) => setLines(e.target.value)}
            />
            <p className="text-xs text-gray-500">One per line: question | option A | option B | option C | option D | correct letter</p>
            <Button onClick={addLines} disabled={busy || !lines.trim()}>
              Add questions
            </Button>
          </section>
        </>
      )}

      {examId && (
        <section className={box}>
          <h2 className="font-semibold">Import from a spreadsheet (CSV)</h2>
          <p className="text-xs text-gray-500">
            Columns: question_text, option_a-d, correct_option (A-D), difficulty, marks. Add a topic_id column, or choose a topic above to file them all under it.
            Nothing is saved unless the whole file is clean - use &quot;Check file&quot; first.
          </p>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
          <textarea className={`${field} font-mono`} rows={5} placeholder="...or paste CSV here" value={csv} onChange={(e) => setCsv(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => importCsv(true)} disabled={busy || !csv.trim()}>
              Check file
            </Button>
            <Button onClick={() => importCsv(false)} disabled={busy || !csv.trim()}>
              Import
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// Students and coins: balances, giving coins from the school pool, and topping the pool up.
// ---------------------------------------------------------------------------------------------------------------------------
function StudentsTab({ notify }: { notify: Notify }) {
  const [students, setStudents] = useState<MockStcStudent[]>([]);
  const [packages, setPackages] = useState<MockCoinPackages | null>(null);
  const [amount, setAmount] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState<{ link: string; txRef: string } | null>(null);

  const load = useCallback(async () => {
    const [sRes, sError] = await ListMockStcStudentsAction();
    if (sError) notify(sError);
    setStudents(sRes?.data ?? []);
    const [pRes] = await GetMockCoinPackagesAction();
    setPackages(pRes?.data ?? null);
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const give = async (key: string, name: string) => {
    const coins = amount[key] ?? 10;
    setBusy(true);
    const [, error] = await GiveMockCoinsAction(key, coins);
    if (error) notify(error);
    else notify(`Gave ${coins} coin(s) to ${name}`, true);
    await load();
    setBusy(false);
  };

  const buyPackage = async (id: number) => {
    setBusy(true);
    const [res, error] = await CheckoutMockCoinPackageAction(id);
    if (error || !res?.data) notify(error ?? "Could not start the payment");
    else setPay({ link: res.data.payment_link, txRef: res.data.tx_ref });
    setBusy(false);
  };

  const checkPay = async () => {
    if (!pay) return;
    const [res, error] = await GetMockCoinPurchaseStatusAction(pay.txRef);
    if (error) return notify(error);
    if (res?.data?.status === "paid") {
      notify("Payment confirmed - the coins are in your pool", true);
      setPay(null);
      await load();
    } else notify(`Payment status: ${res?.data?.status ?? "pending"}`);
  };

  return (
    <div className="space-y-4">
      <section className={box}>
        <h2 className="font-semibold">School coin pool{packages ? `: ${packages.coin_pool_balance} coin(s)` : ""}</h2>
        <p className="text-xs text-gray-500">Coins you give to students, or that families buy, come out of this pool. Top it up here.</p>
        {pay && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm space-y-2">
            <p>Pay for the package, then press &quot;I&apos;ve paid&quot;.</p>
            <div className="flex gap-2">
              <a href={pay.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Pay now</Button>
              </a>
              <Button size="sm" variant="outline" onClick={checkPay}>
                I&apos;ve paid
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {(packages?.packages ?? []).map((p) => (
            <Button key={p.id} variant="outline" size="sm" disabled={busy} onClick={() => buyPackage(p.id)}>
              {p.label} · {formatMoney(p.price, packages?.currency)}
            </Button>
          ))}
          {packages && packages.packages.length === 0 && <p className="text-sm text-gray-500">No coin packages are on offer.</p>}
        </div>
      </section>

      <section className={box}>
        <h2 className="font-semibold">Students on STC Exams ({students.length})</h2>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">No students yet - switch mock exams on for some under &quot;Who can practise&quot;.</p>
        ) : (
          <ul className="divide-y text-sm">
            {students.map((s) => (
              <li key={s.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.coin_balance} coin(s) · {s.coins_granted_total} given in total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    className="w-20 rounded-md border border-gray-300 px-2 py-1"
                    value={amount[s.external_id] ?? 10}
                    onChange={(e) => setAmount({ ...amount, [s.external_id]: Number(e.target.value) })}
                    aria-label={`Coins for ${s.name}`}
                  />
                  <Button size="sm" disabled={busy} onClick={() => give(s.external_id, s.name)}>
                    Give coins
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// Results: finished practice attempts.
// ---------------------------------------------------------------------------------------------------------------------------
function ResultsTab({ notify }: { notify: Notify }) {
  const [catalog, setCatalog] = useState<MockCatalog | null>(null);
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  const [examId, setExamId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [res, error] = await ListMockResultsAction({ examId: examId ? Number(examId) : undefined, status: status || undefined });
    if (error) notify(error);
    setAttempts(res?.data?.attempts ?? []);
    setLoading(false);
  }, [examId, status, notify]);

  useEffect(() => {
    (async () => {
      const [res] = await GetMockCatalogAdminAction();
      setCatalog(res?.data ?? null);
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={box}>
      <div className="flex flex-wrap gap-2">
        <select className="rounded-md border border-gray-300 px-2 py-1 text-sm" value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">All exams</option>
          {(catalog?.exams ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select className="rounded-md border border-gray-300 px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="submitted">Submitted</option>
          <option value="pending_review">Waiting to be marked</option>
        </select>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : attempts.length === 0 ? (
        <p className="text-sm text-gray-500">No finished attempts yet.</p>
      ) : (
        <ul className="divide-y text-sm">
          {attempts.map((a) => (
            <li key={a.attempt_id} className="py-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{a.student?.name ?? "Student"}</p>
                <p className="text-xs text-gray-500">
                  {[a.exam?.name, a.subject?.name, a.topic?.name].filter(Boolean).join(" › ") || "Mock exam"}
                  {a.submitted_at ? ` · ${new Date(a.submitted_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <span>
                {a.status === "pending_review"
                  ? "Waiting to be marked"
                  : a.score != null
                    ? `${a.score}/${a.total_marks}${a.percentage != null ? ` (${a.percentage}%)` : ""}`
                    : a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------
// What families pay for coins, and payments that could not be turned into coins yet.
// ---------------------------------------------------------------------------------------------------------------------------
function PricingTab({ notify, isSuper }: { notify: Notify; isSuper: boolean }) {
  const [pricing, setPricing] = useState<MockPricing>({ pricePerCoin: 0, currency: "NGN", minCoins: 1, maxCoins: 500 });
  const [purchases, setPurchases] = useState<MockPurchase[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [pRes] = await GetMockPricingAdmin();
    if (pRes?.data) setPricing(pRes.data);
    const [res] = await ListMockCoinPurchasesAction();
    setPurchases(res?.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    const [res, error] = await SaveMockPricingAction(pricing);
    if (error || !res?.data) notify(error ?? "Could not save the price");
    else notify(pricing.pricePerCoin > 0 ? "Coin price saved" : "Coin buying switched off", true);
    setBusy(false);
  };

  const retry = async (id: string) => {
    setBusy(true);
    const [, error] = await RetryMockCoinPurchaseAction(id);
    if (error) notify(error);
    else notify("Retried", true);
    await load();
    setBusy(false);
  };

  const waiting = purchases.filter((p) => p.status === "FAILED");

  return (
    <div className="space-y-4">
      {waiting.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
          <h2 className="font-semibold text-amber-900">Paid, coins not added yet ({waiting.length})</h2>
          <p className="text-xs text-amber-800">Usually the school pool ran out. Top it up (Students &amp; coins tab), then retry.</p>
          <ul className="divide-y text-sm">
            {waiting.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                <div>
                  <p>
                    {p.learnerName} · {p.coins} coin(s) · {formatMoney(p.amount, p.currency)}
                  </p>
                  {p.error && <p className="text-xs text-red-700">{p.error}</p>}
                </div>
                <Button size="sm" onClick={() => retry(p.id)} disabled={busy}>
                  Retry
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={box}>
        <h2 className="font-semibold">What families pay for coins</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <label className="space-y-1">
            <span className="font-medium">Price per coin</span>
            <input type="number" min={0} step="0.01" className={field} value={pricing.pricePerCoin} disabled={!isSuper} onChange={(e) => setPricing({ ...pricing, pricePerCoin: Number(e.target.value) })} />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Currency</span>
            <input className={field} value={pricing.currency} maxLength={3} disabled={!isSuper} onChange={(e) => setPricing({ ...pricing, currency: e.target.value.toUpperCase() })} />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Fewest per purchase</span>
            <input type="number" min={1} className={field} value={pricing.minCoins} disabled={!isSuper} onChange={(e) => setPricing({ ...pricing, minCoins: Number(e.target.value) })} />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Most per purchase</span>
            <input type="number" min={1} className={field} value={pricing.maxCoins} disabled={!isSuper} onChange={(e) => setPricing({ ...pricing, maxCoins: Number(e.target.value) })} />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {pricing.pricePerCoin > 0 ? "Families can buy coins when theirs run out." : "Price is 0, so families cannot buy coins."}{" "}
          {isSuper ? "Set it to 0 to switch buying off." : "Only a Super Admin can change the price."}
        </p>
        {isSuper && (
          <Button onClick={save} disabled={busy}>
            Save price
          </Button>
        )}
      </section>

      <section className={box}>
        <h2 className="font-semibold">Recent coin purchases</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-gray-500">No purchases yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {purchases.slice(0, 30).map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                <span>
                  {p.learnerName} · {p.coins} coin(s) · {formatMoney(p.amount, p.currency)}
                </span>
                <span className={p.status === "ALLOCATED" ? "text-green-700" : p.status === "FAILED" ? "text-red-700" : "text-gray-500"}>
                  {p.status === "ALLOCATED" ? "Added" : p.status === "FAILED" ? "Waiting" : "Processing"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
