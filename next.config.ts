import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Netlify deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
