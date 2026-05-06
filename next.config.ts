import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,   // Disable router cache for navigated routes (fixes back-navigation stale state)
      static: 30,   // Minimum allowed for prefetched static routes
    },
  },
};

export default nextConfig;
