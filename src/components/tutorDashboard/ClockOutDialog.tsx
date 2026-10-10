"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClockOutLessonAction, GetClockOutFormFieldsAction, SubmitLateReportAction, type ClockOutField } from "@/server/lesson";

// The post-lesson report a tutor fills in. For a class still open it also clocks the tutor out; for a class that has already closed
// (`lateReport`) it just files the report so the session can be approved and paid. The backend requires the fields an admin has marked
// required and rejects the submission without them.
export default function ClockOutDialog({
  lessonId,
  onClose,
  onClockedOut,
  lateReport = false,
  title,
}: {
  lessonId: string | null;
  onClose: () => void;
  onClockedOut: () => void;
  lateReport?: boolean;
  title?: string;
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

  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lessonId || !fields) return;
    const missing = fields.find((field) => field.required && !values[field.key]?.trim());
    if (missing) {
      setError(`"${missing.label}" is required`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const report = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()] as const)
        .filter(([, value]) => value)
    );
    const [, submitError] = lateReport ? await SubmitLateReportAction(lessonId, report) : await ClockOutLessonAction(lessonId, report);
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
          <DialogTitle>{lateReport ? "Post-lesson report" : "Clock out - post-lesson report"}</DialogTitle>
          <DialogDescription>
            {title ? `${title}. ` : ""}This report goes to the family and the admins, and the session cannot be approved or paid until it is filed.
          </DialogDescription>
        </DialogHeader>

        {fields === null ? (
          <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading the report form&hellip;
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => {
              const id = `clockout-${field.key}`;
              const label = (
                <Label htmlFor={id}>
                  {field.label}
                  {field.required && <span className="text-red-600"> *</span>}
                </Label>
              );
              if (field.kind === "rating") {
                const max = field.max ?? 5;
                return (
                  <div key={field.key} className="space-y-1.5">
                    {label}
                    <div role="radiogroup" aria-label={field.label} className="flex gap-2">
                      {Array.from({ length: max }, (_, i) => String(i + 1)).map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={values[field.key] === n}
                          onClick={() => set(field.key, n)}
                          className={`h-10 w-10 rounded-full border text-sm font-semibold transition ${
                            values[field.key] === n ? "border-blue-600 bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Struggled significantly</span>
                      <span>Mastered the concept</span>
                    </div>
                  </div>
                );
              }
              if (field.kind === "choice" && field.options) {
                return (
                  <fieldset key={field.key} className="space-y-1.5">
                    <legend className="mb-1 text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-600"> *</span>}
                    </legend>
                    {field.options.map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                        <input
                          type="radio"
                          name={id}
                          checked={values[field.key] === option}
                          onChange={() => set(field.key, option)}
                          className="h-4 w-4"
                        />
                        {option}
                      </label>
                    ))}
                  </fieldset>
                );
              }
              return (
                <div key={field.key} className="space-y-1.5">
                  {label}
                  <Textarea
                    id={id}
                    rows={2}
                    value={values[field.key] ?? ""}
                    required={field.required}
                    aria-required={field.required}
                    onChange={(event) => set(field.key, event.target.value)}
                  />
                </div>
              );
            })}

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
                {lateReport ? "Submit report" : "Clock out"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
