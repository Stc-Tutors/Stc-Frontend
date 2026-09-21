import Link from "next/link";
import type { LegalSection } from "@/constants/legal-content";

// A long-form legal page: title, "last updated", a contents list that jumps to each section, then the sections.
export default function LegalDocument({
  title,
  intro,
  lastUpdated,
  sections,
  otherDocument,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  otherDocument: { href: string; label: string };
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated {lastUpdated}</p>
        <p className="mt-4 text-base leading-relaxed text-gray-700">{intro}</p>
      </header>

      <nav aria-label={`${title} contents`} className="mt-8 rounded-lg bg-gray-50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Contents</h2>
        <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-blue-700 hover:underline focus-visible:underline">
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24">
            <h2 id={`${section.id}-heading`} className="text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-4 text-base leading-relaxed text-gray-700">
              {section.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {section.items && (
                <ul className="list-disc space-y-2 pl-6 marker:text-gray-400">
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
              {section.closing?.map((paragraph, index) => (
                <p key={`closing-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
        See also our{" "}
        <Link href={otherDocument.href} className="text-blue-700 hover:underline">
          {otherDocument.label}
        </Link>
        .
      </p>
    </article>
  );
}
