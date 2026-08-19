"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Testimonials intentionally omitted (empty array) pending real quotes -
// don't add placeholder text here, since the template already hides the
// section entirely when the array is empty.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/culture.jpg",
  heroHeading: "Language and Culture",
  heroSubtitle: "Speak Any Language With Confidence",
  overview:
    "STC Tutors' Language and Culture program pairs you with native-speaking tutors for conversation-first lessons in French, Spanish, Portuguese, Swahili, Zulu, and major Nigerian languages including Yoruba, Hausa, and Igbo.\n\nEvery lesson goes beyond vocabulary and grammar to include the cultural context behind the language, so you're learning how it's actually spoken and understood, not just memorizing rules.",
  videoUrl: null,
  keyFeatures: [
    { icon: "🗣️", title: "Native-Speaking Tutors" },
    { icon: "💬", title: "Conversation-First Teaching" },
    { icon: "🌍", title: "Cultural Context, Not Just Grammar" },
    { icon: "📚", title: "Multiple Languages, Beginner to Advanced" },
  ],
  benefits: [
    {
      title: "Learn to Actually Speak It",
      description: "Conversation-first lessons build real spoken confidence, not just textbook knowledge.",
    },
    {
      title: "Understand the Culture, Not Just the Words",
      description: "Tutors teach the cultural context behind the language, so you understand how and when it's really used.",
    },
    {
      title: "Reconnect or Get Career-Ready",
      description: "Whether you're reconnecting with a heritage language or adding one for work, lessons are built around your reason for learning.",
    },
  ],
  whoFor: [
    "Diaspora children reconnecting with a heritage language like Yoruba, Hausa, or Igbo",
    "Professionals adding French or Spanish for career reasons",
    "Travelers and expats preparing for a new country",
  ],
  howItWorks: [
    { step: "Choose Your Language", description: "Pick from French, Spanish, Portuguese, Swahili, Zulu, Yoruba, Hausa, Igbo, and more." },
    { step: "Get Matched With a Native-Speaking Tutor", description: "We pair you with a tutor fluent in both the language and its cultural context." },
    { step: "Learn Through Conversation", description: "Practice real spoken conversation from your very first lessons, not just grammar drills." },
    { step: "Build Toward Fluency", description: "Progress at a pace that fits your goals, whether that's family conversations, travel, or work." },
  ],
  testimonials: [],
  ctaLabel: "Start Language & Culture Now",
};

export default function LanguageAndCulture() {
  return <ServicePage slug="language-culture" defaults={DEFAULTS} />;
}
