import { notFound } from "next/navigation";
import Image from "next/image";
import { GetCampaignLandingPageAction } from "@/server/campaign-landing-page";
import { GetClassGroupsAction } from "@/server/class-group";
import { sanitizeRichText } from "@/lib/sanitize-html";
import CampaignSignupForm from "./CampaignSignupForm";

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function CampaignLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [res] = await GetCampaignLandingPageAction(slug);
  const page = res?.data;
  if (!page) notFound();

  // The cohort's own name (e.g. "Tech for Kids November 2026 Cohort") -
  // distinct from `page.title`, which is an internal admin label for the
  // Landing Pages list, not marketing copy. Falls back to `page.title` for a
  // page not locked to a cohort at all.
  let cohortName = page.title;
  if (page.classGroupId) {
    const [groupsRes] = await GetClassGroupsAction({ serviceType: page.serviceType });
    const group = groupsRes?.data?.find((g) => g.id === page.classGroupId);
    if (group?.label) cohortName = group.label;
  }

  const hasPromo = !!(page.promoLabel || page.promoCouponCode || page.promoDeadline);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#1c2574] text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{page.heading}</h1>
            {page.subheading && <p className="text-lg text-white/85 mb-4">{page.subheading}</p>}
            {page.scheduleNote && (
              <p className="inline-block bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm mb-2">
                {page.scheduleNote}
              </p>
            )}
          </div>
          {page.heroImageUrl && (
            <div className="relative h-56 md:h-72 rounded-lg overflow-hidden">
              <Image src={page.heroImageUrl} alt={page.heading} fill className="object-cover" />
            </div>
          )}
        </div>

        {page.stats && page.stats.length > 0 && (
          <div className="border-t border-white/10">
            <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {page.stats.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {hasPromo && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-amber-900">
            {page.promoLabel && <span className="font-semibold">🎁 {page.promoLabel}</span>}
            {page.promoDeadline && <span>- register before {formatDeadline(page.promoDeadline)}</span>}
            {page.promoCouponCode && (
              <span className="inline-flex items-center gap-1 bg-white border border-amber-300 rounded px-2 py-0.5 font-mono text-xs font-semibold text-amber-800">
                {page.promoCouponCode}
              </span>
            )}
          </div>
        </div>
      )}

      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2 order-first md:order-last">
          <CampaignSignupForm page={page} cohortName={cohortName} />
        </div>

        <div className="md:col-span-3 space-y-10">
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.body) }}
          />

          {page.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s included</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {page.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2.5 text-sm">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page.howItWorks && page.howItWorks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
              <div className="space-y-4">
                {page.howItWorks.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1c2574] text-white text-sm font-semibold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page.faqs && page.faqs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Frequently asked questions</h2>
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
                {page.faqs.map((faq, i) => (
                  <details key={i} className="group p-4">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-2 font-medium text-gray-900">
                      {faq.question}
                      <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
