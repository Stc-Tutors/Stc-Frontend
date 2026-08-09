"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { AcceptTermsAction } from "@/server/auth";
import { GetSiteContentAction } from "@/server/site-content";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { Loader2 } from "lucide-react";

const TERMS_CONTENT_KEY = "terms-and-conditions";
// Small epsilon so the button unlocks even if rounding/subpixel scroll never
// quite reaches an exact 0 gap at the bottom of the content.
const SCROLL_EPSILON_PX = 8;

// Mandatory, full-screen, un-dismissable T&C gate - shown to every role the
// very first time they log in (or whenever the terms content in the CMS
// changes after they last agreed). Built as a hand-rolled fixed-position
// overlay rather than the Radix Dialog primitive, since Radix closes on
// overlay-click/Escape by default and this must not be dismissible until
// the user has scrolled to the bottom and agreed.
export default function TermsGateModal() {
  const { user, updateUser } = useUser();
  const [content, setContent] = useState<string | null>(null);
  const [canAgree, setCanAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const shouldShow = !!user && user.termsAccepted === false;

  useEffect(() => {
    if (!shouldShow) return;
    (async () => {
      const [res] = await GetSiteContentAction();
      const terms = res?.data?.find((c) => c.key === TERMS_CONTENT_KEY);
      setContent(terms?.value ?? "Our Terms & Conditions are being updated. Please check back shortly.");
    })();
  }, [shouldShow]);

  if (!shouldShow) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EPSILON_PX) {
      setCanAgree(true);
    }
  };

  const handleAgree = async () => {
    setIsSubmitting(true);
    const [res, error] = await AcceptTermsAction();
    setIsSubmitting(false);
    if (res) {
      ToastSuccess("Thanks - you're all set.");
      updateUser({ termsAccepted: true });
    }
    if (error) {
      ToastError(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please read to the end and agree before continuing to your dashboard.
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed"
        >
          {content === null ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            content
          )}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            {canAgree ? "You've reached the end." : "Scroll to the bottom to continue."}
          </p>
          <button
            type="button"
            onClick={handleAgree}
            disabled={!canAgree || isSubmitting}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
