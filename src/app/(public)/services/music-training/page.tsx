"use client";

import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";

const DEFAULTS: ServicePageBodyContent = {
  heroImageUrl: "/image/music.jpg",
  heroHeading: "Music Training",
  heroSubtitle: "Explore Your Musical Talent With Professional Guidance",
  overview:
    "Learn to play an instrument, improve your vocals, or compose music under the guidance of experienced tutors.",
  keyFeatures: [],
  benefits: [],
  howItWorks: [],
  testimonials: [],
  ctaLabel: "Start Music Training Now",
};

export default function MusicTraining() {
  return <ServicePageBody slug="music-training" defaults={DEFAULTS} />;
}
