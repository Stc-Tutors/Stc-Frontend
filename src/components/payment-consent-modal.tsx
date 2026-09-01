"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarX, Lock, MessageCircleWarning, ShieldCheck } from "lucide-react";

// Brief, plain-language callouts a parent should see once, right before
// paying - deliberately shorter/more scannable than the full Terms &
// Conditions/Privacy Policy links already in the Review step's checkboxes,
// which most people skim past. Wording mirrors what's actually implemented
// elsewhere (24h reschedule/cancel gate - see lib/schedule-gate.ts's
// isInsideRescheduleGate) rather than a generic legal boilerplate.
const CONSENT_POINTS = [
  {
    icon: CalendarX,
    title: "Class cancellations & rescheduling",
    body: "Reschedule or cancel at least 24 hours before a class to avoid it counting as missed. Requests inside that 24-hour window still go through, but need admin approval first.",
  },
  {
    icon: Lock,
    title: "Privacy",
    body: "Your child's information is used only to match a tutor and run their classes - it's never sold, and is only visible to their assigned tutor and our support staff.",
  },
  {
    icon: MessageCircleWarning,
    title: "Talking to tutors",
    body: "Keep all communication inside STC's messaging and classroom tools. Please don't exchange personal contact details to arrange lessons outside the platform.",
  },
  {
    icon: ShieldCheck,
    title: "Payment & refunds",
    body: "Payment confirms this enrollment and the schedule you selected. Refunds follow our cancellation policy - classes already delivered aren't refundable.",
  },
];

interface PaymentConsentModalProps {
  open: boolean;
  onAgree: () => void;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
}

export default function PaymentConsentModal({ open, onAgree, onOpenChange, isSubmitting }: PaymentConsentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        // A consent step shouldn't be dismissible by an accidental outside
        // tap/scroll or Escape while the parent is still reading it - only
        // the explicit "Go back"/"I Agree" buttons below should close this,
        // so a stray dismissal can't be mistaken for having agreed (or for
        // having cancelled) partway through submitting the enrollment.
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Before you pay</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {CONSENT_POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-600">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Go back
          </Button>
          <Button onClick={onAgree} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "I Agree - Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
