import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:3000';
    return [
      {
        source: '/auth/:path*',
        destination: `${backend}/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backend}/:path*`,
      },
      {
        source: '/user-files/:path*',
        destination: `${backend}/user-files/:path*`,
      },
    ];
  },
};

export default nextConfig;