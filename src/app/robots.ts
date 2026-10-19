import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stctutors.com";

// Only the public marketing pages are meant to be indexed; everything behind a login (and the API) stays out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/lms-home/", "/dashboard/", "/auth/", "/api/", "/guardian-consent", "/reference/", "/egress/"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
