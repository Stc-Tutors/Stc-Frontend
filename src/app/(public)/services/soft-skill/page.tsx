"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Testimonials intentionally omitted (empty array) pending real quotes -
// don't add placeholder text here, since the template already hides the
// section entirely when the array is empty.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/skills.jpg",
  heroHeading: "Soft Skill Development",
  heroSubtitle: "Build Professional Excellence",
  overview:
    "STC Tutors' Soft Skill Development program treats communication, teamwork, time management, and leadership as skills you can practice and improve, not traits you're just born with.\n\nSessions are workshop-style and scenario-based, so you leave each one with something you can use immediately, whether that's in a job interview, a first week on the job, or a team project.",
  videoUrl: null,
  keyFeatures: [
    { icon: "🗣️", title: "Communication & Presentation Practice" },
    { icon: "🤝", title: "Teamwork & Collaboration Scenarios" },
    { icon: "⏰", title: "Time & Priority Management" },
    { icon: "🌟", title: "Leadership Fundamentals" },
    { icon: "🎯", title: "Workshop-Style, Scenario-Based Learning" },
  ],
  benefits: [
    {
      title: "Practice, Not Just Theory",
      description: "Scenario-based workshops let you practice real workplace situations, not just read about them.",
    },
    {
      title: "Walk In Job-Interview Ready",
      description: "Build the communication and presentation skills that come up in interviews and first impressions.",
    },
    {
      title: "Skills You Can Use Immediately",
      description: "Every session is built around something you can apply right away, at work or in your next interview.",
    },
  ],
  whoFor: [
    "Final-year students entering the workforce",
    "New hires starting a first (or first professional) job",
    "Career switchers moving into a new industry",
  ],
  howItWorks: [
    { step: "Sign Up & Goal Check-In", description: "Tell us what you're preparing for, whether that's a job search, a new role, or a career switch." },
    { step: "Join Workshop-Style Sessions", description: "Practice communication, teamwork, time management, and leadership through real scenarios, not lectures." },
    { step: "Get Direct Feedback", description: "Tutors give you feedback in the moment, so you know exactly what to adjust." },
    { step: "Apply It at Work or in Interviews", description: "Take what you've practiced straight into interviews, new roles, or team projects." },
  ],
  testimonials: [],
  ctaLabel: "Start Soft Skill Training Now",
};

export default function SoftSkillDevelopment() {
  return <ServicePage slug="soft-skill" defaults={DEFAULTS} />;
}
