import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stctutors.com";

// Fixed public pages. Blog posts and CMS-driven pages are not listed here; crawlers reach them through the links on these pages.
const PATHS = [
  "/",
  "/about",
  "/contact",
  "/careers",
  "/blog",
  "/services",
  "/services/academic-tutoring",
  "/services/adult-education",
  "/services/b2b-white-label-lms",
  "/services/career-coaching",
  "/services/digital-skills",
  "/services/exam-preparation",
  "/services/language-culture",
  "/services/music-training",
  "/services/self-development",
  "/services/soft-skill",
  "/services/tech-training",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE}${path === "/" ? "" : path}`, changeFrequency: path === "/" ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.7 }));
}
