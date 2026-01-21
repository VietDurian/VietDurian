/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['res.cloudinary.com'],
	},
	typescript: {
		// Allow JS-only projects to build even if TS errors exist
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
