/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Tối ưu hóa output cho production
  // Lưu ý: Vercel không cần 'standalone' mode, nó tự động optimize
  // Chỉ dùng standalone cho các platform khác như Render, Railway
  ...(process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' ? { 
    output: 'standalone',
  } : {}),
  
  // Tối ưu hóa bundle size (Vercel tự động làm, nhưng giữ lại để tương thích)
  swcMinify: true,
  compress: true,

  // Tối ưu hóa images
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
    // Bật image optimization để giảm kích thước
    // Nếu Render không hỗ trợ Next.js Image Optimization, set unoptimized: true
    unoptimized: false,
    // Giới hạn kích thước và format
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Tối ưu hóa webpack
  webpack: (config, { isServer }) => {
    // Giảm kích thước bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },

  // Tắt source maps trong production để giảm kích thước
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
