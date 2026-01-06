import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Use a directory outside Dropbox for local builds to avoid sync conflicts
// Railway sets RAILWAY_ENVIRONMENT, so we use .next on Railway
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  images: {
    domains: ['images.ctfassets.net', 'videos.ctfassets.net'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Mark pg as external to prevent bundling issues
  serverExternalPackages: ['pg'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
