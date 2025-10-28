import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build for now
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during build for now
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
