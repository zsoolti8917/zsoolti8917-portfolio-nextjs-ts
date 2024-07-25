import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'sk', 'hu'], // Add your supported locales here
    defaultLocale: 'en'
  }
};

export default withNextIntl(nextConfig);