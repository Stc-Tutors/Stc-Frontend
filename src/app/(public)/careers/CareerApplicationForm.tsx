"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import { CAREER_RESUME_UPLOAD_LIMITS } from "@/constants/upload-limits";
import { UploadedFile } from "@/lib/cloudinary-upload";
import { SubmitCareerApplicationAction } from "@/server/careers";
import { JobOpening } from "@/types/content";

// The generic apply form for any non-tutor JobOpening - see CareersPage's
// isTutorRole branch for why the tutor listing skips this entirely.
export default function CareerApplicationForm({ opening, onClose }: { opening: JobOpening; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<UploadedFile | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !resume) {
      setError("Name, email and a resume are required");
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
      <DialogContent className="max-w-lg">
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
