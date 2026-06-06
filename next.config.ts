import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    remotePatterns: [
      {
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
