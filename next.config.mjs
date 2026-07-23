/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode ловит побочные эффекты ещё на этапе разработки
  reactStrictMode: true,

  // Современные форматы изображений + явные размеры уменьшают CLS и LCP
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },

  // Убираем заголовок X-Powered-By и добавляем базовые security-заголовки —
  // это тоже часть "производственной культуры", которую полезно показать в портфолио
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  experimental: {
    // Оптимизация серверных пакетов, которые не нужно бандлить на клиенте
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
