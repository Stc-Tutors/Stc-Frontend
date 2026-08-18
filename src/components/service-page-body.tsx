"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RegisterCTA from "@/components/register-cta";
import { GetServicePageBySlugAction } from "@/server/content";
import { ServiceBenefit, ServiceFeature, ServiceHowItWorksStep, ServiceTestimonial } from "@/types/content";

export interface ServicePageBodyContent {
  heroImageUrl?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  overview?: string;
  keyFeatures: ServiceFeature[];
  benefits: ServiceBenefit[];
  howItWorks: ServiceHowItWorksStep[];
  testimonials: ServiceTestimonial[];
  ctaLabel?: string;
}

// Shared template for every /services/:slug marketing page - content comes
// from the admin-managed ServicePage record for this slug (Stc-SuperAdmin's
// Site Content > Services tab), falling back to `defaults` (that page's
// original hardcoded copy) until an admin edits it. `serviceType` is the
// value RegisterCTA sends to the enrollment flow - usually the same as
// `slug`, but not always (e.g. tech-training's real serviceType is
// "tech-bootcamp"), so it's a separate prop rather than assumed.
export default function ServicePageBody({
  slug,
  serviceType,
  defaults,
}: {
  slug: string;
  serviceType?: string;
  defaults: ServicePageBodyContent;
}) {
  const [content, setContent] = useState<ServicePageBodyContent>(defaults);

  useEffect(() => {
    GetServicePageBySlugAction(slug).then(([res]) => {
      if (res?.data) setContent(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <main className="container mx-auto px-6 py-10">
      <section className="text-center mb-12">
        <div className="relative h-64 w-full md:h-96 bg-gray-200 rounded-lg overflow-hidden">
          {content.heroImageUrl && (
            <Image src={content.heroImageUrl} alt={content.heroHeading || "Service"} fill className="object-cover" />
          )}
        </div>
        <h1 className="text-4xl font-bold mt-6">{content.heroHeading}</h1>
        {content.heroSubtitle && <p className="text-xl text-gray-600 mt-2">{content.heroSubtitle}</p>}
      </section>

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

      {content.keyFeatures.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.keyFeatures.map((f, i) => (
              <div key={i} className="text-center p-4 border rounded-lg">
                {f.icon && <div className="text-4xl mb-2">{f.icon}</div>}
                <h3 className="font-medium">{f.title}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {content.testimonials.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
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

      <section className="text-center mb-12">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <RegisterCTA serviceType={serviceType || slug} label={content.ctaLabel || "Register Now"} />
        </div>
      </section>
    </main>
  );
}
