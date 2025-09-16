import { withSentryConfig } from "@sentry/nextjs";
import { execSync } from "child_process";
import withSerwistInit from "@serwist/next";

/**
 * 🚀 Next.js 설정 파일
 *
 * 이 파일은 Next.js 애플리케이션의 빌드, 배포, 성능 최적화를 위한 설정을 포함합니다.
 * 보안, 성능 최적화가 모두 포함되어 있습니다.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseDomain = supabaseUrl
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

// Git 커밋 해시를 사용한 캐시 버전 관리
const revision = (() => {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" })
      .trim()
      .slice(0, 7);
  } catch (error) {
    // Vercel 환경 등에서 git이 없을 경우 현재 시간을 사용
    return Date.now().toString(36);
  }
})();

// Serwist PWA 설정
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  register: true,
  disable: false, // 개발 환경에서 비활성화 여부
  swUrl: "/sw.js", // 서비스 워커 URL
  scope: "/",
  reloadOnOnline: true, // 온라인 복구 시 페이지 새로고침
  cacheOnNavigation: true, // 네비게이션 시 캐싱 활성화
  // 추가 프리캐시 엔트리
  additionalPrecacheEntries: [
    // 핵심 페이지들
    { url: "/", revision },
    { url: "/offline", revision },
    { url: "/maintenance", revision },

    // SEO 및 기본 파일들
    { url: "/manifest.json", revision },
    { url: "/favicon.ico", revision },
    { url: "/favicon.png", revision },

    // 로고 파일들
    { url: "/logo.svg", revision },
    { url: "/logo.png", revision },
    { url: "/logo1.svg", revision },
    { url: "/logo1.png", revision },

    // PWA 아이콘들
    { url: "/icon-72x72.png", revision },
    { url: "/icon-57x57.png", revision },
    { url: "/icon-96x96.png", revision },
    { url: "/icon-120x120.png", revision },
    { url: "/icon-144x144.png", revision },
    { url: "/icon-152x152.png", revision },
    { url: "/icon-167x167.png", revision },
    { url: "/icon-180x180.png", revision },
    { url: "/icon-192x192.png", revision },
    { url: "/icon-384x384.png", revision },
    { url: "/icon-512x512.png", revision },
    { url: "/icon-1024x1024.png", revision },

    // 소셜 로그인 버튼들
    { url: "/btn_kakao.svg", revision },
    { url: "/btn_google.svg", revision },
    { url: "/btn_kakao_ch.svg", revision },
    { url: "/btn_blog.svg", revision },
    { url: "/btn_homepage.svg", revision },
    { url: "/btn_mail.svg", revision },

    // Lottie 애니메이션 파일들 (JSON) - 실제 파일명으로 수정
    { url: "/lottie/success.json", revision },
    { url: "/lottie/error.json", revision },
    { url: "/lottie/warning.json", revision },
    { url: "/lottie/info.json", revision },
    { url: "/lottie/timeout.json", revision },
    { url: "/lottie/no_connection.json", revision },
    { url: "/lottie/404.json", revision },
    { url: "/lottie/cat_loading.json", revision },

    // 문서 파일들 (오프라인 접근용) - 실제 파일명으로 수정
    { url: "/docs/user-manual.html", revision },
    { url: "/docs/pwa-guide.html", revision },
    { url: "/docs/product-overview.html", revision },
    { url: "/docs/quick-start.html", revision },
    { url: "/docs/faq.html", revision },
  ],

  // 최대 캐시 파일 크기 (10MB)
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 빌드 성능 최적화
  productionBrowserSourceMaps: false, // 프로덕션 환경에서 소스맵 비활성화
  swcMinify: true, // SWC 압축 활성화 (더 빠른 압축)

  experimental: {
    /**
     * 🛡️ Server Actions 보안 설정
     *
     * Server Actions는 클라이언트에서 서버 함수를 직접 호출할 수 있게 해주는 기능입니다.
     * CSRF(Cross-Site Request Forgery) 공격을 방지하기 위해 허용된 도메인만 설정합니다.
     *
     * ⚠️ 커스텀 도메인 구매 시 반드시 추가해야 합니다!
     * 예시: farm-management.kr, myfarm.com 등
     *
     * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
     */
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // 로컬 개발 환경
        "*.vercel.app", // Vercel 배포 환경
        "www.samwon1141.com", // FarmPass 프로덕션 도메인
        "samwon1141.com", // FarmPass 도메인 (www 없이)
      ],
    },
    // 개발 환경에서 더 적극적인 최적화
    optimizeCss: true,
    optimizeServerReact: true,
    // CSS 최적화 강화
    cssChunking: "strict",
    // 빌드 성능 최적화 - 번들 크기 최적화를 위한 패키지 최적화
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@tanstack/react-query",
    ],
  },

  reactStrictMode: false,

  /**
   * 🖼️ 이미지 최적화 설정
   *
   * Next.js의 Image 컴포넌트가 외부 도메인의 이미지를 최적화할 수 있도록 허용합니다.
   * 보안상의 이유로 명시적으로 허용할 도메인을 지정해야 합니다.
   */
  images: {
    domains: [
      supabaseDomain, // Supabase Storage 도메인 (환경변수에서 추출)
    ].filter(Boolean), // 빈 값 제거
    unoptimized: false, // 이미지 최적화 활성화 (WebP 변환, 리사이징 등)
    // 이미지 처리 최적화
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  /**
   * 🔍 ESLint 설정
   *
   * 코드 품질을 보장하기 위해 빌드 시 ESLint 검사를 강제합니다.
   * 코드 스타일, 잠재적 버그, 보안 취약점을 자동으로 감지합니다.
   */
  eslint: {
    ignoreDuringBuilds: false, // 빌드 시 ESLint 오류가 있으면 빌드 실패
  },

  /**
   * 📝 TypeScript 설정
   *
   * 타입 안정성을 보장하기 위해 빌드 시 TypeScript 오류 검사를 강제합니다.
   * 런타임 오류를 컴파일 타임에 미리 방지할 수 있습니다.
   */
  typescript: {
    ignoreBuildErrors: false, // TypeScript 오류가 있으면 빌드 실패
  },

  /**
   * 📦 성능 최적화 설정
   */
  compress: true, // gzip 압축 활성화 (전송 크기 60-80% 감소)
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안 강화)
  generateEtags: true, // ETag 생성으로 브라우저 캐싱 최적화

  /**
   * 📊 번들 분석 도구 설정
   *
   * ANALYZE=true 환경변수로 빌드 시 번들 크기를 분석할 수 있습니다.
   * 사용법: ANALYZE=true npm run build
   *
   * 번들 크기 최적화를 위해 어떤 패키지가 큰 용량을 차지하는지 확인 가능합니다.
   */
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer"))({
          enabled: true,
        })
      );
      return config;
    },
  }),

  /**
   * 🚀 React Query + Prisma 최적화
   */
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // 개발 환경에서 코드 스플리팅 최적화
    if (dev) {
      // 개발 환경에서는 코드 스플리팅을 단순화하여 로딩 속도 향상
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } else {
      // 프로덕션 환경에서만 세분화된 코드 스플리팅 적용
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: "all",
          maxInitialRequests: 20,
          maxAsyncRequests: 20,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            reactQuery: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              name: "react-query",
              chunks: "all",
              priority: 20,
              reuseExistingChunk: true,
            },
            // React 라이브러리 세분화
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react",
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },
            // Radix UI 컴포넌트 세분화 최적화
            radixUI: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix-ui",
              chunks: "all",
              priority: 15,
              reuseExistingChunk: true,
            },
            // Radix UI 개별 컴포넌트 최적화
            radixUIComponents: {
              test: /[\\/]node_modules[\\/]@radix-ui\/react-(dialog|dropdown-menu|select|tabs|toast|tooltip|popover|sheet)[\\/]/,
              name: "radix-ui-components",
              chunks: "all",
              priority: 14,
              reuseExistingChunk: true,
            },
            // 차트 라이브러리 최적화
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: "charts",
              chunks: "all",
              priority: 12,
              reuseExistingChunk: true,
            },
            // 애니메이션 라이브러리 최적화
            animations: {
              test: /[\\/]node_modules[\\/](lottie-react|framer-motion)[\\/]/,
              name: "animations",
              chunks: "all",
              priority: 11,
              reuseExistingChunk: true,
            },
            // 폼 라이브러리 최적화
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              name: "forms",
              chunks: "all",
              priority: 10,
            },
            // 이미지 처리 최적화
            imageProcessing: {
              test: /[\\/]node_modules[\\/](sharp|multer|image-size)[\\/]/,
              name: "image-processing",
              chunks: "all",
              priority: 8,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

/**
 * 📤 설정 내보내기
 *
 * Next.js가 이 설정을 사용하여 애플리케이션을 빌드하고 실행합니다.
 */
const config = withSerwist(nextConfig);
export default withSentryConfig(config, {
  org: "samwon",
  project: "samwon1141-farmpass",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
