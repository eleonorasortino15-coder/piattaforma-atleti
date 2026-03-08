import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "images.clerk.dev" },
    ],
  },
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
