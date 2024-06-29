/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
      locales: ['en'],  // Add other languages if needed
      defaultLocale: 'en',
      localeDetection: false,  // Disable automatic locale detection
    },
  }
  
  module.exports = nextConfig