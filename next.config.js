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
        // Widget.js: cache briefly (5 min) so updates propagate fast
        source: "/widget.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
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
