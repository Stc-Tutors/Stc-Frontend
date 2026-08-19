"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/skills.jpg",
  heroHeading: "Soft Skill Development",
  heroSubtitle: "Build Professional Excellence",
  overview:
    "Gain practical skills and hands-on experience to excel in your career with expert-led job training programs.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Soft Skill Training Now",
};

export default function SoftSkillDevelopment() {
  return <ServicePage slug="soft-skill" defaults={DEFAULTS} />;
}
