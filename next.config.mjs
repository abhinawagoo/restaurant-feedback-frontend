/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add font optimization configuration
  optimizeFonts: true,

  // If you're using app directory
  experimental: {
    fontLoaders: [
      { loader: "@next/font/google", options: { subsets: ["latin"] } },
    ],
  },
};

export default nextConfig;
