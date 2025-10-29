/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using explicit locale-prefixed routes (app/en, app/fa) and middleware-based redirect.
  // Built-in Next.js i18n is disabled to avoid conflicts during static prerender/export.
};

module.exports = nextConfig;
