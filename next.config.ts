/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/tiktokdata",
  assetPrefix: "/tiktokdata",
  images: {
    unoptimized: true,
  },
};


module.exports = nextConfig;
