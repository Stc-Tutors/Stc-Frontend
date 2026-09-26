// next.config.js
/** @type {import('next').NextConfig} */

// Origin of the stcbe API (NEXT_PUBLIC_API_URL is ".../api") - the browser
// talks to it directly for Socket.IO and the CSP report endpoint.
function apiOrigins() {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_API_URL || "");
    const ws = `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
    return { http: u.origin, ws, reportUri: `${u.origin}/api/csp-report` };
  } catch {
    return { http: "", ws: "", reportUri: "" };
  }
}

// CANDIDATE Content-Security-Policy, shipped as Report-Only: the browser
// logs what it WOULD block (to stcbe's /api/csp-report) but blocks nothing,
// so nothing can break. Once the reports are clean for a while, switch the
// header name below from Content-Security-Policy-Report-Only to
// Content-Security-Policy to enforce it.
//
// It is a host allowlist, not a nonce policy: script-src still needs
// 'unsafe-inline' for Next's own hydration scripts, because a nonce would
// force every page (including the static marketing pages) to render
// dynamically. What it does enforce once switched on: no scripts from any
// unlisted host, no framing by other sites, no <object>/<base> tricks, forms
// only post to this origin. Hosts below are the ones the app really uses:
// Cloudinary (images, uploads), Paystack (checkout script + popup), Google
// Drive/Docs/Meet and YouTube (embedded resources, recordings, live class).
// Optional: set NEXT_PUBLIC_LIVEKIT_URL (e.g. wss://live.example.com) when
// LiveKit is self-hosted so its host is allowed; returns "" otherwise.
function livekitHost(scheme) {
  const raw = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!raw) return "";
  try {
    return `${scheme}://${new URL(raw).host}`;
  } catch {
    return "";
  }
}

function contentSecurityPolicy() {
  const api = apiOrigins();
  const directives = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://js.paystack.co"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://res.cloudinary.com",
      "https://img.youtube.com",
      "https://drive.google.com",
      "https://*.googleusercontent.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      api.http,
      api.ws,
      "https://api.paystack.co",
      "https://checkout.paystack.com",
      "https://api.cloudinary.com",
      // The in-app classroom connects straight to LiveKit (signalling over wss,
      // some fallbacks over https). LiveKit Cloud projects live under
      // livekit.cloud; a self-hosted server's host comes from the env var.
      "wss://*.livekit.cloud",
      "https://*.livekit.cloud",
      livekitHost("wss"),
      livekitHost("https"),
    ].filter(Boolean),
    "frame-src": [
      "https://checkout.paystack.com",
      "https://js.paystack.co",
      "https://drive.google.com",
      "https://docs.google.com",
      "https://meet.google.com",
      "https://www.youtube.com",
    ],
    "media-src": ["'self'", "https:", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };
  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
  return api.reportUri ? `${policy}; report-uri ${api.reportUri}` : policy;
}

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
  // Baseline security headers that cannot break a page: nothing relies on
  // being framed by someone else or sending a referrer's full query string
  // cross-origin (verify-email/reset-password links carry a token).
  // camera/microphone are allowed for this origin ONLY - the in-app live
  // classroom (LiveKit) captures them; disabling them here would make every
  // in-app class fail before the browser even asks. geolocation stays off.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy() },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
