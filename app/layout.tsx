import type React from "react";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastPositionProvider } from "@/components/providers/toast-position-provider";
import { DebugProvider } from "@/components/providers/debug-provider";
import { SystemMonitor } from "@/components/common/system-monitor";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";

import { PWAProvider } from "@/components/providers/pwa-provider";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // system_settings에서 설정값 가져오기
  let siteName = "농장 출입 관리 시스템(FarmPass)";
  let siteDescription =
    "방역은 출입자 관리부터 시작됩니다. QR기록으로 축산 질병 예방의 첫걸음을 함께하세요.";
  let favicon = "/favicon.ico";

  try {
    // 서버 사이드에서 직접 데이터베이스 조회
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.system_settings.findFirst();

    if (settings) {
      siteName = settings.siteName || siteName;
      siteDescription = settings.siteDescription || siteDescription;
      favicon = settings.favicon || favicon;
    }
  } catch (error) {
    // 데이터베이스 조회 실패 시 환경변수 기본값 사용
    console.warn("Failed to load system settings for metadata:", error);
  }

  // 파일 확장자에 따라 MIME 타입 결정 (파비콘은 ICO, PNG만 지원)
  const getMimeType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "ico":
        return "image/x-icon";
      case "png":
        return "image/png";
      default:
        return "image/png"; // 기본값
    }
  };

  const mimeType = getMimeType(favicon);

  return {
    applicationName: siteName,
    title: {
      default: siteName,
      template: `%s - ${siteName}`,
    },
    description: siteDescription,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      siteName: siteName,
      title: {
        default: siteName,
        template: `%s - ${siteName}`,
      },
      description: siteDescription,
    },
    icons: {
      icon: [
        { url: favicon, sizes: "32x32", type: mimeType },
        { url: favicon, sizes: "16x16", type: mimeType },
      ],
      shortcut: favicon,
      apple: favicon,
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": siteName,
      "application-name": siteName,
      "msapplication-TileColor": "#10b981",
      "msapplication-config": "none",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-180x180.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/icon-167x167.png" sizes="167x167" />
        <link rel="apple-touch-icon" href="/icon-152x152.png" sizes="152x152" />
        <link rel="apple-touch-icon" href="/icon-120x120.png" sizes="120x120" />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background flex flex-col overflow-x-hidden"
        )}
      >
        <ErrorBoundary
          title={ERROR_CONFIGS.GENERAL.title}
          description={ERROR_CONFIGS.GENERAL.description}
        >
          <QueryProvider>
            <PWAProvider>
              <DebugProvider>
                <ToastPositionProvider>
                  {/* === 상단 실시간 알림 Bell === */}
                  {children}
                  <Footer />
                  {/* === 공통 푸터 끝 === */}
                  <Toaster />
                  <SystemMonitor />
                </ToastPositionProvider>
              </DebugProvider>
            </PWAProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
