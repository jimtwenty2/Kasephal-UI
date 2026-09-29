import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    qualities: [10, 75],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8085",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8085",
      },
      {
        protocol: "https",
        hostname: "s3-dev.detronic11.win",
      },
      {
        protocol: "https",
        hostname: "kasephal-api-dev.detronic11.win",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "png.pngtree.com",
      },
      {
        protocol: "https",
        hostname: "s3.detronic11.win",
      },
      {
        protocol: "https",
        hostname: "kasephal-api.detronic11.win",
      },
      {
        protocol: "https",
        hostname: "kasephal-api-dev.detronic11.win",
      },
    ],
  },
};

export default nextConfig;
