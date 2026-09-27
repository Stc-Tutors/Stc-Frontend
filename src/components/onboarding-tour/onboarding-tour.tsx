"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { UpdateUserAction } from "@/server/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTourSteps } from "./tour-steps";

// How far the blur/spotlight sits from the highlighted element's real edges.
const SPOTLIGHT_PADDING = 8;
const CARD_WIDTH = 340;
const CARD_GAP = 16;
// A step's target element sometimes isn't in the DOM yet on the very first
// paint (e.g. right after login, before the sidebar's client hooks settle) -
// poll briefly before giving up and treating the step as not applicable to
// this user (a permission-gated link, a trimmed child-login sidebar, ...).
const FIND_RETRY_MS = 200;
const FIND_MAX_ATTEMPTS = 8;

// Only ever triggered from the exact route the post-login redirect lands on
// (see ROLE_DASHBOARD in login-form.tsx) - never on the bare full-screen
// wizards (tutor onboarding/vetting, student new-enrollment) that have no
// sidebar at all for a step's target to point at.
const DASHBOARD_ROUTE = /^\/lms-home\/(student|tutor|parent|admin)\/dashboard(\/|$)/;

// First-login product walkthrough: blurs everything except one sidebar/topbar
// element at a time and narrates what it's for. Shown once per account (see
// hasCompletedTour on the User model) - Skip and finishing the last step both
// mark it done the same way, since neither should show it again.
export default function OnboardingTour() {
  const pathname = usePathname();
  const { user, updateUser } = useUser();
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => setMounted(true), []);

  const steps = getTourSteps(user?.role);
  const eligible = !!user && user.termsAccepted !== false && user.hasCompletedTour === false && steps.length > 0;

  useEffect(() => {
    if (!started && eligible && DASHBOARD_ROUTE.test(pathname ?? "")) setStarted(true);
  }, [started, eligible, pathname]);

  const visible = mounted && started && eligible;
  const step = visible ? steps[stepIndex] : null;

  // Locate (and keep tracking) the current step's target element.
  useEffect(() => {
    if (!visible || !step) return;
    if (!step.target) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const recompute = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };

    const tryFind = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => {
          if (!cancelled) setRect(el.getBoundingClientRect());
        }, 300);
        return;
      }
      attempts += 1;
      if (attempts >= FIND_MAX_ATTEMPTS) {
        // Not on this user's sidebar (permission-gated, or hidden for a
        // child login) - skip straight past it rather than stall the tour.
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        return;
      }
      window.setTimeout(tryFind, FIND_RETRY_MS);
    };

    tryFind();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, stepIndex, step?.target]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const persistCompletion = () => {
    // Optimistic: closes the tour immediately regardless of network state -
    // this is a one-time nicety, not something worth blocking on or retrying.
    updateUser({ hasCompletedTour: true });
    UpdateUserAction({ hasCompletedTour: true }).catch(() => {});
  };

  const goNext = () => (isLast ? persistCompletion() : setStepIndex((i) => i + 1));
  const goBack = () => !isFirst && setStepIndex((i) => i - 1);
  const skip = () => persistCompletion();

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      else if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      else if (e.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, stepIndex]);

  if (!visible || !step) return null;

  const pos = computeCardPosition(rect, step.placement);

  // No portal here (unlike a Radix Dialog) - this is rendered once at the
  // root layout's body level already, same as TermsGateModal, so plain
  // `position: fixed` is enough to sit above everything without needing
  // react-dom's createPortal.
  return (
    <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="Product walkthrough">
      {rect ? (
        <>
          <div
            className="fixed left-0 right-0 top-0 backdrop-blur-sm bg-black/60 transition-all duration-300"
            style={{ height: Math.max(0, rect.top - SPOTLIGHT_PADDING) }}
          />
          <div
            className="fixed left-0 right-0 bottom-0 backdrop-blur-sm bg-black/60 transition-all duration-300"
            style={{ top: rect.bottom + SPOTLIGHT_PADDING }}
          />
          <div
            className="fixed left-0 top-0 backdrop-blur-sm bg-black/60 transition-all duration-300"
            style={{ top: rect.top - SPOTLIGHT_PADDING, height: rect.height + SPOTLIGHT_PADDING * 2, width: Math.max(0, rect.left - SPOTLIGHT_PADDING) }}
          />
          <div
            className="fixed right-0 top-0 backdrop-blur-sm bg-black/60 transition-all duration-300"
            style={{ top: rect.top - SPOTLIGHT_PADDING, height: rect.height + SPOTLIGHT_PADDING * 2, left: rect.right + SPOTLIGHT_PADDING }}
          />
          {/* Sits over the spotlighted element itself: keeps it crisp (no blur
              layer over it) while blocking a click from navigating away and
              unmounting the tour mid-walkthrough. */}
          <div
            className="fixed pointer-events-auto cursor-default rounded-lg ring-4 ring-[#38b6ff] shadow-[0_0_0_4px_rgba(56,182,255,0.25)] transition-all duration-300"
            style={{
              top: rect.top - SPOTLIGHT_PADDING,
              left: rect.left - SPOTLIGHT_PADDING,
              width: rect.width + SPOTLIGHT_PADDING * 2,
              height: rect.height + SPOTLIGHT_PADDING * 2,
            }}
            onClick={(e) => e.preventDefault()}
          />
        </>
      ) : (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 transition-all duration-300" />
      )}

      <Card className="fixed shadow-2xl py-5 gap-3" style={{ width: CARD_WIDTH, top: pos.top, left: pos.left }}>
        <CardHeader className="px-5">
          <CardTitle className="text-base">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <p className="text-sm text-gray-600 leading-relaxed">{step.content}</p>
          <Progress value={((stepIndex + 1) / steps.length) * 100} className="mt-4 h-1.5" />
          <p className="mt-1.5 text-xs text-gray-400">
            Step {stepIndex + 1} of {steps.length}
          </p>
        </CardContent>
        <CardFooter className="px-5 justify-between">
          <Button variant="ghost" size="sm" onClick={skip}>
            Skip
          </Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={goBack}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={goNext}>
              {isLast ? "Done" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function computeCardPosition(rect: DOMRect | null, placement: "top" | "bottom" | "left" | "right" | undefined) {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const estimatedHeight = 220;

  if (!rect) {
    return {
      top: Math.max(16, viewportH / 2 - estimatedHeight / 2),
      left: Math.max(16, viewportW / 2 - CARD_WIDTH / 2),
    };
  }

  const resolvedPlacement = placement ?? (rect.left > viewportW / 2 ? "left" : "right");
  let top = 0;
  let left = 0;

  switch (resolvedPlacement) {
    case "left":
      left = rect.left - CARD_WIDTH - CARD_GAP;
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      break;
    case "bottom":
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
      top = rect.bottom + CARD_GAP;
      break;
    case "top":
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
      top = rect.top - estimatedHeight - CARD_GAP;
      break;
    case "right":
    default:
      left = rect.right + CARD_GAP;
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      break;
  }

  left = Math.max(16, Math.min(left, viewportW - CARD_WIDTH - 16));
  top = Math.max(16, Math.min(top, viewportH - estimatedHeight - 16));
  return { top, left };
}
