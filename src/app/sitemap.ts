import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stctutors.com";

const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/services/academic-tutoring", priority: 0.8 },
  { path: "/services/exam-preparation", priority: 0.8 },
  { path: "/services/tech-training", priority: 0.8 },
  { path: "/services/digital-skills", priority: 0.7 },
  { path: "/services/language-culture", priority: 0.7 },
  { path: "/services/music-training", priority: 0.7 },
  { path: "/services/adult-education", priority: 0.7 },
  { path: "/services/career-coaching", priority: 0.7 },
  { path: "/services/self-development", priority: 0.7 },
  { path: "/services/soft-skill", priority: 0.7 },
  { path: "/services/b2b-white-label-lms", priority: 0.6 },
  { path: "/about", priority: 0.6 },
  { path: "/blog", priority: 0.6 },
  { path: "/careers", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/downloads", priority: 0.4 },
  { path: "/terms", priority: 0.2 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, lastModified, priority }));
}
