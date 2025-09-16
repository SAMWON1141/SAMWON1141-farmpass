"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";
import { features, steps } from "./home-data";
import { useSystemSettingsQuery } from "@/lib/hooks/query/use-system-settings-query";
import dynamic from "next/dynamic";

// 무거운 컴포넌트들을 동적 import로 최적화
const Logo = dynamic(
  () =>
    import("@/components/common/logo").then((mod) => ({ default: mod.Logo })),
  {
    ssr: false,
    loading: () => <div className="w-32 h-32 bg-muted animate-pulse rounded" />,
  }
);

const PageLoading = dynamic(
  () =>
    import("@/components/ui/loading").then((mod) => ({
      default: mod.PageLoading,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-farm">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 animate-pulse rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">로딩 중...</p>
        </div>
      </div>
    ),
  }
);

// 클라이언트 컴포넌트로 변경
export default function HomePage() {
  // 시스템 설정값을 동적으로 가져오기
  const { data: settings, isLoading } = useSystemSettingsQuery();

  // 기본값과 동적 설정값을 결합
  const displaySettings = {
    siteName: settings?.siteName || "농장 출입 관리 시스템(FarmPass)",
    siteDescription:
      settings?.siteDescription ||
      "방역은 출입자 관리부터 시작됩니다. QR기록으로 축산 질병 예방의 첫걸음을 함께하세요.",
    logo: settings?.logo || "/logo.svg",
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return (
      <PageLoading
        text="로딩중 잠시만 기다려주세요..."
        variant="lottie"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-farm">
      {/* 헤더 섹션 */}
      <header className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-6 flex justify-center">
              <Logo size="xxl" settings={settings} />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {displaySettings.siteName}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {displaySettings.siteDescription}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href="/auth/register">
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[160px]"
              >
                <Link href="/auth/login">관리자 로그인</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 기능 소개 섹션 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              주요 기능
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              농장 출입 관리의 모든 것
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              QR 코드 기반 방문자 등록부터 실시간 알림까지, 농장 방역과 보안을
              위한 완벽한 솔루션
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full border-none bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 섹션 */}
      <section className="bg-accent py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              간편한 사용법
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              3단계로 시작하는 방문자 관리
            </h2>
            <p className="mx-auto max-w-2xl text-foreground/80">
              복잡한 설정 없이 빠르게 시작하고 효율적으로 관리하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative animate-fade-in-left"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-0.5 w-full translate-x-1/2 bg-border md:block"></div>
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="mb-2 text-xl font-semibold">{step.title}</div>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-none bg-gradient-to-r from-primary/90 to-primary shadow-soft-lg">
            <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-12">
              <div className="text-center md:text-left">
                <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                  지금 바로 시작하세요
                </h2>
                <p className="text-primary-foreground/80">
                  무료로 시작하고 농장 출입 관리를 현대화하세요
                </p>
              </div>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="min-w-[160px]"
              >
                <Link href="/auth/register">
                  무료로 시작하기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
