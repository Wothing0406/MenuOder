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
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
  // Cấu hình watchOptions để tránh lỗi Watchpack trên Windows
  webpack: (config, { isServer, dev }) => {
    // Chỉ cấu hình cho development mode
    if (dev) {
      // Suppress Watchpack errors by improving watchOptions
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          // Ignore common directories
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**',
          // Ignore Windows system files và directories (multiple patterns)
          '**/System Volume Information/**',
          '**/System Repair/**',
          '**/hiberfil.sys',
          '**/pagefile.sys',
          '**/swapfile.sys',
          '**/DumpStack.log.tmp',
          // Ignore root drive system files (Windows) - absolute paths
          'C:\\System Volume Information',
          'C:\\System Repair',
          'C:\\hiberfil.sys',
          'C:\\pagefile.sys',
          'C:\\swapfile.sys',
          'C:\\DumpStack.log.tmp',
          // Also try with forward slashes
          'C:/System Volume Information',
          'C:/System Repair',
          'C:/hiberfil.sys',
          'C:/pagefile.sys',
          'C:/swapfile.sys',
          'C:/DumpStack.log.tmp',
        ],
        aggregateTimeout: 300,
        poll: false,
        followSymlinks: false, // Don't follow symlinks to avoid system files
      };
      
      // Configure infrastructure logging to filter Watchpack warnings
      config.infrastructureLogging = {
        level: 'error', // Only show errors, not warnings
        debug: false,
      };
    }
    return config;
  },

  // Tắt source maps trong production để giảm kích thước
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
