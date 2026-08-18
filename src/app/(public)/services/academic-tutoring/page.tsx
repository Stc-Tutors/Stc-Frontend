"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/academic2.jpg",
  heroHeading: "Academic Tutoring",
  heroSubtitle: "Personalized Support to Unlock Every Student's Potential",
  overview:
    "STC Tutors' Academic Tutoring provides personalized, one-on-one support in core subjects—Mathematics, English, Sciences, and Social Studies. Our expert tutors tailor each lesson to your curriculum (WAEC, GCSE, SAT, etc.), ensuring you master every concept.\n\nResearch shows personalized tutoring can boost grades by up to 20%, while building critical thinking and study skills that last a lifetime.",
  keyFeatures: [
    { icon: "🎯", title: "Customized Lesson Plans", description: "" },
    { icon: "⏰", title: "Flexible Scheduling", description: "" },
    { icon: "📈", title: "Progress Tracking", description: "" },
    { icon: "🌐", title: "Virtual Classroom", description: "" },
  ],
  benefits: [
    { title: "Improved Confidence & Engagement", description: "Our interactive whiteboard keeps students engaged and motivated to learn." },
    { title: "Measurable Grade Improvement", description: "On average, our students improve by 15–20% in their exam scores." },
    { title: "Lifelong Learning Skills", description: "Build study habits and critical thinking skills for continued academic success." },
  ],
  howItWorks: [
    { step: "Sign Up & Assessment", description: "Complete a quick diagnostic quiz." },
    { step: "Match with Tutor", description: "We pair you with an expert in your subject and exam board." },
    { step: "Schedule Sessions", description: "Book slots via your dashboard (max 2 hrs/day per subject)." },
    { step: "Learn & Review", description: "Attend live classes, access recordings, and track your progress." },
  ],
  testimonials: [
    { quote: "I went from a C to an A in Mathematics in just three months!", author: "Aisha, WAEC candidate" },
    { quote: "The flexible schedule meant I could fit sessions around my job.", author: "David, adult learner" },
  ],
  ctaLabel: "Start Academic Tutoring Now",
};

export default function AcademicTutoring() {
  return <ServicePageBody slug="academic-tutoring" defaults={DEFAULTS} />;
}
