import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/database', '@repo/ui', '@repo/supabase'],
};

export default nextConfig;
