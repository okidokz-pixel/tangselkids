import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
