/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      // Thêm domain của Render backend khi deploy
      ...(process.env.NEXT_PUBLIC_API_URL 
        ? [new URL(process.env.NEXT_PUBLIC_API_URL).hostname]
        : [])
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Đảm bảo Next.js chạy tốt trên Render
  output: 'standalone',
};

module.exports = nextConfig;
