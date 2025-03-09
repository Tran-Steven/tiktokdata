/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/TikTokData",
  assetPrefix: "/TikTokData",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
