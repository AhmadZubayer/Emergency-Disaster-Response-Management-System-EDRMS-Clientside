import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
      {
        source: '/user-files/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/user-files/:path*`,
      },

    ];
  },
};

export default nextConfig;
