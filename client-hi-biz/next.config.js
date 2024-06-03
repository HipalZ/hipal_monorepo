/** @type {import('next').NextConfig} */
const packageJson = require("./package.json");
const dependencies = Object.keys(packageJson.dependencies || {});
const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  sw: "sw.js",
});

const nextConfig = withPWA({
  runtimeCaching,
  buildExcludes: [/manifest\.json$/],
  experimental: {
    largePageDataBytes: 128 * 100000,
  },
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 3600,
  images: {
    domains: ["pal-tribe.s3.ap-south-1.amazonaws.com", "storage.hipal.life","dev.storage.hipal.life"],
    // formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    // unoptimized: true,
  },
  transpilePackages: [...Object.keys(dependencies)],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
      {
        source: "/api/:path*",
        destination: "/api/coupon",
      },
    ];
  },
  async headers() {
    return [
      {
        source:
          "/:all*(svg|jpg|png|ico|webp|webmanifest|woff|woff2|ttf|otf|eot|map|txt|xml)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
});

module.exports = nextConfig;
