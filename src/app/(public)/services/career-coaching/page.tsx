"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Reframed from the old "teens, graduates, and job seekers" copy to the
// adult/job-seeker angle - see conversation notes on why the earlier
// "youth mentorship, ages 5-18" framing doesn't match what's live.
// Testimonials intentionally omitted (empty array) pending real quotes.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/career.jpg",
  heroHeading: "Career Coaching",
  heroSubtitle: "Guidance At Your Convenience",
  overview:
    "STC Tutors' Career Coaching gives you focused, one-on-one support to move toward a specific role or industry, from CV and resume review to interview preparation and personal branding.\n\nWhether you're a fresh graduate, targeting roles in the UK or US, or re-entering the job market, coaching is built around your goals, not a generic template.",
  videoUrl: null,
  keyFeatures: [
    { icon: "📄", title: "CV & Resume Review" },
    { icon: "🎤", title: "Interview Preparation" },
    { icon: "💼", title: "Personal Branding & LinkedIn" },
    { icon: "🎯", title: "1-on-1 Coaching Toward a Specific Role" },
  ],
  benefits: [
    {
      title: "Stand Out on Paper",
      description: "Get your CV and LinkedIn profile reviewed and strengthened by someone who knows what employers look for.",
    },
    {
      title: "Walk Into Interviews Prepared",
      description: "Practice real interview scenarios so you're ready, not guessing, on the day it matters.",
    },
    {
      title: "Coaching Built Around Your Goal",
      description: "Sessions are focused on the specific role or industry you're targeting, not generic career advice.",
    },
  ],
  whoFor: [
    "Fresh graduates starting their job search",
    "Professionals targeting roles in the UK or US",
    "People re-entering the job market",
  ],
  howItWorks: [
    { step: "Share Your Goal", description: "Tell us the role or industry you're targeting, whether that's your first job or a career pivot." },
    { step: "Get Matched With a Coach", description: "We pair you with a coach experienced in your target role or market." },
    { step: "Work Through CV, LinkedIn & Interview Prep", description: "Build and refine the materials and skills you'll actually use in your job search." },
    { step: "Apply With Confidence", description: "Go into applications and interviews with a plan, not just hope." },
  ],
  testimonials: [],
  ctaLabel: "Start Career Coaching Now",
};

export default function CareerCoaching() {
  return <ServicePage slug="career-coaching" defaults={DEFAULTS} />;
}
