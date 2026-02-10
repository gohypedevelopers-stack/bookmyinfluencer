import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.example.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
} as any;

export default nextConfig;
