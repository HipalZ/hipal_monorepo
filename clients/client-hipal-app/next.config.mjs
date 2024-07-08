

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	// experimental: {
	//   appDir: true,
	// },
	reactStrictMode: false,
	swcMinify: false,
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	  },
	images: {
		  domains: [
			  "picsum.photos",
			  "pal-tribe.s3.ap-south-1.amazonaws.com",
			  "dev.storage.hipal.life",
			  "storage.hipal.life",
			  "images.unsplash.com",
			  "example.com"
		  ],
		  // formats: ['image/avif', 'image/webp'],
		  minimumCacheTTL: 31536000,
		  // unoptimized: true,
	  },
	async redirects() {
	  return [
		{
		  source: '/n/:businessId',
		  destination: '/:businessId/explore',
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