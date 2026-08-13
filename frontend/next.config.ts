import type { NextConfig } from "next";

// The real backend address — Next.js uses this server-side only for proxying.
// Never exposed to the browser.
const BACKEND_ORIGIN = process.env.BACKEND_API_ORIGIN || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // localhost (any port) — dev
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      // All HTTPS hosts — production / CDN
      { protocol: "https", hostname: "**" },
    ],
  },

  allowedDevOrigins: ["192.168.0.*"],

  // Proxy both the API and uploaded media files through Next.js.
  // Everything is served from the same origin (localhost:3000 in dev,
  // yourdomain.com in production). The browser never talks to port 8000.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
