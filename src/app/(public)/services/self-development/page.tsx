"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

const DEFAULTS: ServiceContent = {
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
  return <ServicePage slug="self-development" defaults={DEFAULTS} />;
}
