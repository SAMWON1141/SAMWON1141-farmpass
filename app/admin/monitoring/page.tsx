"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo } from "react";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { AccessDenied } from "@/components/error/access-denied";
import { PageHeader } from "@/components/layout";
import { PAGE_HEADER } from "@/lib/constants/monitoring";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { Activity } from "lucide-react";

// 동적 임포트로 코드 스플리팅
const SystemStatusCard = dynamic(
  () =>
    import("@/components/admin/monitoring/SystemStatusCard").then((mod) => ({
      default: mod.SystemStatusCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

const UptimeCard = dynamic(
  () =>
    import("@/components/admin/monitoring/UptimeCard").then((mod) => ({
      default: mod.UptimeCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

const AnalyticsCard = dynamic(
  () =>
    import("@/components/admin/monitoring/AnalyticsCard").then((mod) => ({
      default: mod.AnalyticsCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

const ErrorLogsCard = dynamic(
  () =>
    import("@/components/admin/monitoring/ErrorLogsCard").then((mod) => ({
      default: mod.ErrorLogsCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

const TechStackCard = dynamic(
  () =>
    import("@/components/admin/monitoring/TechStackCard").then((mod) => ({
      default: mod.TechStackCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

import {
  useMonitoringHealthQuery,
  useMonitoringUptimeQuery,
  useMonitoringAnalyticsQuery,
  useMonitoringErrorsQuery,
} from "@/lib/hooks/query/use-monitoring-query";

// 카드별 로딩/에러/데이터 렌더링 유틸 (React.memo로 최적화)
type RenderCardProps = {
  isLoading: boolean;
  data: any;
  children: React.ReactNode;
  skeleton: React.ReactNode;
};

const RenderCard = React.memo(
  ({ isLoading, data, children, skeleton }: RenderCardProps) => {
    if (isLoading) return skeleton;
    if (!data) return skeleton;
    return children;
  }
);

RenderCard.displayName = "RenderCard";

export default function MonitoringDashboard() {
  // 우선순위 기반 로딩: 시스템 상태 먼저
  const health = useMonitoringHealthQuery();
  const { isAdmin, isLoading } = useAuth();

  // 지연 로딩 상태 관리
  const [showSecondary, setShowSecondary] = useState(false);
  const [showTertiary, setShowTertiary] = useState(false);

  // 우선순위 기반 로딩 구현
  useEffect(() => {
    if (health.data) {
      // 1단계: 시스템 상태 로딩 완료 후 100ms 뒤에 업타임 로딩
      const timer1 = setTimeout(() => setShowSecondary(true), 100);

      // 2단계: 업타임 로딩 완료 후 200ms 뒤에 나머지 로딩
      const timer2 = setTimeout(() => setShowTertiary(true), 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [health.data]);

  // 조건부 훅 호출로 불필요한 API 호출 방지
  const uptime = useMonitoringUptimeQuery();
  const analytics = useMonitoringAnalyticsQuery();
  const errors = useMonitoringErrorsQuery();

  // useMemo로 계산 최적화
  const techStackData = useMemo(() => {
    return health.data?.system?.techStack;
  }, [health.data?.system?.techStack]);

  const uptimeCardProps = useMemo(
    () => ({
      monitors: uptime.data?.monitors ?? [],
      success: uptime.data?.success,
      error: uptime.data?.error,
      message: uptime.data?.message,
      details: uptime.data?.details,
    }),
    [uptime.data]
  );

  const analyticsData = useMemo(() => {
    return analytics.data;
  }, [analytics.data]);

  const errorsData = useMemo(() => {
    return errors.data ?? [];
  }, [errors.data]);

  // 프로필 로딩 중일 때는 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={Activity}
        />
        <CardSkeleton count={5} />
      </div>
    );
  }

  // 권한이 없는 경우(기존 유지)
  if (!isAdmin) {
    return (
      <AccessDenied
        title={ERROR_CONFIGS.PERMISSION.title}
        description={ERROR_CONFIGS.PERMISSION.description}
        requiredRole="관리자"
        currentRole="일반 사용자"
      />
    );
  }

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={Activity}
        />

        {/* 1단계: 시스템 상태 카드 (즉시 표시) */}
        <RenderCard
          isLoading={health.isLoading}
          data={health.data}
          skeleton={<CardSkeleton />}
        >
          <SystemStatusCard data={health.data} />
        </RenderCard>

        {/* 2단계: 업타임 카드 (100ms 후 표시) */}
        {showSecondary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RenderCard
                isLoading={uptime.isLoading}
                data={uptime.data}
                skeleton={<CardSkeleton />}
              >
                <UptimeCard {...uptimeCardProps} />
              </RenderCard>

              {/* 3단계: 방문자 통계 카드 (300ms 후 표시) */}
              {showTertiary && (
                <RenderCard
                  isLoading={analytics.isLoading}
                  data={analyticsData}
                  skeleton={<CardSkeleton />}
                >
                  <AnalyticsCard data={analyticsData} />
                </RenderCard>
              )}
            </div>

            {/* 개발 스택 정보 (3단계에서 표시) */}
            {showTertiary && techStackData && (
              <TechStackCard data={techStackData} />
            )}

            {/* 최근 에러 (3단계에서 표시) */}
            {showTertiary && (
              <RenderCard
                isLoading={errors.isLoading}
                data={errorsData}
                skeleton={<CardSkeleton />}
              >
                <ErrorLogsCard errors={errorsData} />
              </RenderCard>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
