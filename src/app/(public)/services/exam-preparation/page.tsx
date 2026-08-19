"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/Exam2.jpg",
  heroHeading: "Exam Preparation",
  heroSubtitle: "Focused Training to Ace Your Exams",
  overview:
    "Our Exam Preparation service offers specialized coaching for major exams—WAEC, JAMB, NECO, GCSE, SAT, and ACT. We use past papers, timed drills, and expert strategies to build confidence and improve scores.\n\nWith targeted practice and personalized feedback, students consistently achieve top grades and secure admissions.",
  videoUrl: null,
  keyFeatures: [
    { icon: "📝", title: "Past Paper Drills" },
    { icon: "⏱️", title: "Timed Practice" },
    { icon: "📊", title: "Performance Analytics" },
    { icon: "🎯", title: "Strategy Workshops" },
  ],
  whoFor: [
    "Students preparing for WAEC, JAMB, NECO, GCSE, SAT, or ACT",
    "Learners who want structured, timed practice under real exam conditions",
    "Anyone looking to build confidence and strategy before test day",
  ],
  benefits: [
    { title: "Improved Confidence & Engagement", description: "Our interactive whiteboard keeps students engaged and motivated to learn." },
    { title: "Measurable Grade Improvement", description: "On average, our students improve by 15–20% in their exam scores." },
    { title: "Lifelong Learning Skills", description: "Build study habits and critical thinking skills for continued academic success." },
  ],
  howItWorks: [
    { step: "Diagnostic Test", description: "Identify strengths and areas for improvement." },
    { step: "Customized Study Plan", description: "Focus on high-impact topics and question types." },
    { step: "Practice Sessions", description: "Timed drills with real exam papers." },
    { step: "Review & Feedback", description: "Detailed analysis and strategy coaching." },
  ],
  testimonials: [
    { quote: "I increased my JAMB score by 50 points after just 6 sessions!", author: "Emeka, JAMB candidate" },
    { quote: "The exam strategies were a game-changer for my GCSEs.", author: "Sophie, GCSE student" },
  ],
  ctaLabel: "Start Exam Prep Now",
};

export default function ExamPreparation() {
  return <ServicePage slug="exam-preparation" defaults={DEFAULTS} />;
}
