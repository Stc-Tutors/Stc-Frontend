import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stctutors.com";

// Public marketing pages are crawlable; every signed-in area is not (it would only show the login page anyway).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/lms-home/", "/dashboard/", "/auth/", "/api/", "/guardian-consent", "/reference/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
