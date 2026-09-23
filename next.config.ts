// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  // other config options if needed
  images: {
    // Every uploaded image (tutor headshots, blog covers, service/testimonial
    // images, etc.) is a Cloudinary URL - next/image throws and the whole
    // page crashes to its error boundary for any host not listed here.
    // Confirmed live: the homepage's featured-tutors carousel (a real
    // tutor's Cloudinary headshot) 500'd the entire homepage before this.
    // Note: next.config.js is the file Next.js actually loads (Next prefers
    // .js when both exist) - this file is silently unused, kept in sync
    // rather than deleted, out of caution.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
