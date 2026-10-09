"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { GetActivePromotionsAction } from "@/server/promotion";
import { Promotion } from "@/types/promotion";

const SEEN_KEY = "stc-promos-seen";

const readSeen = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeSeen = (ids: string[]) => {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore - worst case the popup shows again on the next page load */
  }
};

// Marketing popup on the parent / student dashboards: shows the newest live promotion the person hasn't closed in this browser session.
export default function PromoPopup() {
  const [promo, setPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res] = await GetActivePromotionsAction();
      if (cancelled) return;
      const seen = readSeen();
      const next = (res?.data ?? []).find((p) => !seen.includes(p.id));
      if (!next) return;
      // A brand-new user is busy with the first-login walkthrough / terms prompt - hold the promo until those are out of the way.
      const blocked = () => !!document.querySelector('[aria-label="Product walkthrough"], [data-terms-gate]');
      if (!blocked()) return setPromo(next);
      const timer = setInterval(() => {
        if (cancelled) return clearInterval(timer);
        if (!blocked()) {
          clearInterval(timer);
          setPromo(next);
        }
      }, 1500);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (promo) writeSeen([...readSeen(), promo.id]);
    setPromo(null);
  };

  useEffect(() => {
    if (!promo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      writeSeen([...readSeen(), promo.id]);
      setPromo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [promo]);

  if (!promo) return null;
  const external = promo.link && /^https?:\/\//.test(promo.link);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={promo.title}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-gray-700 shadow hover:bg-white"
        >
          <X className="size-5" />
        </button>
        {promo.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={promo.imageUrl} alt="" className="h-44 w-full object-cover" />
        )}
        <div className="space-y-3 p-6">
          <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Special offer</span>
          <h2 className="text-xl font-bold text-gray-900">{promo.title}</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{promo.body}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {promo.link &&
              (external ? (
                <a
                  href={promo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="rounded-lg bg-[#38b6ff] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {promo.ctaLabel || "Learn more"}
                </a>
              ) : (
                <Link
                  href={promo.link}
                  onClick={close}
                  className="rounded-lg bg-[#38b6ff] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {promo.ctaLabel || "Learn more"}
                </Link>
              ))}
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
