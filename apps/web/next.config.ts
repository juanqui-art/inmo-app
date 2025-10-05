import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/database', '@repo/ui', '@repo/supabase'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
