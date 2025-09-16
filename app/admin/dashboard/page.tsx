"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import useBlockNavigation from "@/hooks/ui/use-before-unload";
import { PageHeader } from "@/components/layout";
import {
  DashboardSkeleton,
  FarmSelector,
  StatsGrid,
  ChartGrid,
} from "@/components/admin/dashboard";
import { useNotificationPermission } from "@/hooks/notification/useNotificationPermission";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { BarChart3, TrendingUp } from "lucide-react";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { AdminError } from "@/components/error/admin-error";
import { useMultipleLoadingTimeout } from "@/hooks/system/useTimeout";
import { InstallGuideSheet } from "@/components/common/InstallGuide/InstallGuideSheet";
import { LABELS, PAGE_HEADER } from "@/lib/constants/dashboard";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { useFarmsQuery } from "@/lib/hooks/query/use-farms-query";
import { useAdminDashboardStatsQuery } from "@/lib/hooks/query/use-admin-dashboard-query";
import { useProfileQuery } from "@/lib/hooks/query/use-profile-query";
import { useUserConsentsQuery } from "@/lib/hooks/query/use-user-consents-query";
import { isProfileComplete } from "@/lib/utils/auth/profile-utils";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";

// 메모이제이션된 컴포넌트들
const MemoizedStatsGrid = memo(StatsGrid);
const MemoizedChartGrid = memo(ChartGrid);
const MemoizedFarmSelector = memo(FarmSelector);

export default function DashboardPage() {
  const router = useRouter();
  const { userId, isAdmin, isAuthenticated, isUnauthenticated, isLoading } =
    useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileQuery(userId);
  const { data: consentData, isLoading: consentLoading } =
    useUserConsentsQuery(isAuthenticated);
  const { farms: availableFarms, isLoading: farmsLoading } = useFarmsQuery();
  const userLoading = isLoading;

  // selectedFarm 상태 관리 - 로딩 상태 고려
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  // 단일 통합 집계 API 호출(선택 농장 반영)
  const {
    data: adminStats,
    isLoading: adminLoading,
    error,
    refetch,
  } = useAdminDashboardStatsQuery(selectedFarm);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  // 농장 선택 콜백 - useCallback으로 최적화
  const handleFarmSelect = useCallback((farmId: string) => {
    setSelectedFarm(farmId);
  }, []);

  // 알림 권한 관리
  const { lastMessage, clearLastMessage } = useNotificationPermission();

  const { showWarning, showSuccess, showError } = useCommonToast();

  // 약관 및 프로필 체크 - 직접 접근 시에도 체크
  useEffect(() => {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (isUnauthenticated) {
      router.replace("/auth/login");
      return;
    }

    // 로딩 중이면 대기
    if (profileLoading || consentLoading) {
      return;
    }

    // 프로필 완성도 및 약관 동의 상태 체크
    if (!isProfileComplete(profile) || !consentData?.hasAllRequiredConsents) {
      // 약관 동의 쿼리를 다시 실행하여 최신 상태 확인
      if (consentData && !consentData.hasAllRequiredConsents) {
        // 약간의 지연 후 다시 체크 (캐시 업데이트 대기)
        setTimeout(() => {
          router.replace("/profile-setup");
        }, 100);
        return;
      }
      router.replace("/profile-setup");
      return;
    }
  }, [
    isUnauthenticated,
    profile,
    consentData,
    profileLoading,
    consentLoading,
    router,
  ]);

  // 초기화 완료 체크 - farms 로딩 완료 후 초기값 설정 (농장 0건이어도 초기화 진행)
  useEffect(() => {
    // 로딩 중이면 스킵
    if (farmsLoading) {
      return;
    }

    // 농장 ID만 추출하여 메모리에 저장
    const firstFarmId = availableFarms?.[0]?.id;
    const initialFarm = isAdmin ? "all" : firstFarmId || "all";

    // 현재 선택된 값과 다를 때만 업데이트
    if (selectedFarm !== initialFarm) {
      setSelectedFarm(initialFarm);
    }
  }, [farmsLoading, isAdmin]);

  // 알림 메시지 처리
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "success") {
        showSuccess(lastMessage.title, lastMessage.message);
      } else {
        showError(lastMessage.title, lastMessage.message);
      }
      clearLastMessage();
    }
  }, [lastMessage, showSuccess, showError, clearLastMessage]);

  // 초기 로딩 상태 최적화 - 데이터가 있으면 스켈레톤 숨김
  const isInitialLoading = useMemo(() => {
    return (
      userLoading ||
      profileLoading ||
      consentLoading ||
      (farmsLoading && availableFarms.length === 0) ||
      (adminLoading && !adminStats) // 데이터가 없을 때만 로딩 표시
    );
  }, [
    userLoading,
    profileLoading,
    consentLoading,
    farmsLoading,
    availableFarms.length,
    adminLoading,
    adminStats,
  ]);

  // 데이터 재페칭 함수
  const handleDataRefetch = useCallback(() => {
    refetch?.();
  }, [refetch]);

  // 다중 로딩 상태 타임아웃 관리
  const { timeoutReached, retry } = useMultipleLoadingTimeout(
    [adminLoading, farmsLoading],
    handleDataRefetch,
    { timeout: 15000 }
  );

  const handleSheetClose = useCallback(() => {
    setShowConfirmSheet(false);
  }, []);

  // 뒤로가기 처리 - useBlockNavigation 훅 사용
  const { isAttemptingNavigation, proceedNavigation, cancelNavigation } =
    useBlockNavigation(true, true, showConfirmSheet, handleSheetClose, "/");

  // confirm 다이얼로그 처리
  useEffect(() => {
    if (isAttemptingNavigation) {
      setShowConfirmSheet(true);
    }
  }, [isAttemptingNavigation]);

  // 타임아웃 상태 변경 시 경고 메시지 표시
  useEffect(() => {
    if (timeoutReached) {
      showWarning(
        "데이터 로딩 지연",
        "네트워크 상태를 확인하거나 다시 시도해 주세요."
      );
    }
  }, [timeoutReached, showWarning]);

  if (timeoutReached) {
    return (
      <AdminError
        title={ERROR_CONFIGS.TIMEOUT.title}
        description={ERROR_CONFIGS.TIMEOUT.description}
        retry={retry}
        error={new Error("Timeout: 데이터 로딩 10초 초과")}
        isTimeout={true}
      />
    );
  }

  if (error) {
    return (
      <AdminError
        title={ERROR_CONFIGS.LOADING.title}
        description={ERROR_CONFIGS.LOADING.description}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  if (isInitialLoading && !adminStats) {
    return (
      <div className="flex-1 space-y-6 sm:space-y-8 lg:space-y-10 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={BarChart3}
          actions={<InstallGuideSheet />}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <>
        <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
          {/* 헤더 섹션 */}
          <div className="space-y-4">
            <PageHeader
              title={PAGE_HEADER.PAGE_TITLE}
              description={PAGE_HEADER.PAGE_DESCRIPTION}
              icon={BarChart3}
              actions={<InstallGuideSheet />}
            />
          </div>

          {/* 통계 카드 섹션 */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{LABELS.CORE_STATS}</span>
              </div>

              {/* 농장 선택기 - 농장이 있을 때만 렌더링 */}
              {availableFarms && availableFarms.length > 0 && (
                <MemoizedFarmSelector
                  selectedFarm={selectedFarm}
                  onFarmChange={handleFarmSelect}
                  availableFarms={availableFarms}
                  isAdmin={isAdmin}
                />
              )}
            </div>
            {/* 기존 StatsGrid 디자인 유지 */}
            <MemoizedStatsGrid
              stats={
                adminStats?.dashboardStats || {
                  totalVisitors: 0,
                  todayVisitors: 0,
                  weeklyVisitors: 0,
                  disinfectionRate: 0,
                  trends: {
                    totalVisitorsTrend: "데이터 없음",
                    todayVisitorsTrend: "데이터 없음",
                    weeklyVisitorsTrend: "데이터 없음",
                    disinfectionTrend: "데이터 없음",
                  },
                }
              }
            />
          </section>

          {/* 차트 섹션 */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{LABELS.DETAILED_ANALYSIS}</span>
            </div>
            <MemoizedChartGrid
              visitorTrend={adminStats?.visitorTrend || []}
              purposeStats={adminStats?.purposeStats || []}
              timeStats={adminStats?.timeStats || []}
              regionStats={adminStats?.regionStats || []}
              weekdayStats={adminStats?.weekdayStats || []}
            />
          </section>
        </div>
      </>

      {/* 네비게이션 확인 시트 */}
      <ConfirmSheet
        open={showConfirmSheet}
        onOpenChange={setShowConfirmSheet}
        onConfirm={() => {
          proceedNavigation();
        }}
        onCancel={() => {
          setShowConfirmSheet(false);
          cancelNavigation();
        }}
        title={LABELS.DASHBOARD_CANCEL_TITLE}
        warningMessage={LABELS.DASHBOARD_CANCEL_WARNING}
        variant="warning"
      />
    </ErrorBoundary>
  );
}
