import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { GetCampaignLandingPageAction } from "@/server/campaign-landing-page";
import { GetClassGroupsAction } from "@/server/class-group";
import { GetPageSectionsAction } from "@/server/content";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { HeadSeoContent, PageSectionKey } from "@/types/content";
import type { CampaignLandingPage as LandingPageData } from "@/types/campaign-landing-page";
import CampaignSignupForm from "./CampaignSignupForm";
import PromoBanner, { promoExpired } from "./PromoBanner";
import { WhatsAppFloat } from "./WhatsAppButtons";

type Params = Promise<{ slug: string }>;

// generateMetadata and the page both need the page - fetch it once per request.
const loadPage = cache(async (slug: string) => {
  const [res] = await GetCampaignLandingPageAction(slug);
  return res?.data ?? null;
});

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string, max = 155) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

// Link previews matter here - these pages are shared mostly on WhatsApp - so
// the title/description/image are the admin's own marketing copy, never the
// slug or the internal admin title.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};

  const title = `${page.heading} | STC Tutors`;
  const description = page.subheading?.trim() || excerpt(plainText(page.body));

  // The site-wide default share image (Site Content > Head SEO), used when
  // this page has no hero image of its own. Declaring openGraph here replaces
  // the layout's, so it has to be re-supplied explicitly.
  let image = page.heroImageUrl;
  if (!image) {
    const [sectionsRes] = await GetPageSectionsAction();
    const seo = sectionsRes?.data?.find((s) => s.sectionKey === PageSectionKey.HEAD_SEO)?.data as HeadSeoContent | undefined;
    image = seo?.ogImageUrl;
  }

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, type: "website", images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

// Whether the visitor still has to pick the child's track (coding, design,
// video editing...), and where:
//  - "form": a flow-tree page with nothing locked picks it in the form itself.
//  - "after-signup": a course page with no course locked shows a course picker
//    right after account creation, before payment.
//  - null: the admin locked the track, nothing to choose.
function trackChoiceStage(page: LandingPageData): "form" | "after-signup" | null {
  if (page.pricingMode === "COURSE") return page.courseId ? null : "after-signup";
  return page.taxonomyNodeId ? null : "form";
}

const TRACK_WORDS = /track|course|choose|pick|select/i;

function HowItWorks({ page }: { page: LandingPageData }) {
  const stage = trackChoiceStage(page);
  const when = stage === "after-signup" ? "right after you register, before payment" : "in the form, before payment";
  const trackText = `Choose your child's track (coding, design, video editing and more) ${when}.`;

  // Admin-written steps are shown exactly as written. If the track is still to
  // be chosen and no step already says so, a short note under the list makes it
  // visible; the schedule note is added under the last step the same way.
  const adminSteps = page.howItWorks ?? [];
  const steps =
    adminSteps.length > 0
      ? adminSteps
      : [
          { title: "Register", description: "Create your parent account and add your child's details." },
          stage
            ? { title: "Choose a track", description: trackText }
            : { title: "Your program is ready", description: "The course and cohort are already selected for you." },
          { title: "Pay securely", description: "Pay online - you'll see the price before you confirm." },
          { title: "Start learning", description: page.scheduleNote || "Join your first live class with a certified tutor." },
        ];

  const mentionsTrack = steps.some((s) => TRACK_WORDS.test(`${s.title} ${s.description}`));
  const showTrackHint = adminSteps.length > 0 && !!stage && !mentionsTrack;
  const lastIndex = steps.length - 1;
  const showScheduleOnLast = adminSteps.length > 0 && !!page.scheduleNote && !steps[lastIndex].description.includes(page.scheduleNote);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1c2574] text-white text-sm font-semibold flex items-center justify-center">{i + 1}</div>
            <div>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-600">{step.description}</p>
              {i === lastIndex && showScheduleOnLast && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#1c2574]">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {page.scheduleNote}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {showTrackHint && <p className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">{trackText}</p>}
    </div>
  );
}

export default async function CampaignLandingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  // The cohort's own name (e.g. "Tech for Kids November 2026 Cohort") -
  // distinct from `page.title`, which is an internal admin label for the
  // Landing Pages list, not marketing copy. Used as the small label on the
  // signup card and in the WhatsApp message, never as the page's H1 (that is
  // the admin's Heading). Falls back to `page.title` for a page not locked to
  // a cohort at all.
  let cohortName = page.title;
  if (page.classGroupId) {
    const [groupsRes] = await GetClassGroupsAction({ serviceType: page.serviceType });
    const group = groupsRes?.data?.find((g) => g.id === page.classGroupId);
    if (group?.label) cohortName = group.label;
  }

  const showPromo = !!(page.promoLabel || page.promoCouponCode || page.promoDeadline) && !promoExpired(page.promoDeadline);
  const hasStats = !!page.stats && page.stats.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#1c2574] text-white">
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 grid gap-8 items-center ${page.heroImageUrl ? "md:grid-cols-2" : ""}`}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">{page.heading || cohortName}</h1>
            {page.subheading && <p className="text-lg text-white/85">{page.subheading}</p>}
          </div>
          {page.heroImageUrl && (
            // Fixed aspect ratio reserves the space up front (no layout shift);
            // max-h keeps a tall image from pushing the form off a phone screen.
            <div className="relative w-full aspect-[16/10] max-h-72 md:max-h-80 rounded-lg overflow-hidden bg-white/10">
              <Image src={page.heroImageUrl} alt={page.heading} fill priority sizes="(min-width: 768px) 512px, 100vw" className="object-cover" />
            </div>
          )}
        </div>

        {hasStats && (
          <div className="border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {page.stats!.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {page.scheduleNote && (
          <div className="border-t border-white/10 bg-white/5">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-center text-sm font-medium">
              <CalendarDays className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
              <span>{page.scheduleNote}</span>
            </div>
          </div>
        )}
      </section>

      {showPromo && <PromoBanner label={page.promoLabel} deadline={page.promoDeadline} code={page.promoCouponCode} />}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2 order-first md:order-last">
          <CampaignSignupForm page={page} cohortName={cohortName} />
        </div>

        <div className="md:col-span-3 space-y-10">
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.body) }} />

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

          <HowItWorks page={page} />

          {page.testimonials && page.testimonials.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What parents say</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {page.testimonials.map((t, i) => (
                  <figure key={i} className="bg-white border border-gray-100 rounded-lg p-4">
                    <blockquote className="text-sm text-gray-700">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-3 text-xs font-medium text-gray-900">
                      {t.name}
                      {t.location && <span className="font-normal text-gray-500"> · {t.location}</span>}
                    </figcaption>
                  </figure>
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

      <WhatsAppFloat pageName={cohortName} />
    </main>
  );
}
