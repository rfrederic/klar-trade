import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    reactCompiler: false,
  },
  // pdf-parse uses pdfjs-dist which has build-time issues when bundled by webpack;
  // keep it as a runtime require() from node_modules instead
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "ommtgjmabiewltpaccue.supabase.co" },
    ],
  },
};

export default nextConfig;
