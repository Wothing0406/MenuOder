/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Advanced performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Enable turbo for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Bundle optimization and code splitting
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },

  // Tối ưu hóa output cho production
  // Lưu ý: Vercel không cần 'standalone' mode, nó tự động optimize
  // Chỉ dùng standalone cho các platform khác như Render, Railway
  ...(process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' ? {
    output: 'standalone',
  } : {}),

  // Tối ưu hóa bundle size với advanced settings
  swcMinify: true,
  compress: true,

  // Advanced image optimization
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024],
    // Enable aggressive optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Cache optimization
    minimumCacheTTL: 86400, // 24 hours
  },

  // Advanced webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Performance optimizations
    if (!dev && !isServer) {
      // Enable webpack bundle analyzer in production (optional)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
          })
        );
      }

      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              chunks: 'all',
            },
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@headlessui|framer-motion|react-hot-toast)[\\/]/,
              name: 'ui',
              priority: 20,
              chunks: 'all',
            },
          },
        },
        // Enable webpack optimizations
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
    }

    // Development optimizations
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

    // Add custom loaders for performance
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // Disable source maps in production để giảm kích thước
  productionBrowserSourceMaps: false,

  // Enable gzip compression
  compress: true,

  // Power optimizations
  poweredByHeader: false,
};

module.exports = nextConfig;
