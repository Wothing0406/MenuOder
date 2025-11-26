/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      // Thêm domain của backend từ environment variable (nếu có)
      ...(process.env.NEXT_PUBLIC_API_URL 
        ? (() => {
            try {
              const url = new URL(process.env.NEXT_PUBLIC_API_URL);
              return [{
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
              }];
            } catch (e) {
              // Nếu URL không hợp lệ, bỏ qua
              return [];
            }
          })()
        : [])
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Chỉ dùng standalone khi build production (cho deployment)
  // Trong development, không cần standalone
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
};

module.exports = nextConfig;
