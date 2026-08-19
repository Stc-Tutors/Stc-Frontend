"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Testimonials intentionally omitted (empty array) pending real quotes -
// don't add placeholder text here, since the template already hides the
// section entirely when the array is empty.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/adult education.jpg",
  heroHeading: "Adult Education",
  heroSubtitle: "Learning Has No Age Limit",
  overview:
    "It's never too late to learn. STC Tutors' Adult Education program builds literacy, numeracy, and functional skills at a pace that respects your time and experience, in a judgment-free environment designed for adult learners.\n\nEvery lesson is tied to practical, day-to-day and workplace use, whether you're strengthening the basics, modeling lifelong learning for your own kids, or building skills your job now expects of you.",
  videoUrl: null,
  keyFeatures: [
    { icon: "📖", title: "Literacy & Numeracy Foundations" },
    { icon: "💼", title: "Practical, Workplace-Ready Skills" },
    { icon: "🤝", title: "Judgment-Free Learning Environment" },
    { icon: "⏰", title: "Flexible, Adult-Paced Scheduling" },
  ],
  benefits: [
    {
      title: "Learn Without Judgment",
      description: "Lessons are built for adult learners, at your pace, with tutors who understand you're starting from where you are, not where you 'should' be.",
    },
    {
      title: "Build Skills You'll Actually Use",
      description: "Every lesson ties back to real day-to-day and workplace situations, not abstract exercises.",
    },
    {
      title: "Model Lifelong Learning",
      description: "Show your kids or family what it looks like to keep learning and growing at any age.",
    },
  ],
  whoFor: [
    "Adults who missed out on formal schooling",
    "Parents modeling lifelong learning for their kids",
    "Professionals brushing up on the basics",
  ],
  howItWorks: [
    { step: "Sign Up & Quick Assessment", description: "Tell us where you're starting from so we can build a plan around your real needs." },
    { step: "Get Matched With a Tutor", description: "We pair you with a tutor experienced in adult learning, not just classroom teaching." },
    { step: "Learn at Your Own Pace", description: "Attend sessions that fit around work and family, with no pressure to move faster than you're ready for." },
    { step: "Apply It Right Away", description: "Practice skills tied directly to real situations you'll use at home or at work." },
  ],
  testimonials: [],
  ctaLabel: "Start Adult Education Now",
};

export default function AdultEducation() {
  return <ServicePage slug="adult-education" defaults={DEFAULTS} />;
}
