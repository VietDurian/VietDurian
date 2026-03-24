/** @type {import('next').NextConfig} */
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../back-end/.env"),
});

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "picsum.photos",
      "encrypted-tbn0.gstatic.com",
      "gstatic.com",
      "imgur.com",
      "unsplash.com",
      "pexels.com",
      "i.imgur.com",
      "images.unsplash.com",
      "images.pexels.com",
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Expose variables to Next.js app
  env: {
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL,
  },
};

export default nextConfig;
