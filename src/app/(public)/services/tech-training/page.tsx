"use client";

import ServicePage from "@/components/service-page";
import { ServiceContent } from "@/types/content";

// Note: the original page also had a "Tech Skills They Can Learn" section (10
// detailed skill entries) that doesn't fit this shared template's shape - it
// was dropped rather than shoehorned in. Add a dedicated Skills list type
// later if that section needs to come back.
const DEFAULTS: ServiceContent = {
  heroImageUrl: "/image/tech kids.png",
  heroHeading: "Tech Training for Kids",
  heroSubtitle: "Future-ready tech skills for kids, one virtual lesson at a time.",
  overview:
    "In a world driven by technology, introducing children to tech skills early sparks creativity, confidence, and problem-solving abilities. Our virtual Tech Training program lets kids explore coding, app development, UI/UX design, video editing, and more—all from the safety of home.\n\nSTC Tutors' engaging curriculum nurtures critical thinking and prepares young learners for tomorrow's digital challenges.",
  videoUrl: null,
  keyFeatures: [
    { icon: "💻", title: "Live Coding Sessions" },
    { icon: "🎨", title: "Creative Projects" },
    { icon: "📝", title: "Hands-on Assignments" },
    { icon: "📊", title: "Progress Reports" },
  ],
  whoFor: [
    "Kids curious about coding, app development, design, or video editing",
    "Parents looking for a safe, engaging virtual tech program for their child",
  ],
  benefits: [],
  howItWorks: [
    { step: "Enroll & Skill Assessment", description: "Quick quiz to gauge current level and interests." },
    { step: "Choose Your Tech Path", description: "Select from coding, design, robotics, and more." },
    { step: "Schedule Virtual Labs", description: "Book interactive sessions with experienced tech tutors." },
    { step: "Create & Showcase", description: "Build projects, share with peers, and earn digital badges." },
  ],
  testimonials: [
    { quote: "My daughter built her first game in a month—she's so proud!", author: "Mrs. Adebanjo, parent" },
    { quote: "I love coding with STC Tutors—it's fun and I learn new things every class.", author: "Tunde, age 12" },
  ],
  ctaLabel: "Start Tech Training Now",
};

export default function TechTraining() {
  return <ServicePage slug="tech-training" serviceType="tech-bootcamp" defaults={DEFAULTS} />;
}
