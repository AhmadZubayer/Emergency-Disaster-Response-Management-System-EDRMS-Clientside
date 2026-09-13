import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:3000';
    return [
      {
        source: '/auth/:path*',
        destination: `${backend}/api/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
      {
        source: '/user-files/:path*',
        destination: `${backend}/user-files/:path*`,
      },
    ];
  },
};

export default nextConfig;