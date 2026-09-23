// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every uploaded image (tutor headshots, blog covers, service/testimonial
    // images, etc.) is a Cloudinary URL - next/image throws and the whole
    // page crashes to its error boundary for any host not listed here.
    // Confirmed live: the homepage's featured-tutors carousel (a real
    // tutor's Cloudinary headshot) 500'd the entire homepage before this.
    // Note: this is the file Next.js actually loads - a stale next.config.ts
    // sits alongside it (Next prefers .js when both exist) and was silently
    // never read; kept in sync here rather than deleted, out of caution.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

module.exports = nextConfig;