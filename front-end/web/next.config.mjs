/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "out",
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
    unoptimized: true, // Allow all external images without optimization
  },
  typescript: {
    // Allow JS-only projects to build even if TS errors exist
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
