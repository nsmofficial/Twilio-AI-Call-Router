import type {NextConfig} from 'next';

const ngrokHost = process.env.NGROK_HOST;
const allowedDevOrigins = ngrokHost ? [`https://${ngrokHost}`] : [];

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins,
};

export default nextConfig;
