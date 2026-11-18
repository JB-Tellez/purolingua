import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  experimental: {
    // Two root layouts ((home), [lang]) leave no app/layout.tsx for the 404;
    // src/app/global-not-found.tsx renders it as a full document instead.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
