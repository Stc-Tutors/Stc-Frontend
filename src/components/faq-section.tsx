"use client";

import { usePageSection } from "@/hooks/use-page-section";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { FaqContent, FaqItem, PageSectionKey } from "@/types/content";

const DEFAULT_FAQ: FaqContent = { heading: "Frequently asked questions", intro: "", items: [] };

// The rich-text answers are HTML; search engines want the plain words.
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// "Frequently asked questions" accordion. Renders nothing at all until there is at least one question, so a page never shows an empty box.
export function FaqBlock({ heading, intro, items, className }: { heading: string; intro?: string; items: FaqItem[]; className?: string }) {
  const shown = items.filter((i) => i.question?.trim() && i.answer?.trim());
  if (shown.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: shown.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: plain(i.answer) } })),
  };

  return (
    <section className={className ?? "py-16 px-6 md:px-12 lg:px-20"}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900">{heading}</h2>
        {intro && <p className="mt-2 text-center text-gray-600">{intro}</p>}
        <div className="mt-8 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {shown.map((item, i) => (
            <details key={i} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
                {item.question}
                <span aria-hidden className="text-[#0a7ac2] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <div className="mt-3 text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.answer) }} />
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}

// The page-level FAQ blocks edited in Site Content > Page Sections (FAQ: Homepage / Services / Contact / Careers).
export default function PageFaq({ sectionKey, className }: { sectionKey: PageSectionKey; className?: string }) {
  const content = usePageSection(sectionKey, DEFAULT_FAQ);
  return <FaqBlock heading={content.heading} intro={content.intro} items={content.items ?? []} className={className} />;
}
