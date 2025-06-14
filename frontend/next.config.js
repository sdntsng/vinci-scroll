/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use environment variable for port, fallback to 3004
  env: {
    PORT: process.env.FRONTEND_PORT || process.env.PORT || '3004',
  },
  
  // Enable experimental features for better performance
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Configure domains for images if needed
  images: {
    domains: [
      'storage.googleapis.com',
      'commondatastorage.googleapis.com',
    ],
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 