"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { features, steps } from "./home-data";
import { DEFAULT_SYSTEM_SETTINGS } from "@/lib/constants/defaults";
import { Logo } from "@/components/common";
import { useAuth } from "@/components/providers/auth-provider";
import { PageLoading } from "@/components/ui/loading";
import { useSystemSettingsContext } from "@/components/providers/system-settings-provider";

// 클라이언트 컴포넌트로 변경
export default function HomePage() {
  const router = useRouter();
  const { state } = useAuth();
  const { settings, isLoading: settingsLoading } = useSystemSettingsContext();

  // 인증된 사용자 리다이렉트를 useEffect로 처리
  useEffect(() => {
    if (state.status === "authenticated") {
      router.replace("/admin/dashboard");
    }
  }, [state.status, router]);

  // 로딩 상태별 적절한 텍스트 표시
  if (
    state.status === "initializing" ||
    state.status === "loading" ||
    settingsLoading
  ) {
    let loadingText = "페이지를 불러오는 중...";

    if (state.status === "initializing") {
      loadingText = "시스템을 초기화하는 중...";
    } else if (state.status === "loading") {
      loadingText = "로그인 상태를 확인하는 중...";
    } else if (settingsLoading) {
      loadingText = "사이트 설정을 불러오는 중...";
    }

    return (
      <PageLoading
        text={loadingText}
        subText="잠시만 기다려주세요"
        variant="gradient"
        fullScreen={true}
      />
    );
  }

  // 인증된 사용자는 로딩 표시
  if (state.status === "authenticated") {
    return (
      <PageLoading
        text="대시보드로 이동 중..."
        subText="잠시만 기다려주세요"
        variant="gradient"
        fullScreen={true}
      />
    );
  }

  // 시스템 설정 사용
  const displaySettings = {
    siteName: settings?.siteName || DEFAULT_SYSTEM_SETTINGS.siteName,
    siteDescription:
      settings?.siteDescription || DEFAULT_SYSTEM_SETTINGS.siteDescription,
    logo: settings?.logo || null,
  };

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
              <Logo size="xxl" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {displaySettings.siteName}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {displaySettings.siteDescription}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-hover min-w-[160px]">
                <Link href="/register">
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="btn-hover min-w-[160px]"
              >
                <Link href="/login">관리자 로그인</Link>
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
                <Card className="card-hover h-full border-none bg-card/50 backdrop-blur-sm">
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
            <p className="mx-auto max-w-2xl text-muted-foreground">
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
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
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
                className="btn-hover min-w-[160px]"
              >
                <Link href="/register">
                  무료로 시작하기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 푸터 */}
      {/* <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Logo size="xl" />
            <div className="flex gap-2">
              <Badge variant="outline">모바일 최적화</Badge>
              <Badge variant="outline">QR 코드 지원</Badge>
              <Badge variant="outline">실시간 알림</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              {process.env.ENV_COMPANY_NAME || "SWKorea"}. All rights reserved.
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
