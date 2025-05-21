import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // for images from external sources
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
