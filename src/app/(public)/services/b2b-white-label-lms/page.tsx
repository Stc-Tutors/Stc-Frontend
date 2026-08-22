"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ServicePage, { mergeWithDefaults } from "@/components/service-page";
import { GetWhiteLabelAction } from "@/server/white-label";
import { ServiceCatalogStatus } from "@/types/service-catalog";
import { ServiceContent } from "@/types/content";
import { WhiteLabelOffering } from "@/types/white-label";

// This is a sales-motion page, not a self-enroll one - see conversation
// notes for why. Both CTAs point to the dedicated tenant-inquiry demo-request
// form (via ctaHref) rather than RegisterCTA's individual-student
// enroll/register flow. Pricing numbers are placeholders - ask before
// publishing real figures. Testimonials are placeholder case studies/partner
// quotes, not fabricated ones.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/b2b-lms.jpg",
  heroHeading: "White-Label LMS Platform",
  heroSubtitle: "Your Own Branded Learning Platform, Powered by STC",
  overview:
    "STC's White-Label LMS puts our full learning platform under your own logo and domain, so your organization can deliver courses, manage students, tutors, and admins, and track performance through built-in reporting, without building a platform from scratch.\n\nPrefer not to run it day-to-day? Optional STC-managed administration handles that for you. Either way, platform updates are pushed centrally, so your instance stays current without any work on your end.",
  videoUrl: null,
  keyFeatures: [
    { icon: "🎨", title: "White-Label Branding", description: "Your logo, your domain, your colors." },
    { icon: "👥", title: "Student, Tutor & Admin Management", description: "Manage every role on the platform from one place." },
    { icon: "📊", title: "Reporting Dashboards", description: "Track engagement, progress, and outcomes across your organization." },
    { icon: "🛠️", title: "Optional STC-Managed Administration", description: "Let our team run day-to-day administration if you'd rather not." },
    { icon: "🔄", title: "Centralized Platform Updates", description: "New features and fixes roll out to your instance automatically." },
  ],
  pricing: [
    {
      name: "Per-Student Licensing",
      price: "[PLACEHOLDER]",
      billingNote: "Billed per active student",
      features: ["Full platform access", "Standard reporting", "Email support"],
    },
    {
      name: "Annual Organizational License",
      price: "[PLACEHOLDER]",
      billingNote: "Flat annual fee, unlimited students",
      features: ["Full platform access", "Advanced reporting", "Priority support", "Optional STC-managed administration"],
    },
  ],
  benefits: [
    {
      title: "Launch Without Building From Scratch",
      description: "Get a fully-featured learning platform live under your brand, without the time or cost of building one yourself.",
    },
    {
      title: "Stay Focused on Your Core Work",
      description: "Optional STC-managed administration means your team doesn't have to run the platform day-to-day.",
    },
    {
      title: "Always Up to Date",
      description: "Centralized updates mean your instance improves over time without any work on your end.",
    },
  ],
  whoFor: [
    "Schools and educational institutions",
    "NGOs and training institutes",
    "Independent tutoring businesses",
    "Companies that want their own branded learning platform",
  ],
  howItWorks: [
    { step: "Book a Consultation", description: "Tell us about your organization and what you need from a branded learning platform." },
    { step: "See a Live Demo", description: "We walk you through the platform configured for a use case like yours." },
    { step: "We Set Up Your Instance", description: "Your logo, domain, and colors are configured, with your students, tutors, and admins onboarded." },
    { step: "Launch & Get Ongoing Updates", description: "Go live on your own branded platform, with centralized updates handled for you." },
  ],
  testimonialsHeading: "Case Studies & Partners",
  testimonials: [{ quote: "[PLACEHOLDER — add a real case study or partner quote here]", author: "[Partner organization]" }],
  ctaLabel: "Request a Demo",
  secondaryCtaLabel: "Book a Consultation",
  ctaHref: "/services/b2b-white-label-lms/request-demo",
  closingHeading: "Ready to Launch Your Own Branded Platform?",
  closingBody: "Talk to our team about setting up a white-label LMS for your school, NGO, training institute, or business.",
};

export default function B2BWhiteLabelLMS() {
  const router = useRouter();
  const [offering, setOffering] = useState<WhiteLabelOffering | null | undefined>(undefined);

  useEffect(() => {
    GetWhiteLabelAction().then(([res]) => setOffering(res?.data ?? null));
  }, []);

  if (offering === undefined) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  // No document yet (nobody's touched the White Label tab since the
  // Service Catalog migration) is treated the same as Active, not Coming
  // Soon - only an explicit non-Active status hides the real content.
  if (offering && offering.status !== ServiceCatalogStatus.ACTIVE) {
    return (
      <main className="flex flex-col items-center justify-center py-24 px-6 text-center min-h-[50vh]">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{DEFAULTS.heroHeading}</h1>
        <p className="text-2xl font-semibold text-[#38b6ff] mb-4">Coming Soon</p>
        <p className="text-gray-600 max-w-md mb-8">
          We&apos;re still putting the finishing touches on this program. Check back soon, or explore our other
          services in the meantime.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <button
            onClick={() => router.push("/services")}
            className="bg-[#38b6ff] text-white px-6 py-3 rounded-lg hover:bg-[#1c2574] transition"
          >
            Browse Services
          </button>
        </div>
      </main>
    );
  }

  return (
    <ServicePage
      slug="b2b-white-label-lms"
      defaults={DEFAULTS}
      content={offering ? mergeWithDefaults(DEFAULTS, offering) : undefined}
    />
  );
}
