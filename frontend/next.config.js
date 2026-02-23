/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["assets.coingecko.com", "mintcdn.com"],
  },
};

module.exports = nextConfig;
