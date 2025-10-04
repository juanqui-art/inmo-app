import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/database', '@repo/ui'],
};

export default nextConfig;
