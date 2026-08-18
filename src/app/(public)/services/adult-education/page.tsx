"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/adult education.jpg",
  heroHeading: "Adult Education",
  heroSubtitle: "Learning Has No Age Limit",
  overview:
    "It's never too late to learn. Our adult education programs are tailored for personal development, literacy improvement, and practical skill-building for everyday life and career advancement.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Adult Education Now",
};

export default function AdultEducation() {
  return <ServicePageBody slug="adult-education" defaults={DEFAULTS} />;
}
