"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

const DEFAULTS: ServiceContent = {
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
  return <ServicePage slug="adult-education" defaults={DEFAULTS} />;
}
