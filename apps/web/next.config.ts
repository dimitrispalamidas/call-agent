import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@call-agent/db"],
  serverExternalPackages: ["pdf-parse", "twilio"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
