"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout";
import { WebPushSubscription } from "@/components/admin/notifications/WebPushSubscription";
import { useNotificationSettingsQuery } from "@/lib/hooks/query/use-notification-settings-query";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { FormSkeleton } from "@/components/ui/skeleton";
import { PAGE_HEADER } from "@/lib/constants/notifications";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/use-notification-store";
import type { UserNotificationSetting } from "@/lib/types/common";

// 동적 임포트로 조건부 컴포넌트들 최적화
const SubscriptionGuideCard = dynamic(
  () => import("@/components/admin/notifications/SubscriptionGuideCard"),
  { loading: () => <CardSkeleton />, ssr: false }
);

const NotificationMethodsCard = dynamic(
  () =>
    import("@/components/admin/notifications/NotificationMethodsCard").then(
      (mod) => ({ default: mod.NotificationMethodsCard })
    ),
  { loading: () => <CardSkeleton />, ssr: false }
);

const NotificationTypesCard = dynamic(
  () =>
    import("@/components/admin/notifications/NotificationTypesCard").then(
      (mod) => ({ default: mod.NotificationTypesCard })
    ),
  { loading: () => <CardSkeleton />, ssr: false }
);

const NotificationSettingsActions = dynamic(
  () =>
    import("@/components/admin/notifications/NotificationSettingsActions").then(
      (mod) => ({ default: mod.NotificationSettingsActions })
    ),
  { loading: () => <CardSkeleton />, ssr: false }
);

export default function NotificationsPage() {
  // 공통 스토어에서 isSubscribed 상태 사용
  const { isSubscribed } = useNotificationStore();

  const {
    data: settings,
    error: settingsError,
    isLoading: settingsLoading,
  } = useNotificationSettingsQuery();
  const { showError } = useCommonToast();

  // 시스템 설정 페이지처럼 로컬 상태 관리
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localSettings, setLocalSettings] =
    useState<UserNotificationSetting | null>(null);

  // settings가 로드되면 localSettings 업데이트
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setUnsavedChanges(false);
    }
  }, [settings]);

  // 설정 변경 핸들러 - useCallback으로 메모이제이션
  const handleSettingChange = useCallback(
    <K extends keyof UserNotificationSetting>(
      key: K,
      value: UserNotificationSetting[K]
    ) => {
      if (!localSettings) return;

      // 로컬 상태 즉시 업데이트
      setLocalSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      setUnsavedChanges(true);
    },
    [localSettings]
  );

  // 저장 완료 후 상태 초기화 - useCallback으로 메모이제이션
  const handleSaveComplete = useCallback(() => {
    setUnsavedChanges(false);
  }, []);

  // 알림 설정 에러 처리
  useEffect(() => {
    if (settingsError) {
      showError("알림 설정 로드 실패", settingsError.message);
    }
  }, [settingsError, showError]);

  const isLoading = settingsLoading;

  // 상태 관리 최적화 - useMemo로 설정 객체 메모이제이션
  const notificationProps = useMemo(
    () => ({
      settings: localSettings,
      onSettingChange: handleSettingChange,
    }),
    [localSettings, handleSettingChange]
  );

  // 애니메이션 최적화 - 조건부 적용
  const shouldAnimate = !isLoading && settings;
  const animationProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.2 }, // 애니메이션 시간 단축
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={Bell}
        />
        <FormSkeleton fields={5} />
      </div>
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
          icon={Bell}
        />

        <div className="space-y-4 md:space-y-6">
          {/* 메인 웹푸시 설정 - 애니메이션 최적화 */}
          {shouldAnimate ? (
            <motion.div {...animationProps} layout>
              <WebPushSubscription />
            </motion.div>
          ) : (
            <WebPushSubscription />
          )}

          <AnimatePresence mode="wait">
            {!isSubscribed && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }} // 애니메이션 시간 단축
              >
                <SubscriptionGuideCard />
              </motion.div>
            )}

            {isSubscribed && (
              <>
                {shouldAnimate ? (
                  <motion.div
                    key="methods"
                    {...animationProps}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <NotificationMethodsCard {...notificationProps} />
                  </motion.div>
                ) : (
                  <NotificationMethodsCard {...notificationProps} />
                )}

                {shouldAnimate ? (
                  <motion.div
                    key="types"
                    {...animationProps}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <NotificationTypesCard {...notificationProps} />
                  </motion.div>
                ) : (
                  <NotificationTypesCard {...notificationProps} />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
        <NotificationSettingsActions
          hasUnsavedChanges={unsavedChanges}
          onSaveComplete={handleSaveComplete}
          currentSettings={localSettings}
        />
      </div>
    </ErrorBoundary>
  );
}
