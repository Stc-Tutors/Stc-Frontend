"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Restructured from this page's original bespoke layout onto the shared
// ServiceContent shape. The two single-line bullet lists that didn't have a
// title+description pair ("What Makes Our Training Different" and "What
// You'll Gain") were remapped rather than dropped: differentiators became
// keyFeatures (they're short, icon-friendly), and the "gain" list was folded
// into a second overview paragraph since it reads as expository copy, not a
// scannable feature/benefit grid. Course content maps directly onto
// `courses`: one entry for the single-course list, one per bundle.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/skill-adult.png",
  heroHeading: "Digital Skills Training Program",
  heroSubtitle: "Learn the Skills That Help you Earn, Grow, and Stay Relevant in the Digital Age.",
  overview:
    "At STC Tutors, we don't just teach, we transform. Every session is 100% practical, guided by expert tutors, and designed to help you apply what you learn immediately.\n\nBy the end of your program, you'll have a professional digital portfolio, practical experience through real projects and internships, the confidence to apply for remote or freelance roles, a certificate of completion from STC Tutors and partner institutions, and lifelong access to our learning and support community.",
  videoUrl: null,
  keyFeatures: [
    { icon: "✅", title: "Learn in-demand skills that help you get freelance and remote opportunities" },
    { icon: "✅", title: "Small group virtual classes; learn from anywhere" },
    { icon: "✅", title: "Access to live mentorship and community support" },
    { icon: "✅", title: "Build real-world projects for your portfolio" },
    { icon: "✅", title: "Affordable fees with flexible installment options" },
    { icon: "✅", title: "Internship opportunities and post-training career guidance" },
  ],
  courses: [
    {
      name: "Single Courses",
      items: [
        "Copy writing and Content Creation",
        "Virtual Assistance",
        "Social Media Management",
        "Graphics Design",
        "Web Development (No-code Tools)",
        "Project Management Tools",
        "Data Analytics",
      ],
    },
    {
      name: "Freelancer Launch Pack",
      items: [
        "Build the foundation for a successful freelance career.",
        "Copywriting, Virtual Assistance & Project Management Tools.",
        "Learn how to manage clients, build your portfolio, and start earning online.",
      ],
    },
    {
      name: "Social Media Management Bundle",
      items: [
        "Master the art of creating, designing, and managing content that drives engagement and sales.",
        "Content Creation, Graphics Design, Video Editing & Social Media Management.",
        "Perfect for aspiring social media managers, brand strategists, and entrepreneurs.",
      ],
    },
    {
      name: "Digital Business Bundle",
      items: [
        "Learn how to grow and automate your business online.",
        "Social Media Strategy, Branding, and Ads Management.",
        "Ideal for business owners and digital entrepreneurs who want to scale online.",
      ],
    },
    {
      name: "Tech Essentials Pack",
      items: [
        "Build the tech foundation that keeps you ahead in the modern workforce.",
        "Web Design, Data Analytics & Digital Marketing.",
        "Perfect for professionals transitioning into tech roles.",
      ],
    },
  ],
  benefits: [],
  whoFor: [
    "Adults seeking a career switch or a new digital income stream",
    "Freelancers who want to add new, high-income skills",
    "Business owners who want to grow their online presence",
    "Students or graduates looking to build employable skills",
    "Professionals who want to stay competitive in today's digital job market",
  ],
  howItWorks: [
    { step: "Enroll & Choose Your Track", description: "Sign up and pick a single course or a course bundle that matches your goals." },
    { step: "Join Live Virtual Classes", description: "Attend small-group sessions with expert tutors and hands-on mentorship." },
    { step: "Build Real Projects", description: "Apply what you learn to real-world projects for your portfolio." },
    { step: "Graduate & Get Certified", description: "Complete your course or bundle and earn a certificate of completion." },
  ],
  testimonials: [
    { quote: "I joined STC's Copywriting class with zero experience. Two months later, I'm writing for clients and earning online", author: "Mary O." },
    { quote: "The sessions were engaging, the tutors were patient, and the community helped me stay motivated", author: "Olu A." },
  ],
  ctaLabel: "Enroll",
  secondaryCtaLabel: "Enroll Now",
};

export default function DigitalSkills() {
  return <ServicePage slug="digital-skills" defaults={DEFAULTS} />;
}
