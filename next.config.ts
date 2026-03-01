import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
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

export default withNextIntl(nextConfig);
