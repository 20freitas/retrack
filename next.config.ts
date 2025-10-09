import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["labmzbyqduzjsshyrefn.supabase.co"],
  },
  // Disable ESLint and TypeScript build errors during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
