import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Pin Turbopack workspace root to the actual project directory.
  // Uses process.cwd() (evaluated at runtime when `npm run dev` runs)
  // which always points to C:\Users\User\Desktop\Bookmyinfluencers.
  turbopack: {
    root: process.cwd(),
  },

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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
