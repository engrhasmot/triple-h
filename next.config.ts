import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "lodash",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async redirects() {
    return [
      {
        source: "/track",
        destination: "/track-plan",
        permanent: true,
      },
      {
        source: "/tracking",
        destination: "/track-plan",
        permanent: true,
      },
      {
        source: "/plans",
        destination: "/track-plan",
        permanent: true,
      },
      {
        source: "/payment",
        destination: "/pay",
        permanent: true,
      },
      {
        source: "/payments",
        destination: "/pay",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
