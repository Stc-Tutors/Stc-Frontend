"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/culture.jpg",
  heroHeading: "Language and Culture",
  heroSubtitle: "Speak Any Language With Confidence",
  overview:
    "Master new languages with the help of experienced instructors. We offer courses in French, Spanish, Portuguese, Swahili, Zulu, and major Nigerian languages and culture like Yoruba, Hausa, and Igbo, designed for beginners to advanced learners.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Language & Culture Now",
};

export default function LanguageAndCulture() {
  return <ServicePageBody slug="language-culture" defaults={DEFAULTS} />;
}
