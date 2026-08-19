"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

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
  return <ServicePage slug="b2b-white-label-lms" defaults={DEFAULTS} />;
}
