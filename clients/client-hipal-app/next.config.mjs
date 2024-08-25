/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  cacheMaxMemorySize: 0,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "pal-tribe.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "dev.storage.hipal.life",
      },
      {
        protocol: "https",
        hostname: "storage.hipal.life",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
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
        source: "/:all*(svg|jpg|png|webp|woff|woff2|ttf|otf|eot|map|txt|xml)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/:all",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
