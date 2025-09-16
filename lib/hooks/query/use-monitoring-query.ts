"use client";

import { useAuthenticatedQuery } from "@/lib/hooks/query-utils";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/utils/data/api-client";
import { monitoringKeys } from "./query-keys";

/**
 * 분리된 모니터링 API용 React Query 훅들
 */
export function useMonitoringHealthQuery() {
  const { user, isAdmin } = useAuth();

  return useAuthenticatedQuery(
    monitoringKeys.health(),
    async () => {
      return await apiClient("/api/health", {
        context: "시스템 헬스체크 데이터 조회",
      });
    },
    {
      enabled: !!user && isAdmin,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 60 * 2,
      retry: 1,
    }
  );
}

export function useMonitoringUptimeQuery() {
  const { user, isAdmin } = useAuth();

  return useAuthenticatedQuery(
    monitoringKeys.uptime(),
    async () => {
      return await apiClient("/api/monitoring/uptime", {
        context: "업타임 데이터 조회",
      });
    },
    {
      enabled: !!user && isAdmin,
      staleTime: 1000 * 60 * 2, // 5분 캐싱
      gcTime: 1000 * 60 * 5, // 10분 가비지 컬렉션
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 60 * 2, // 5분마다 갱신
      retry: 1, // 재시도 횟수 감소
    }
  );
}

export function useMonitoringAnalyticsQuery() {
  const { user, isAdmin } = useAuth();

  return useAuthenticatedQuery(
    monitoringKeys.analytics(),
    async () => {
      return await apiClient("/api/monitoring/analytics", {
        context: "방문자 통계 데이터 조회",
      });
    },
    {
      enabled: !!user && isAdmin,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 60 * 2,
      retry: 1,
    }
  );
}

export function useMonitoringErrorsQuery() {
  const { user, isAdmin } = useAuth();

  return useAuthenticatedQuery(
    monitoringKeys.errors(),
    async () => {
      return await apiClient("/api/monitoring/errors", {
        context: "에러 로그 데이터 조회",
      });
    },
    {
      enabled: !!user && isAdmin,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 60 * 2,
      retry: 1,
    }
  );
}
