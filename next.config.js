const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": [
        "./prisma/seed-data.sqlite",
        "./node_modules/.prisma/client/**",
        "./node_modules/@prisma/engines/**",
      ],
    },
  },
};

module.exports = nextConfig;
