import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();
const withAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'sk', 'hu'], // Add your supported locales here
    defaultLocale: 'en'
  },
  env: {
    // Rendered as `.slice(0, 10)` only. Never format this with
    // toLocaleDateString() — Node's ICU and the browser's can disagree, and
    // this is the one non-deterministic value the hero renders.
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString()
  }
};

export default withAnalyzer(withNextIntl(nextConfig));
