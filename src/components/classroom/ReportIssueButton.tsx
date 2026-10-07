"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { FileComplaintAction } from "@/server/complaint";
import { ComplaintCategory } from "@/types/complaint";

const CATEGORY_OPTIONS: { value: ComplaintCategory; label: string }[] = [
  { value: ComplaintCategory.TECHNICAL, label: "Technical problem (audio, video, connection)" },
  { value: ComplaintCategory.SESSION_QUALITY, label: "Session quality" },
  { value: ComplaintCategory.TUTOR_CONDUCT, label: "Tutor conduct" },
  { value: ComplaintCategory.STUDENT_CONDUCT, label: "Student conduct" },
  { value: ComplaintCategory.OTHER, label: "Something else" },
];

interface ReportIssueButtonProps {
  lessonId: string;
  lessonTitle: string;
}

// Reports a problem during the live class straight into the platform's
// existing complaints/moderation system - not a separate "in-class feedback"
// channel, so an admin reviewing complaints sees this exactly like any other
// complaint, just already tagged to this lesson.
export default function ReportIssueButton({ lessonId, lessonTitle }: ReportIssueButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>(ComplaintCategory.TECHNICAL);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (description.trim().length < 5) {
      ToastError("Please describe the issue in a bit more detail");
      return;
    }
    setSubmitting(true);
    const [, err] = await FileComplaintAction({
      category,
      subject: `Issue during class: ${lessonTitle}`,
      description: description.trim(),
      relatedEntityType: "Lesson",
      relatedEntityId: lessonId,
    });
    setSubmitting(false);
    if (err) {
      ToastError(err);
      return;
    }
    ToastSuccess("Thanks - an admin will follow up.");
    setDescription("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Report an issue with this class"
        className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        <Flag className="h-3.5 w-3.5" />
        Report issue
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">What kind of issue?</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">What happened?</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Describe what you're experiencing..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Sending..." : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
