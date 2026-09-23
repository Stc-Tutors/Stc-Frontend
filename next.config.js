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
  // A conservative, low-risk slice of security headers - the ones that
  // cannot break an existing page since nothing here relies on being framed
  // by someone else, sending a referrer's full query string cross-origin
  // (verify-email/reset-password links carry a token in the query string),
  // or using the camera/mic/geolocation APIs (grepped for
  // getUserMedia/mediaDevices/geolocation - none exist; video is either an
  // external Meet/YouTube redirect or Drive-hosted playback, never in-page
  // capture). Deliberately does NOT include a Content-Security-Policy here -
  // this app embeds Drive/Docs/Meet/YouTube iframes and loads Paystack's
  // inline checkout script, and getting a strict CSP's script-src/frame-src
  // right (especially around Next's own inline hydration scripts, which need
  // a nonce wired through proxy.ts to allow safely) needs to be verified live
  // against a real deploy before it's turned on, not shipped blind - a wrong
  // CSP doesn't break one feature, it can break every page for every user.
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
