"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Testimonials intentionally omitted (empty array) pending real quotes -
// don't add placeholder text here, since the template already hides the
// section entirely when the array is empty.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/music.jpg",
  heroHeading: "Music Training",
  heroSubtitle: "Explore Your Musical Talent With Professional Guidance",
  overview:
    "STC Tutors' Music Training offers one-on-one and small-group lessons across a range of instruments and voice, guided by experienced tutors who tailor every lesson to your level and goals. Whether you're picking up your first instrument or refining technique for an audition, our structured progression builds real skill step by step.\n\nWe pair technical practice with low-pressure performance opportunities, so students grow comfortable playing in front of others at their own pace, building confidence alongside ability.",
  videoUrl: null,
  keyFeatures: [
    { icon: "🎹", title: "One-on-One & Small-Group Lessons" },
    { icon: "🎼", title: "Structured, Level-Based Progression" },
    { icon: "🎤", title: "Multiple Instruments & Voice" },
    { icon: "🎭", title: "Low-Pressure Performance Opportunities" },
    { icon: "🌐", title: "Flexible Virtual Scheduling" },
  ],
  benefits: [
    {
      title: "Build Real Technique",
      description: "Structured lessons take you from fundamentals to more advanced playing at a pace that matches your level.",
    },
    {
      title: "Grow in Confidence",
      description: "Regular, low-pressure performance opportunities help students get comfortable playing for others before a big audition or recital.",
    },
    {
      title: "Learn From Experienced Tutors",
      description: "Work with tutors who tailor lessons to your instrument, goals, and learning style.",
    },
  ],
  whoFor: [
    "Kids exploring an instrument as a hobby",
    "Teens preparing for auditions or talent shows",
    "Adults picking up an instrument for the first time",
  ],
  howItWorks: [
    { step: "Sign Up & Skill Assessment", description: "Tell us your instrument (or voice) and current level so we can match you with the right tutor." },
    { step: "Get Matched With a Tutor", description: "We pair you with a tutor experienced in your instrument and your goals, whether that's a hobby or an audition." },
    { step: "Attend Regular Lessons", description: "Learn one-on-one or in a small group, with a lesson plan that builds on what you've already learned." },
    { step: "Practice & Perform", description: "Apply what you've learned in low-pressure performance opportunities as you build toward bigger goals." },
  ],
  testimonials: [],
  ctaLabel: "Start Music Training Now",
};

export default function MusicTraining() {
  return <ServicePage slug="music-training" defaults={DEFAULTS} />;
}
