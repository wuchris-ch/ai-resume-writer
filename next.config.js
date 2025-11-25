/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only use basePath in production (GitHub Pages)
  basePath: isProd ? '/ai-resume-writer' : '',
  assetPrefix: isProd ? '/ai-resume-writer/' : '',
}

module.exports = nextConfig
