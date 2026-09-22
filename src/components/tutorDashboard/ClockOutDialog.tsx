"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClockOutLessonAction, GetClockOutFormFieldsAction, type ClockOutField } from "@/server/lesson";

// The end-of-session report a tutor fills in to clock out. The backend requires the fields an admin has marked
// required (by default: topics covered, homework, student engagement, next-session focus) and rejects a clock-out
// without them - but the page used to send none, so every clock-out failed with "Topics Covered is required".
export default function ClockOutDialog({
  lessonId,
  onClose,
  onClockedOut,
}: {
  lessonId: string | null;
  onClose: () => void;
  onClockedOut: () => void;
}) {
  const [fields, setFields] = useState<ClockOutField[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    setFields(null);
    setValues({});
    setError(null);
    (async () => {
      const [res, loadError] = await GetClockOutFormFieldsAction();
      if (loadError) setError(loadError);
      setFields((res?.data ?? []).filter((field) => field.isActive));
    })();
  }, [lessonId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lessonId || !fields) return;
    const missing = fields.find((field) => field.required && !values[field.key]?.trim());
    if (missing) {
      setError(`"${missing.label}" is required to clock out`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const report = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()] as const)
        .filter(([, value]) => value)
    );
    const [, submitError] = await ClockOutLessonAction(lessonId, report);
    setIsSubmitting(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    onClockedOut();
  };

  return (
    <Dialog open={!!lessonId} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Clock out - session report</DialogTitle>
          <DialogDescription>A short report on this session. It is reviewed before the session is counted.</DialogDescription>
        </DialogHeader>

        {fields === null ? (
          <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading the report form&hellip;
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`clockout-${field.key}`}>
                  {field.label}
                  {field.required && <span className="text-red-600"> *</span>}
                </Label>
                <Textarea
                  id={`clockout-${field.key}`}
                  rows={2}
                  value={values[field.key] ?? ""}
                  required={field.required}
                  aria-required={field.required}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                />
              </div>
            ))}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || fields.length === 0}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Clock out
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
