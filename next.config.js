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
  // Cache-busting headers: HTML pages always fresh, static assets cached forever
  async headers() {
    return [
      {
        // HTML pages: never cache in browser or CDN — always fetch fresh
        source: "/:path((?!_next/static|_next/image|favicon|logo|widget).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=0, must-revalidate, no-cache",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        // Static assets (JS, CSS with content hash): cache forever (immutable)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Images in /public: cache for 1 day with revalidation
        source: "/:path*.(png|jpg|jpeg|svg|webp|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
      {
        // Widget.js: 60s cache + stale-while-revalidate so updates reach
        // clients' website visitors within 60 seconds of deployment.
        // This is the KEY to making improvements propagate to clients fast.
        source: "/widget.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, must-revalidate, stale-while-revalidate=300",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "X-Widget-Version",
            value: "3.2.0",
          },
        ],
      },
      {
        // API endpoints that clients/widgets call frequently
        source: "/api/widget/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=30, must-revalidate",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
