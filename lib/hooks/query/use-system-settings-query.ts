"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "./query-keys";
import type { SystemSettings } from "@/lib/types/settings";

/**
 * React Query 기반 System Settings Hook
 * API 라우트를 통해 Prisma로 시스템 설정을 조회합니다.
 * 인증 없이도 조회 가능합니다.
 */
export function useSystemSettingsQuery(options?: { enabled?: boolean }) {
  const result = useQuery({
    queryKey: settingsKeys.general(),
    enabled: options?.enabled !== false, // 기본값은 true, false일 때만 비활성화
    queryFn: async (): Promise<SystemSettings> => {
      try {
        // 간단한 fetch 사용 (인증 로직 없이)
        const response = await fetch("/api/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const settings = await response.json();

        // API는 설정 데이터를 직접 반환함 (data.settings가 아님)
        const systemSettings: SystemSettings = {
          id: settings.id,
          created_at: settings.created_at,
          updated_at: settings.updated_at,

          // 일반 설정
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          language: settings.language,
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
          favicon: settings.favicon,
          logo: settings.logo,

          // 보안 설정
          maxLoginAttempts: settings.maxLoginAttempts,
          accountLockoutDurationMinutes: settings.accountLockoutDurationMinutes,
          passwordMinLength: settings.passwordMinLength,
          passwordRequireSpecialChar: settings.passwordRequireSpecialChar,
          passwordRequireNumber: settings.passwordRequireNumber,
          passwordRequireUpperCase: settings.passwordRequireUpperCase,
          passwordRequireLowerCase: settings.passwordRequireLowerCase,

          // 방문자 정책
          reVisitAllowInterval: settings.reVisitAllowInterval,
          maxVisitorsPerDay: settings.maxVisitorsPerDay,
          visitorDataRetentionDays: settings.visitorDataRetentionDays,
          requireVisitorPhoto: settings.requireVisitorPhoto,
          requireVisitorContact: settings.requireVisitorContact,
          requireVisitPurpose: settings.requireVisitPurpose,

          // 알림 설정
          visitTemplate: settings.visitTemplate,

          // 웹푸시 설정
          vapidPublicKey: settings.vapidPublicKey,
          vapidPrivateKey: settings.vapidPrivateKey,
          notificationIcon: settings.notificationIcon,
          notificationBadge: settings.notificationBadge,
          pushSoundEnabled: settings.pushSoundEnabled,
          pushVibrateEnabled: settings.pushVibrateEnabled,
          pushRequireInteraction: settings.pushRequireInteraction,

          // 구독 정리 설정
          subscriptionCleanupDays: settings.subscriptionCleanupDays,
          subscriptionFailCountThreshold:
            settings.subscriptionFailCountThreshold,
          subscriptionCleanupInactive: settings.subscriptionCleanupInactive,
          subscriptionForceDelete: settings.subscriptionForceDelete,

          // 시스템 설정
          logLevel: settings.logLevel,
          logRetentionDays: settings.logRetentionDays,
          maintenanceMode: settings.maintenanceMode,
          debugMode: settings.debugMode,
          maintenanceContactInfo: settings.maintenanceContactInfo,
          maintenanceEstimatedTime: settings.maintenanceEstimatedTime,
          maintenanceMessage: settings.maintenanceMessage,
          maintenanceStartTime: settings.maintenanceStartTime,
        };

        return systemSettings;
      } catch (error) {
        throw error;
      }
    },
    // 시스템 설정은 인증 없이도 조회 가능해야 함 (회원가입, 메인페이지 등에서 사용)
    staleTime: 2 * 60 * 60 * 1000, // 2시간간 stale하지 않음 (설정은 매우 드물게 변경됨)
    gcTime: 4 * 60 * 60 * 1000, // 4시간간 캐시 유지 (메모리 효율성)
    refetchOnWindowFocus: false, // 윈도우 포커스시 refetch 비활성화 (설정은 자주 변경되지 않음)
    refetchOnMount: false, // 마운트시 자동 refetch 비활성화 (캐시 우선 사용)
    refetchOnReconnect: true, // 재연결시 자동 refetch 활성화
    retry: 1, // 실패 시 2번 재시도 (네트워크 오류 대응)
    retryDelay: 1000, // 2초 후 재시도
  });

  return result;
}
