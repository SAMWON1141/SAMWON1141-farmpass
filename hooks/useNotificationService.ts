import { useState, useCallback } from "react";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { getNotificationErrorMessage } from "@/lib/utils/validation/validation";
import {
  requestNotificationPermissionAndSubscribe,
  createSubscriptionFromExisting,
} from "@/lib/utils/notification/push-subscription";

// React Query Hooks
import {
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useCleanupSubscriptionsMutation,
  useSubscriptionStatusQuery,
} from "@/lib/hooks/query/use-push-mutations";
import { useSaveNotificationSettingsMutation } from "@/lib/hooks/query/use-notification-mutations";
import { useVapidKeyEffective } from "@/hooks/useVapidKey";

export function useNotificationService() {
  // 토스트 대신 메시지 상태만 반환
  const [lastMessage, setLastMessage] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Query Hooks - Lazy Loading으로 최적화
  const { refetch: refetchSubscriptions } = useSubscriptionStatusQuery(false); // 수동으로 조회할 때만 사용
  const createSubscriptionMutation = useCreateSubscriptionMutation();
  const deleteSubscriptionMutation = useDeleteSubscriptionMutation();
  const cleanupSubscriptionsMutation = useCleanupSubscriptionsMutation();
  const saveNotificationSettingsMutation =
    useSaveNotificationSettingsMutation();

  const {
    vapidKey,
    isLoading: vapidKeyLoading,
    error: vapidKeyError,
  } = useVapidKeyEffective();

  // 구독 해제 - React Query 사용
  const handleUnsubscription = async (
    subscription: PushSubscription,
    farmId?: string
  ) => {
    try {
      setIsLoading(true);

      // 구독 해제 Mutation 사용 (알림 설정 업데이트 포함)
      const result = await deleteSubscriptionMutation.mutateAsync({
        endpoint: subscription.endpoint,
        forceDelete: false, // 수동 구독 해제는 인증 사용
        options: {
          updateSettings: true, // 알림 설정 페이지에서는 설정 업데이트
        },
      });

      setLastMessage({
        type: "success",
        title: "구독 해제 성공",
        message: result?.message || "알림 구독이 해제되었습니다",
      });
      return result;
    } catch (error) {
      const notificationError = getNotificationErrorMessage(error);
      setLastMessage({
        type: "error",
        title: "구독 해제 실패",
        message: notificationError.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 구독 상태 조회 - React Query 사용
  const getSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      // React Query를 사용하여 구독 상태 조회
      const result = await refetchSubscriptions();

      if (result.error) {
        throw result.error;
      }

      const subscriptionData = result.data || [];

      return { subscriptions: subscriptionData };
    } catch (error) {
      devLog.error("구독 상태 조회 실패:", error);
      const notificationError = getNotificationErrorMessage(error);
      setLastMessage({
        type: "error",
        title: "구독 상태 조회 실패",
        message: notificationError.message,
      });
      return { subscriptions: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // 구독 정리 - React Query Mutation 사용
  const cleanupSubscriptions = async () => {
    try {
      setIsLoading(true);
      devLog.log("[NOTIFICATION] 구독 정리 시작");

      // 구독 정리 Mutation 사용
      const result = await cleanupSubscriptionsMutation.mutateAsync({
        realTimeCheck: false,
      });

      setLastMessage({
        type: "success",
        title: "구독 정리 완료",
        message: result.message || "구독 정리가 완료되었습니다",
      });

      return result;
    } catch (error) {
      devLog.error("구독 정리 실패:", error);
      const notificationError = getNotificationErrorMessage(error);
      setLastMessage({
        type: "error",
        title: "구독 정리 실패",
        message: notificationError.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 요청 및 구독 처리 - 공통 로직 사용
  const requestNotificationPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      // VAPID 키 사용 (최상위에서 받은 값)
      if (!vapidKey) {
        setLastMessage({
          type: "error",
          title: "VAPID 키 오류",
          message: "VAPID 키를 가져올 수 없습니다. 잠시 후 다시 시도해 주세요.",
        });
        return false;
      }

      // 공통 로직 사용 (알림 설정 페이지용)
      const result = await requestNotificationPermissionAndSubscribe(
        async () => vapidKey,
        async (subscription, deviceId, options) => {
          // 서버에 구독 정보 전송 (device_id 포함)
          const mutationResult = await createSubscriptionMutation.mutateAsync({
            subscription: subscription as PushSubscription,
            deviceId,
            options: {
              ...options,
              updateSettings: true, // 알림 설정 페이지에서는 설정 업데이트
            },
          });

          // 구독 성공 시 is_active를 true로 설정
          if (mutationResult.success) {
            await saveNotificationSettingsMutation.mutateAsync({
              is_active: true,
            });
          }

          return mutationResult;
        }
      );

      // 결과에 따른 메시지 설정
      if (result.success) {
        setLastMessage({
          type: "success",
          title: "구독 성공",
          message: result.message || "알림 구독이 완료되었습니다",
        });
        return true;
      } else {
        setLastMessage({
          type: "error",
          title: "알림 설정 실패",
          message: result.message || "알림 설정 중 오류가 발생했습니다.",
        });
        return false;
      }
    } catch (error) {
      devLog.error("알림 권한 요청 실패:", error);
      const notificationError = getNotificationErrorMessage(error);
      setLastMessage({
        type: "error",
        title: "알림 설정 실패",
        message: notificationError.message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [vapidKey, createSubscriptionMutation, saveNotificationSettingsMutation]);

  // 기존 구독으로 재구독 (권한 요청 없음)
  const resubscribeFromExisting = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await createSubscriptionFromExisting(
        async (subscription, deviceId, options) => {
          return await createSubscriptionMutation.mutateAsync({
            subscription: subscription as PushSubscription,
            deviceId,
            options: {
              ...options,
              isResubscribe: true,
              updateSettings: true,
            },
          });
        },
        {
          isResubscribe: true,
          updateSettings: true,
        }
      );

      if (result.success) {
        setLastMessage({
          type: "success",
          title: "재구독 성공",
          message: result.message || "알림 재구독이 완료되었습니다",
        });
        return true;
      } else {
        setLastMessage({
          type: "error",
          title: "재구독 실패",
          message: result.message || "재구독 중 오류가 발생했습니다.",
        });
        return false;
      }
    } catch (error) {
      devLog.error("재구독 실패:", error);
      const notificationError = getNotificationErrorMessage(error);
      setLastMessage({
        type: "error",
        title: "재구독 실패",
        message: notificationError.message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createSubscriptionMutation]);

  return {
    isLoading,
    handleUnsubscription,
    getSubscriptionStatus,
    cleanupSubscriptions,
    requestNotificationPermission,
    resubscribeFromExisting,
    lastMessage,
    clearLastMessage: () => setLastMessage(null),
  };
}
