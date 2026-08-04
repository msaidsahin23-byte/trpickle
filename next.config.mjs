/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-4b1522a337474571adb7aefec13e7526.r2.dev',
      },
    ],
  },
};

export default nextConfig;
