"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNotificationService } from "@/hooks/notification/useNotificationService";
import {
  CheckingStatus,
  UnsupportedStatus,
  DeniedStatus,
  GrantedStatus,
  SubscribedStatus,
} from "./status/NotificationStatus";
import NotificationCardHeader from "./NotificationCardHeader";
import { Zap } from "lucide-react";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { safeNotificationAccess } from "@/lib/utils/browser/safari-compat";
import { PAGE_HEADER } from "@/lib/constants/notifications";
import { useNotificationStore } from "@/store/use-notification-store";
import { getSWRegistration } from "@/lib/utils/notification/push-subscription";

export function WebPushSubscription() {
  // 공통 스토어 사용
  const { status, updateSubscriptionStatus } = useNotificationStore();

  const {
    isLoading,
    requestNotificationPermission,
    cleanupSubscriptions,
    handleUnsubscription,
    getSubscriptionStatus,
    lastMessage,
    clearLastMessage,
  } = useNotificationService();
  const { showInfo, showWarning, showSuccess, showError } = useCommonToast();

  useEffect(() => {
    checkNotificationStatus();
  }, [updateSubscriptionStatus]);

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

  const checkNotificationStatus = async () => {
    const safeNotification = safeNotificationAccess();

    // 브라우저 지원 여부 확인
    if (!safeNotification.isSupported) {
      showWarning(
        "브라우저 미지원",
        "이 브라우저는 푸시 알림을 지원하지 않습니다."
      );
      updateSubscriptionStatus("unsupported", false);
      return;
    }

    // 권한 상태 확인
    switch (safeNotification.permission) {
      case "denied":
        updateSubscriptionStatus("denied", false);
        break;
      case "granted":
        try {
          const registration = await getSWRegistration();
          const subscription = await registration.pushManager.getSubscription();
          // 브라우저의 실제 구독 상태를 우선적으로 확인
          if (subscription) {
            updateSubscriptionStatus("subscribed", true);
          } else {
            // 브라우저에 구독이 없으면 서버 상태 확인 (자동 복구 없음)
            updateSubscriptionStatus("granted", false);
          }
        } catch (error) {
          showError(
            "서비스 워커 오류",
            error instanceof Error
              ? error.message
              : "서비스 워커를 가져오는 중 오류가 발생했습니다."
          );
          updateSubscriptionStatus("granted", false);
        }
        break;
      default:
        updateSubscriptionStatus("granted", false);
    }
  };

  const handleAllow = async () => {
    showInfo("알림 권한 요청", "알림 권한을 요청하는 중입니다...");
    // 알림 설정 페이지에서는 설정 체크 건너뛰기
    const success = await requestNotificationPermission(true);
    if (success) {
      await checkNotificationStatus();
    }
  };

  const handleUnsubscribe = async () => {
    showInfo("구독 해제 시작", "푸시 구독을 해제하는 중입니다...");
    try {
      const registration = await getSWRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await handleUnsubscription(true, subscription);
        updateSubscriptionStatus("granted", false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      showError("구독 해제 실패", errorMessage);
    }
  };

  const handleCleanup = async () => {
    await cleanupSubscriptions();
    await checkNotificationStatus();
  };

  // 상태에 따른 컴포넌트 직접 렌더링
  const renderStatusComponent = () => {
    switch (status) {
      case "checking":
        return <CheckingStatus />;
      case "unsupported":
        return <UnsupportedStatus />;
      case "denied":
        return <DeniedStatus onAllow={handleAllow} />;
      case "granted":
        return <GrantedStatus isLoading={isLoading} onAllow={handleAllow} />;
      case "subscribed":
        return (
          <SubscribedStatus
            isLoading={isLoading}
            onCleanup={handleCleanup}
            onUnsubscribe={handleUnsubscribe}
          />
        );
      default:
        return <CheckingStatus />;
    }
  };

  return (
    <Card>
      <NotificationCardHeader
        icon={Zap}
        title={PAGE_HEADER.PUSH_NOTIFICATION_SETTINGS}
        description={PAGE_HEADER.PUSH_DESCRIPTION}
      />
      <CardContent>{renderStatusComponent()}</CardContent>
    </Card>
  );
}
