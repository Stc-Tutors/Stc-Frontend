"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RegisterCTA from "@/components/register-cta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GetServicePageBySlugAction } from "@/server/content";
import { ServiceContent } from "@/types/content";

// Hero/closing CTA, swapped in when `content.ctaHref` is set - for
// sales-motion services (e.g. B2B) where RegisterCTA's individual-student
// enroll/register routing doesn't apply. Styled to match RegisterCTA so
// swapping between the two is visually seamless.
function LinkCTA({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Button asChild className={cn("bg-blue-600 text-white hover:bg-blue-700 h-auto px-6 py-3", className)}>
      <a href={href}>{label}</a>
    </Button>
  );
}

// Converts any watch/youtu.be/embed-style YouTube URL into an embeddable
// player URL. Returns null for anything it can't confidently parse, so the
// caller can hide the section rather than risk rendering a broken iframe.
function getYouTubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    let videoId: string | null = null;

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/embed/")[1];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

// Merges the fetched ServicePage record over `defaults` field by field,
// rather than replacing `defaults` wholesale. This matters because the CMS
// record for a slug can be partial - e.g. an admin who only pasted a video
// URL via the Service Videos tab causes an upsert that creates a bare
// document with just `videoUrl` set; every other field is an empty
// string/array from the Mongoose schema defaults, not a deliberate "clear
// this section" from an admin. A wholesale replace would blank out the
// page's real hardcoded copy the moment any one field got saved. Falling
// back to `defaults` per-field for anything empty/missing means a field only
// overrides once it actually has content - the tradeoff is that clearing a
// list-type section back to fully empty via the CMS re-reveals the
// hardcoded defaults rather than hiding the section, which is an acceptable
// edge case next to the alternative of admin edits nuking unrelated content.
export function mergeWithDefaults(defaults: ServiceContent, fetched: Partial<ServiceContent>): ServiceContent {
  return {
    heroImageUrl: fetched.heroImageUrl || defaults.heroImageUrl,
    heroHeading: fetched.heroHeading || defaults.heroHeading,
    heroSubtitle: fetched.heroSubtitle || defaults.heroSubtitle,
    overview: fetched.overview || defaults.overview,
    videoUrl: fetched.videoUrl || defaults.videoUrl,
    keyFeatures: fetched.keyFeatures?.length ? fetched.keyFeatures : defaults.keyFeatures,
    courses: fetched.courses?.length ? fetched.courses : defaults.courses,
    benefits: fetched.benefits?.length ? fetched.benefits : defaults.benefits,
    whoFor: fetched.whoFor?.length ? fetched.whoFor : defaults.whoFor,
    howItWorks: fetched.howItWorks?.length ? fetched.howItWorks : defaults.howItWorks,
    testimonials: fetched.testimonials?.length ? fetched.testimonials : defaults.testimonials,
    ctaLabel: fetched.ctaLabel || defaults.ctaLabel,
    secondaryCtaLabel: fetched.secondaryCtaLabel || defaults.secondaryCtaLabel,
    // Template-only fields the CMS record never carries (see ServiceContent)
    // - always come from defaults, since `fetched` can't override them yet.
    ctaHref: defaults.ctaHref,
    pricing: defaults.pricing,
    testimonialsHeading: defaults.testimonialsHeading,
    closingHeading: defaults.closingHeading,
    closingBody: defaults.closingBody,
  };
}

// Single reusable template every /services/:slug marketing page renders
// from. Content comes from the admin-managed ServicePage record for this
// slug (Stc-SuperAdmin's Site Content > Services tab), merged field-by-field
// over `defaults` (that page's hardcoded starting copy) so a partially
// customized record can't blank out sections the admin never touched.
// `serviceType` is the value RegisterCTA sends to the enrollment flow -
// usually the same as `slug`, but not always (e.g. tech-training's real
// serviceType is "tech-bootcamp"), so it's a separate prop rather than
// assumed.
//
// Section order and optionality are fixed by design: Hero, Overview, Steps,
// and the two CTAs always render. Video, Key Features, Courses, Benefits,
// Who This Is For, and Testimonials each render only when their content is
// present, so thinner services never show an empty section.
export default function ServicePage({
  slug,
  serviceType,
  defaults,
  content: providedContent,
}: {
  slug: string;
  serviceType?: string;
  defaults: ServiceContent;
  // When set, this component renders it as-is and skips its own CMS fetch -
  // for pages whose caller already fetched from a different content store
  // (e.g. the dedicated White-Label offering) and merged it with `defaults`
  // itself (see mergeWithDefaults, exported for that purpose).
  content?: ServiceContent;
}) {
  const [content, setContent] = useState<ServiceContent>(providedContent ?? defaults);

  useEffect(() => {
    if (providedContent) return;
    GetServicePageBySlugAction(slug).then(([res]) => {
      if (res?.data) setContent(mergeWithDefaults(defaults, res.data));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, providedContent]);

  const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null;
  const ctaServiceType = serviceType || slug;

  return (
    <main className="container mx-auto px-6 py-10">
      {/* Hero */}
      <section className="text-center mb-12">
        <div className="relative h-64 w-full md:h-96 bg-gray-200 rounded-lg overflow-hidden">
          {content.heroImageUrl && (
            <Image src={content.heroImageUrl} alt={content.heroHeading || "Service"} fill className="object-cover" />
          )}
        </div>
        <h1 className="text-4xl font-bold mt-6">{content.heroHeading}</h1>
        {content.heroSubtitle && <p className="text-xl text-gray-600 mt-2">{content.heroSubtitle}</p>}
        <div className="mt-6">
          {content.ctaHref ? (
            <LinkCTA href={content.ctaHref} label={content.ctaLabel || "Get in Touch"} />
          ) : (
            <RegisterCTA serviceType={ctaServiceType} label={content.ctaLabel || "Register Now"} />
          )}
        </div>
      </section>

      {/* Overview */}
      {content.overview && (
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          {content.overview.split("\n\n").map((p, i) => (
            <p key={i} className="mb-2 text-gray-700">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* Video */}
      {embedUrl && (
        <section className="mb-12 max-w-3xl mx-auto">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={`${content.heroHeading || "Service"} video`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Key Features */}
      {content.keyFeatures.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.keyFeatures.map((f, i) => (
              <div key={i} className="text-center p-4 border rounded-lg">
                {f.icon && <div className="text-4xl mb-2">{f.icon}</div>}
                <h3 className="font-medium">{f.title}</h3>
                {f.description && <p className="text-sm text-gray-600 mt-1">{f.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Courses / bundles */}
      {content.courses && content.courses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.courses.map((course, i) => (
              <div key={i} className="border rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-xl font-bold text-[#1c2574]">{course.name}</h3>
                {course.items && course.items.length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    {course.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benefits */}
      {content.benefits.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-8 text-center">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {content.benefits.map((b, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                <p>{b.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pricing / plans */}
      {content.pricing && content.pricing.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {content.pricing.map((plan, i) => (
              <div key={i} className="border rounded-lg p-6 bg-white shadow-md text-center">
                <h3 className="text-xl font-bold text-[#1c2574]">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">{plan.price}</p>
                {plan.billingNote && <p className="text-sm text-gray-500">{plan.billingNote}</p>}
                {plan.features && plan.features.length > 0 && (
                  <ul className="text-left list-disc list-inside mt-4 space-y-1 text-gray-700">
                    {plan.features.map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Who This Is For */}
      {content.whoFor && content.whoFor.length > 0 && (
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {content.whoFor.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* How It Works */}
      {content.howItWorks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            {content.howItWorks.map((s, i) => (
              <li key={i}>
                <strong>{s.step}:</strong> {s.description}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Testimonials */}
      {content.testimonials.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{content.testimonialsHeading || "Testimonials"}</h2>
          <div className="space-y-6">
            {content.testimonials.map((t, i) => (
              <blockquote key={i} className="p-4 border-l-4 border-blue-500 bg-gray-50">
                <p className="italic">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-2 text-right font-semibold">— {t.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA banner - visually distinct from the hero, different copy */}
      <section className="mb-12">
        <div className="max-w-2xl mx-auto text-center bg-[#1c2574] text-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-3">{content.closingHeading || "Ready to Get Started?"}</h2>
          <p className="mb-6 text-gray-200">
            {content.closingBody || `Join STC Tutors today and take the next step with ${content.heroHeading || "this program"}.`}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition"
            >
              ← Back
            </button>
            {content.ctaHref ? (
              <LinkCTA
                href={content.ctaHref}
                label={content.secondaryCtaLabel || "Get in Touch"}
                className="bg-white text-[#1c2574] hover:bg-gray-100"
              />
            ) : (
              <RegisterCTA
                serviceType={ctaServiceType}
                label={content.secondaryCtaLabel || "Enroll Now"}
                className="bg-white text-[#1c2574] hover:bg-gray-100"
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
