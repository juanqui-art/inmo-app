import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/database", "@repo/ui", "@repo/supabase"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: "5mb", // Reducido de 10mb gracias a compresión client-side
  },
};

export default nextConfig;
