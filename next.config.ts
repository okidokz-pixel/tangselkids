import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",        value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://lh3.googleusercontent.com https://images.unsplash.com https://flagcdn.com https://img.youtube.com",
      "connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://www.google-analytics.com https://region1.google-analytics.com",
      "frame-src https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Canonical host: send the Vercel deployment domain to tangselkids.com so
      // the site isn't a public, separately-indexed/tracked duplicate. Targets
      // the exact production alias, so localhost + preview deploys are untouched.
      {
        source: "/:path*",
        has: [{ type: "host", value: "bintarokids.vercel.app" }],
        destination: "https://tangselkids.com/:path*",
        permanent: true,
      },
      {
        source: "/place/kb-tk-islam-ibnu-rusyd-preschool-bsd-city",
        destination: "/place/kb-tk-tarbiyah-quraniyah-preschool-bsd",
        permanent: true,
      },
      {
        source: "/place/kb-tk-islam-ibnu-rusyd-tk-bsd-city",
        destination: "/place/kb-tk-tarbiyah-quraniyah-tk-bsd",
        permanent: true,
      },
    ];
  },
  images: {
    // Serve AVIF first, then WebP, then fall back to the original format.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Covers this project's Supabase host (szyujzbnfkkqwoeuyjwg.supabase.co)
        // and any other *.supabase.co bucket. Only public Storage objects are
        // routed through optimization — that's the egress we're cutting.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0,   // Disable router cache for navigated routes (fixes back-navigation stale state)
      static: 30,   // Minimum allowed for prefetched static routes
    },
  },
};

export default nextConfig;
