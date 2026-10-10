"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import ExamForm, { ExamFormValues } from "@/components/exams/ExamForm";
import {
  AddExamQuestionsAction,
  ApproveExamAction,
  GetExamStatusAction,
  RejectExamAction,
  AssignExamAction,
  DeleteExamAction,
  DeleteExamQuestionAction,
  GetExamAction,
  GetExamQuestionsAction,
  RefreshExamPaymentAction,
  SearchExamLearnersAction,
  SyncExamResultsAction,
  UnassignExamAction,
  UpdateExamAction,
} from "@/server/exam";
import {
  Exam,
  ExamApprovalStatus,
  ExamAudienceType,
  ExamLearnerHit,
  ExamQuestion,
  ExamRemoteStatus,
  ExamStatus,
  NewExamQuestion,
} from "@/types/exam";

const box = "rounded-xl border p-4 space-y-3";
const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

// "question | A | B | C | D | correct letter" - one per line. A pipe is used instead of a comma because question text is full of commas.
function parseBulk(text: string): { questions: NewExamQuestion[]; badLines: number[] } {
  const questions: NewExamQuestion[] = [];
  const badLines: number[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const parts = line.split("|").map((p) => p.trim());
    const letter = (parts[5] ?? "").toUpperCase();
    if (parts.length !== 6 || parts.slice(0, 5).some((p) => !p) || !["A", "B", "C", "D"].includes(letter)) {
      badLines.push(i + 1);
      return;
    }
    questions.push({
      question_text: parts[0],
      option_a: parts[1],
      option_b: parts[2],
      option_c: parts[3],
      option_d: parts[4],
      correct_option: letter as NewExamQuestion["correct_option"],
    });
  });
  return { questions, badLines };
}

export default function ExamDetail({ basePath }: { basePath: string }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [bulk, setBulk] = useState("");
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<ExamLearnerHit[]>([]);
  const [picked, setPicked] = useState<ExamLearnerHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [perms, setPerms] = useState<ExamStatus>({ configured: true, canApprove: false, isStaff: false });
  const [addon, setAddon] = useState(false);

  const load = useCallback(async () => {
    const [res, error] = await GetExamAction(id);
    if (error || !res?.data) {
      ToastError(error ?? "Exam not found");
      return;
    }
    setExam(res.data);
    if (res.data.remoteId != null) {
      const [qRes, qError] = await GetExamQuestionsAction(id);
      if (qError) ToastError(qError);
      setQuestions(qRes?.data ?? []);
    }
  }, [id]);

  useEffect(() => {
    load();
    (async () => {
      const [res] = await GetExamStatusAction();
      if (res?.data) setPerms(res.data);
    })();
  }, [load]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const [res] = await SearchExamLearnersAction(search);
      setHits(res?.data ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  if (!exam) return <div className="bg-white shadow rounded-2xl p-6 text-sm text-gray-500">Loading exam...</div>;

  const pending = exam.remoteStatus === ExamRemoteStatus.PENDING_PAYMENT;
  // Not on STC Exams (yet): awaiting approval, or approved but unpaid. Results/sync only make sense once it is.
  const notOnStc = exam.remoteStatus !== ExamRemoteStatus.READY;
  const awaiting = exam.approvalStatus === ExamApprovalStatus.PENDING;
  const anyProctoring = Object.values(exam.proctoring ?? {}).some(Boolean);

  const saveSettings = async (v: ExamFormValues) => {
    const [res, error] = await UpdateExamAction(id, {
      title: v.title,
      description: v.description,
      durationMinutes: v.durationMinutes,
      launchMode: v.launchMode,
      audienceType: v.audienceType,
      courseIds: v.audienceType === ExamAudienceType.COURSE ? v.courseIds : [],
      proctoring: v.proctoring,
    });
    if (error) return ToastError(error);
    if (res?.data) ToastSuccess("Settings saved");
    load();
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  const togglePublished = () =>
    run(async () => {
      const [, error] = await UpdateExamAction(id, { published: !exam.published });
      if (error) ToastError(error);
      else ToastSuccess(exam.published ? "Exam hidden from learners" : "Exam published");
      await load();
    });

  const approve = () =>
    run(async () => {
      const [res, error] = await ApproveExamAction(id, addon);
      if (error) return ToastError(error);
      ToastSuccess(res?.data?.published ? "Approved - learners can now see this exam" : "Approved - it goes live once payment clears");
      await load();
    });

  const reject = () =>
    run(async () => {
      const reason = window.prompt("Why is this exam not being approved? The author will see this.");
      if (!reason?.trim()) return;
      const [, error] = await RejectExamAction(id, reason.trim());
      if (error) return ToastError(error);
      ToastSuccess("Exam sent back to its author");
      await load();
    });

  const refreshPayment = () =>
    run(async () => {
      const [res, error] = await RefreshExamPaymentAction(id);
      if (error) ToastError(error);
      else if (res?.data?.remoteStatus === ExamRemoteStatus.READY) ToastSuccess("Payment confirmed - the exam is ready");
      else ToastError("Payment has not cleared yet");
      await load();
    });

  const addBulk = () =>
    run(async () => {
      const { questions: parsed, badLines } = parseBulk(bulk);
      if (badLines.length) return ToastError(`Check line(s) ${badLines.join(", ")} - each needs question | A | B | C | D | correct letter`);
      if (parsed.length === 0) return ToastError("Paste at least one question");
      const [res, error] = await AddExamQuestionsAction(id, parsed);
      if (error) return ToastError(error);
      ToastSuccess(`${res?.data?.created ?? parsed.length} question(s) added - they await STC approval before learners see them`);
      setBulk("");
      await load();
    });

  const deleteQuestion = (qid: number) =>
    run(async () => {
      const [, error] = await DeleteExamQuestionAction(id, qid);
      if (error) ToastError(error);
      await load();
    });

  const assign = () =>
    run(async () => {
      const [res, error] = await AssignExamAction(
        id,
        picked.map((p) => p.key)
      );
      if (error) return ToastError(error);
      ToastSuccess(`Assigned to ${res?.data?.assigned ?? 0} learner(s)`);
      setPicked([]);
      setSearch("");
      await load();
    });

  const unassign = (seatId: string) =>
    run(async () => {
      const [, error] = await UnassignExamAction(id, seatId);
      if (error) ToastError(error);
      await load();
    });

  const sync = () =>
    run(async () => {
      const [res, error] = await SyncExamResultsAction(id);
      if (error) ToastError(error);
      else ToastSuccess(`Synced - ${res?.data?.matched ?? 0} of ${res?.data?.total ?? 0} results matched`);
      await load();
    });

  const remove = () =>
    run(async () => {
      if (!window.confirm("Delete this exam here AND on STC Exams? This removes its questions and results and cannot be undone.")) return;
      const [, error] = await DeleteExamAction(id);
      if (error) return ToastError(error);
      ToastSuccess("Exam deleted");
      router.push(basePath);
    });

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <div>
        <Link href={basePath} className="text-sm text-blue-600 hover:underline">
          ← All exams
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="flex gap-2">
            {perms.isStaff && (
              <Button variant="outline" onClick={togglePublished} disabled={busy || notOnStc || awaiting}>
                {exam.published ? "Unpublish" : "Publish to learners"}
              </Button>
            )}
            <Button variant="outline" onClick={remove} disabled={busy}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 -mt-4">
        Created by {exam.createdByName}
        {exam.createdByRole ? ` (${exam.createdByRole.replace("_", " ").toLowerCase()})` : ""}
      </p>

      {exam.approvalStatus === ExamApprovalStatus.REJECTED && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          Not approved{exam.rejectionReason ? `: ${exam.rejectionReason}` : "."} Edit the exam and it will be sent for approval again.
        </div>
      )}

      {awaiting && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 space-y-2">
          {perms.canApprove ? (
            <>
              <p>
                This exam is waiting for your approval. Approving creates it on STC Exams
                {exam.remoteStatus === ExamRemoteStatus.NOT_CREATED ? ` (reserving ${exam.expectedParticipantCount} place(s))` : ""} and shows it to
                the learners assigned to it.
              </p>
              {anyProctoring && exam.remoteStatus === ExamRemoteStatus.NOT_CREATED && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={addon} onChange={(e) => setAddon(e.target.checked)} />I accept any extra per-person charge for
                  monitoring features not in our licence
                </label>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={approve} disabled={busy}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={reject} disabled={busy}>
                  Reject
                </Button>
              </div>
            </>
          ) : (
            <p>Waiting for an admin to approve this exam. Learners cannot see it until then.</p>
          )}
        </div>
      )}

      {pending && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 space-y-2">
          <p>
            STC Exams needs a payment before this test exists there. Pay, then press &quot;I&apos;ve paid&quot; to continue.
          </p>
          <div className="flex gap-2">
            {exam.paymentLink && (
              <a href={exam.paymentLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Pay now</Button>
              </a>
            )}
            <Button size="sm" variant="outline" onClick={refreshPayment} disabled={busy}>
              I&apos;ve paid
            </Button>
          </div>
        </div>
      )}

      <section className={box}>
        <h2 className="font-semibold">Settings</h2>
        <ExamForm
          initial={{
            title: exam.title,
            description: exam.description ?? "",
            expectedParticipantCount: exam.expectedParticipantCount,
            durationMinutes: exam.durationMinutes,
            launchMode: exam.launchMode,
            audienceType: exam.audienceType,
            courseIds: exam.courseIds,
            proctoring: exam.proctoring ?? {},
            acceptFeatureAddon: false,
          }}
          isNew={false}
          submitLabel="Save settings"
          onSubmit={saveSettings}
        />
      </section>

      {!pending && (
        <section className={box}>
          <h2 className="font-semibold">Questions ({questions.length})</h2>
          {exam.remoteId == null && (
            <p className="text-xs text-blue-700">Held here until the exam is approved; then they are sent to STC Exams automatically.</p>
          )}
          <p className="text-xs text-gray-500">
            Once on STC Exams, questions wait for an STC Exams admin to approve them before real learners see them.
          </p>
          {questions.length > 0 && (
            <ul className="divide-y text-sm">
              {questions.map((q) => (
                <li key={q.id} className="py-2 flex items-start justify-between gap-3">
                  <div>
                    <p>{q.question_text}</p>
                    <p className="text-xs text-gray-500">
                      {(q.options ?? []).join(" · ")} — answer: {q.correct_answer} {q.approval_status ? `· ${q.approval_status}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteQuestion(q.id)} disabled={busy}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <label className="text-sm font-medium">Add questions (one per line)</label>
          <textarea
            className={`${field} font-mono`}
            rows={5}
            placeholder="What is 12 x 8? | 84 | 96 | 104 | 88 | B"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <p className="text-xs text-gray-500">Format: question | option A | option B | option C | option D | correct letter</p>
          <Button onClick={addBulk} disabled={busy || !bulk.trim()}>
            Add questions
          </Button>
        </section>
      )}

      <section className={box}>
        <h2 className="font-semibold">
          {exam.audienceType === ExamAudienceType.COURSE ? "Extra learners (course members already see it)" : "Assign to learners"}
        </h2>
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
                <button type="button" onClick={() => setPicked(picked.filter((x) => x.key !== p.key))} aria-label={`Remove ${p.fullName}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <Button onClick={assign} disabled={busy || picked.length === 0}>
          Assign {picked.length || ""}
        </Button>
      </section>

      <section className={box}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Learners &amp; results ({exam.seats?.length ?? 0})</h2>
          <Button size="sm" variant="outline" onClick={sync} disabled={busy || notOnStc}>
            Sync results
          </Button>
        </div>
        {(exam.seats?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">Nobody yet.{exam.audienceType === ExamAudienceType.COURSE ? " Course members appear here once they open the exam." : ""}</p>
        ) : (
          <ul className="divide-y text-sm">
            {exam.seats!.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{s.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {s.status === "SUBMITTED"
                      ? s.score != null
                        ? `Scored ${s.score}/${s.totalMarks}${s.percentage != null ? ` (${s.percentage}%)` : ""}${s.lateSubmission ? " · late" : ""}`
                        : "Submitted - score pending marking"
                      : s.status === "IN_PROGRESS"
                        ? "In progress"
                        : "Not started"}
                  </p>
                </div>
                {s.status === "ASSIGNED" && (
                  <Button size="sm" variant="outline" onClick={() => unassign(s.id)} disabled={busy}>
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
