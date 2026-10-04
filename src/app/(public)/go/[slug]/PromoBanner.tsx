"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { APPLY_COUPON_EVENT, formatPromoDeadline, promoExpired } from "@/lib/campaign-promo";


export default function PromoBanner({ label, deadline, code }: { label?: string; deadline?: string; code?: string }) {
  const [copied, setCopied] = useState(false);

  // Checked here as well as on the server: the page may have been served from a cache.
  if (promoExpired(deadline)) return null;

  const handleCopy = async () => {
    if (!code) return;
    window.dispatchEvent(new CustomEvent(APPLY_COUPON_EVENT, { detail: code }));
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be blocked (in-app browsers); the code is still applied to the form.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-amber-900">
        <p>
          <span aria-hidden="true">🎁 </span>
          {label && <span className="font-semibold">{label}</span>}
          {label && deadline && <span> — </span>}
          {deadline && <span>register before {formatPromoDeadline(deadline)}.</span>}
        </p>
        {code && (
          <div className="flex items-center gap-2">
            <span>Use code:</span>
            <button type="button" onClick={handleCopy} aria-label={`Copy coupon code ${code}`} className="inline-flex items-center rounded-full border border-amber-400 bg-white px-3 py-1 font-mono text-xs font-bold tracking-wide text-amber-800">
              {code}
            </button>
            <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white active:bg-amber-700">
              {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              {copied ? "Copied & applied" : "Tap to copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
