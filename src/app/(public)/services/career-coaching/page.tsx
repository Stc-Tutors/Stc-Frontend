"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/career.jpg",
  heroHeading: "Career Coaching",
  heroSubtitle: "Guidance At Your Convenience",
  overview:
    "We help learners prepare for future opportunities with CV reviews, interview prep, public speaking, digital literacy, and personalized coaching. Perfect for teens, graduates, and job seekers.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Career Coaching Now",
};

export default function CareerCoaching() {
  return <ServicePageBody slug="career-coaching" defaults={DEFAULTS} />;
}
