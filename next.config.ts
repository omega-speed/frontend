import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    // Add the hosts you serve images from (e.g. your S3 buckets or CDN).
    remotePatterns: [
      // { protocol: "https", hostname: "your-bucket.s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
