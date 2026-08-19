"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

const DEFAULTS: ServiceContent = {
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
  return <ServicePage slug="career-coaching" defaults={DEFAULTS} />;
}
