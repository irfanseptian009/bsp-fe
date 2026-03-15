import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Netlify deployment
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
