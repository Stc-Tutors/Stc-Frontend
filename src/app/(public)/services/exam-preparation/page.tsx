"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/Exam2.jpg",
  heroHeading: "Exam Preparation",
  heroSubtitle: "Focused Training to Ace Your Exams",
  overview:
    "Our Exam Preparation service offers specialized coaching for major exams—WAEC, JAMB, NECO, GCSE, SAT, and ACT. We use past papers, timed drills, and expert strategies to build confidence and improve scores.\n\nWith targeted practice and personalized feedback, students consistently achieve top grades and secure admissions.",
  keyFeatures: [
    { icon: "📝", title: "Past Paper Drills", description: "" },
    { icon: "⏱️", title: "Timed Practice", description: "" },
    { icon: "📊", title: "Performance Analytics", description: "" },
    { icon: "🎯", title: "Strategy Workshops", description: "" },
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
  return <ServicePageBody slug="exam-preparation" defaults={DEFAULTS} />;
}
