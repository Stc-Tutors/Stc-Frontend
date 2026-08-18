"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/self development.jpg",
  heroHeading: "Self-Development",
  heroSubtitle: "Shape Your Career Path",
  overview:
    "Enhance your personal and professional growth with courses focused on leadership, productivity, and mindset development.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Self-Development Now",
};

export default function SelfDevelopment() {
  return <ServicePageBody slug="self-development" defaults={DEFAULTS} />;
}
