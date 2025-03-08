/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",

  basePath: "/tiktok-data",


  assetPrefix: "/tiktok-data",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
