"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportContentAction } from "@/server/moderation";
import { ReportedEntityType } from "@/types/moderation";

// The one place any role reports a message/course/session-feedback item for
// staff review - see stcbe's ModerationService, whose queue (Stc-SuperAdmin's
// Approvals > Content Reports) previously had no way to actually receive
// data, since nothing in either frontend ever called POST /moderation/reports.
export function ReportDialog({
  entityType,
  entityId,
  label = "Report",
  className,
}: {
  entityType: ReportedEntityType;
  entityId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Describe what's wrong before submitting");
      return;
    }
    setIsSubmitting(true);
    const [, error] = await ReportContentAction(entityType, entityId, reason.trim());
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Reported - our team will review this");
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setReason(""); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={className ?? "inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600"}
        >
          <Flag className="w-3 h-3" /> {label}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this content</DialogTitle>
          <DialogDescription>Tell us what&apos;s wrong - a staff member will review it.</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="What's the issue?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
