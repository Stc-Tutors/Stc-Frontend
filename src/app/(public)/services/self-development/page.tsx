"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Testimonials intentionally omitted (empty array) pending real quotes -
// don't add placeholder text here, since the template already hides the
// section entirely when the array is empty.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/self development.jpg",
  heroHeading: "Self-Development",
  heroSubtitle: "Shape Your Career Path",
  overview:
    "STC Tutors' Self-Development program is built on practical frameworks, not motivational talk. We work with you on goal-setting, productivity systems, mindset, and accountability, skills that compound over time.\n\nEach session focuses on tools you can put into practice immediately, whether you're building better habits as a student, growing a business as an entrepreneur, or leveling up early in your career.",
  videoUrl: null,
  keyFeatures: [
    { icon: "🎯", title: "Goal-Setting Frameworks" },
    { icon: "⚙️", title: "Productivity Systems" },
    { icon: "🧠", title: "Mindset Coaching" },
    { icon: "🤝", title: "Accountability Check-Ins" },
  ],
  benefits: [
    {
      title: "Frameworks Over Motivation",
      description: "Leave each session with a practical system you can actually use, not just a temporary boost.",
    },
    {
      title: "Habits That Compound",
      description: "Build routines and systems designed to keep working long after the session ends.",
    },
    {
      title: "Real Accountability",
      description: "Regular check-ins keep you on track toward the goals you've actually set.",
    },
  ],
  whoFor: [
    "Young professionals building better habits",
    "Entrepreneurs looking for practical productivity systems",
    "Students working on goal-setting and accountability",
  ],
  howItWorks: [
    { step: "Set Your Goals", description: "Start by defining what you're actually working toward, whether that's a habit, a business goal, or a mindset shift." },
    { step: "Get Matched With a Coach", description: "We pair you with a coach experienced in goal-setting, productivity, and accountability coaching." },
    { step: "Build Your System", description: "Work through practical frameworks for productivity, mindset, and habit-building, not generic advice." },
    { step: "Stay Accountable", description: "Regular check-ins keep you moving toward your goals between sessions." },
  ],
  testimonials: [],
  ctaLabel: "Start Self-Development Now",
};

export default function SelfDevelopment() {
  return <ServicePage slug="self-development" defaults={DEFAULTS} />;
}
