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
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

module.exports = nextConfig;
