/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: false,
  cacheMaxMemorySize: 0, // need to remove this resolve memory leaks.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 1. LIMIT SIZES: Reduces "Transformations" cost
    deviceSizes: [360, 390, 414, 828],

    // 2. FORCE LONG CACHE: Reduces "Cache Writes" & "Transformations"
    // This overrides the 3600s default and forces 1 year (31536000 seconds)
    minimumCacheTTL: 31536000,

    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "assets.hipalz.com" },
      { protocol: "https", hostname: "pal-tribe.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "dev.storage.hipal.life" },
      { protocol: "https", hostname: "storage.hipal.life" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "t-static.blr1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      {
        protocol: "https",
        hostname: "20palnesto-storage24.s3.ap-south-1.amazonaws.com",
      },
      { protocol: "https", hostname: "d3d6xjnqepzgsw.cloudfront.net" },
      { protocol: "https", hostname: "dineinpetweb.gumlet.io" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/n/:businessId",
        destination: "/:businessId/explore",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source:
          "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|js|css|woff|woff2|ttf|otf|eot|map|txt|xml|mp4|webm|mov)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/manifest.json",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
