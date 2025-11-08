import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is to allow cross-origin requests in the development environment.
    // The warning is coming from the cloud workstation's preview URL.
    allowedDevOrigins: [
      'https://6000-firebase-studio-1762525722888.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
