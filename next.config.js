/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // For GitHub Pages subdirectory deployment
  basePath: '/ai-resume-writer',
  assetPrefix: '/ai-resume-writer/',
}

module.exports = nextConfig
