import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép tất cả hostname - vì user có thể nhập URL ảnh từ bất kỳ nguồn nào
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Wildcard - cho phép tất cả HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Wildcard - cho phép tất cả HTTP
      },
    ],
  },
};

export default nextConfig;
