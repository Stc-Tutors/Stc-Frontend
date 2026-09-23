"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import { CAREER_RESUME_UPLOAD_LIMITS } from "@/constants/upload-limits";
import { UploadedFile } from "@/lib/cloudinary-upload";
import { GetJobOpeningQuestionsAction, SubmitCareerApplicationAction } from "@/server/careers";
import { JobOpening, JobOpeningQuestion, JobOpeningQuestionFieldType } from "@/types/content";

type AnswerValue = string | string[];

// One opening's own extra question, rendered by fieldType - same small set
// CustomFormField's tutor/student flows already use (see stcbe's
// JobOpeningQuestionFieldType), kept here as its own small renderer since
// this form isn't part of that unrelated signup-flow system.
function QuestionField({
  question,
  value,
  onChange,
}: {
  question: JobOpeningQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  const label = `${question.label}${question.required ? " *" : ""}`;

  switch (question.fieldType) {
    case JobOpeningQuestionFieldType.TEXTAREA:
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      );
    case JobOpeningQuestionFieldType.DROPDOWN:
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <select
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md bg-white"
          >
            <option value="" disabled>
              Select...
            </option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    case JobOpeningQuestionFieldType.CHECKBOX: {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (option: string) =>
        onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <div className="space-y-1">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
                {option}
              </label>
            ))}
          </div>
        </div>
      );
    }
    case JobOpeningQuestionFieldType.DATE:
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      );
    case JobOpeningQuestionFieldType.NUMBER:
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      );
    default:
      return (
        <div>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      );
  }
}

function isBlank(value: AnswerValue | undefined): boolean {
  return value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

// The generic apply form for any non-tutor JobOpening - see CareersPage's
// isTutorRole branch for why the tutor listing skips this entirely. Fixed
// fields (name/email/phone/resume/cover letter) apply to every opening;
// `questions` are that opening's own extra fields, configured by a Super
// Admin under Site Content > Job Openings.
export default function CareerApplicationForm({ opening, onClose }: { opening: JobOpening; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<UploadedFile | undefined>();
  const [questions, setQuestions] = useState<JobOpeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    GetJobOpeningQuestionsAction(opening.id).then(([res]) => setQuestions(res?.data ?? []));
  }, [opening.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !resume) {
      setError("Name, email and a resume are required");
      return;
    }
    const missing = questions.filter((q) => q.required && isBlank(answers[q.id]));
    if (missing.length > 0) {
      setError(`Please answer: ${missing.map((q) => q.label).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const [, err] = await SubmitCareerApplicationAction({
      jobOpeningId: opening.id,
      fullName,
      email,
      phone: phone || undefined,
      resumeUrl: resume.url,
      coverLetter: coverLetter || undefined,
      customFieldResponses: questions.length > 0 ? answers : undefined,
    });
    setIsSubmitting(false);

    if (err) {
      setError(err);
      return;
    }
    setSubmitted(true);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {opening.title}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-green-600 font-medium">Application sent!</p>
            <p className="text-sm text-gray-500">We&apos;ve received it and will reach out if you&apos;re shortlisted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Resume/CV</label>
              <FileUploadField
                id="career-resume"
                folder="careers/resumes"
                value={resume}
                onChange={setResume}
                limits={CAREER_RESUME_UPLOAD_LIMITS}
              />
            </div>
            <div>
              <textarea
                placeholder="Cover letter (optional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
              />
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#38b6ff] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit application"}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
