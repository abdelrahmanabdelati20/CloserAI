/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./prisma/seed-data.sqlite"],
    },
  },
};

module.exports = nextConfig;
