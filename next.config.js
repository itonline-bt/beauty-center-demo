/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/beauty-center-demo',
  assetPrefix: '/beauty-center-demo',
}

module.exports = nextConfig
