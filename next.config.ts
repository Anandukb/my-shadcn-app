/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // already used in your Hero
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com", // <-- add this one
      },
    ],
  },
};

module.exports = nextConfig;
