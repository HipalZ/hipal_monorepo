/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  cacheMaxMemorySize: 0,
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "picsum.photos",
      "pal-tribe.s3.ap-south-1.amazonaws.com",
      "dev.storage.hipal.life",
      "storage.hipal.life",
      "images.unsplash.com",
      "example.com",
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
        source:
          "/:all*(svg|jpg|png|ico|webp|woff|woff2|ttf|otf|eot|map|txt|xml)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // Cache for 1 day instead of 1 year
          },
        ],
      },
      {
        source: "/:all",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate", // No cache for API responses
          },
        ],
      },
    ];
  },
};

export default nextConfig;
