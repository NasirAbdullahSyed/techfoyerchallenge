import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages so Next.js can process them
  transpilePackages: ["@repo/shared"],
};

export default nextConfig;
