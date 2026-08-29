import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { execSync } from 'node:child_process';

const withNextIntl = createNextIntlPlugin();
const withAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/**
 * The short commit the terminal's status bar prints. Netlify sets COMMIT_REF
 * and ships no .git directory, so the git call is the local-dev path only —
 * and it is wrapped because a tarball checkout has neither.
 */
const commit = () => {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
};

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
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_COMMIT: commit()
  }
};

export default withAnalyzer(withNextIntl(nextConfig));
