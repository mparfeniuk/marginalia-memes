/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Allow local images without optimization
  },
  webpack: (config, { isServer }) => {
    // Вирішуємо проблеми з Fabric.js в Next.js 15
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
