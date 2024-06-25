

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	// experimental: {
	//   appDir: true,
	// },
	reactStrictMode: false,
	swcMinify: false,
	images: {
		  domains: [
			  "picsum.photos",
			  "pal-tribe.s3.ap-south-1.amazonaws.com",
			  "dev.storage.hipal.life",
			  "storage.hipal.life",
			  "images.unsplash.com",
		  ],
		  // formats: ['image/avif', 'image/webp'],
		  minimumCacheTTL: 31536000,
		  // unoptimized: true,
	  },
	async redirects() {
	  return [
		{
		  source: '/n/:businessId',
		  destination: '/r/:businessId/explore',
		  permanent: true,
		},
	  ];
	},
	async headers() {
	  return [
		{
		  source: '/:all*(svg|jpg|png|ico|webp|woff|woff2|ttf|otf|eot|map|txt|xml)',
		  locale: false,
		  headers: [
			{
			  key: 'Cache-Control',
			  value: 'public, max-age=31536000, immutable',
			},
		  ],
		},
	  ];
	},
  };
  
  export default nextConfig