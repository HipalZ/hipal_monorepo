const nextConfig = {
	experimental: {
	  appDir: true,
	},
	reactStrictMode: true,
	swcMinify: true,
	images: {
		  // Keep a single output format to avoid duplicate transformations for
		  // the same source, width, and quality.
		  formats: ["image/webp"],
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
	async rewrites() {
	  return [
		{
		  source: '/',
		  destination: '/index.html',
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
