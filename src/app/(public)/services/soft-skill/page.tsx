"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
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
  return <ServicePageBody slug="soft-skill" defaults={DEFAULTS} />;
}
