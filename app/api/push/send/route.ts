import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import webpush from "web-push";
import { getSystemSettings } from "@/lib/cache/system-settings-cache";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";

// VAPID 키 설정 초기화
async function initializeVapidKeys() {
  try {
    // 1. 환경변수 우선 (null 대신 undefined)
    const publicKey =
      process.env.VAPID_PUBLIC_KEY ||
      (await getSystemSettings())?.vapidPublicKey ||
      undefined;
    const privateKey =
      process.env.VAPID_PRIVATE_KEY ||
      (await getSystemSettings())?.vapidPrivateKey ||
      undefined;

    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        "mailto:admin@samwon1141.com",
        publicKey,
        privateKey
      );
      return true;
    }
    return false;
  } catch (error) {
    devLog.error("VAPID 키 초기화 실패:", error);
    return false;
  }
}

/**
 * 푸시 발송 재시도 로직
 * @param subscription 푸시 구독 정보
 * @param payload 알림 페이로드
 * @param maxRetries 최대 재시도 횟수
 * @returns 발송 결과
 */
async function sendPushWithRetry(
  subscription: any,
  payload: string,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: any; retryCount?: number }> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      devLog.info(`푸시 발송 시도: ${pushSubscription.endpoint}`);
      devLog.info(`푸시 발송 페이로드: ${payload}`);
      await webpush.sendNotification(pushSubscription, payload);

      return { success: true };
    } catch (error: any) {
      lastError = error;

      // 410 Gone이나 404 Not Found는 재시도하지 않음
      if (error.statusCode === 410 || error.statusCode === 404) {
        return { success: false, error, retryCount: attempt };
      }

      // 마지막 시도가 아니면 잠시 대기 후 재시도
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 지수 백오프, 최대 5초
        await new Promise((resolve) => setTimeout(resolve, delay));
        devLog.warn(
          `푸시 발송 재시도 ${attempt}/${maxRetries} (구독 ID: ${subscription.id})`
        );
      }
    }
  }

  return { success: false, error: lastError, retryCount: maxRetries };
}

// 푸시 알림 발송
export async function POST(request: NextRequest) {
  let user = null;
  let body: any = null;

  try {
    // 서버 사이드 호출인지 확인
    const userAgent = request.headers.get("user-agent") || "";
    const isServerSideCall = !userAgent || userAgent.includes("node-fetch");

    if (!isServerSideCall) {
      // 클라이언트 호출인 경우 관리자 권한 인증 확인
      const authResult = await requireAuth(true);
      if (!authResult.success || !authResult.user) {
        return authResult.response!;
      }

      user = authResult.user;
    } else {
      // 서버 사이드 호출인 경우 시스템 사용자로 처리
      user = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "system@samwon114.com",
      };
    }

    body = await request.json();
    const {
      title,
      message,
      targetUserIds,
      url = "/admin/dashboard",
      icon,
      badge,
      requireInteraction = false,
      notificationType,
    } = body;

    // 입력 검증
    if (!title || !message || !notificationType) {
      await createSystemLog(
        "PUSH_NOTIFICATION_INVALID_INPUT",
        LOG_MESSAGES.PUSH_NOTIFICATION_INVALID_INPUT(
          `title: ${title}, message: ${message}, notificationType: ${notificationType}`
        ),
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_invalid_input",
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          notificationType,
          targetUserIds,
        },
        request
      );
      throwBusinessError("MISSING_REQUIRED_FIELDS", {
        operation: "send_push_notification",
        title,
        message,
        notificationType,
      });
    }

    if (!["visitor", "system"].includes(notificationType)) {
      await createSystemLog(
        "PUSH_NOTIFICATION_INVALID_TYPE",
        LOG_MESSAGES.PUSH_NOTIFICATION_INVALID_TYPE(notificationType),
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_invalid_type",
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          notificationType,
          targetUserIds,
        },
        request
      );
      throwBusinessError("INVALID_NOTIFICATION_TYPE", {
        operation: "send_push_notification",
        notificationType,
      });
    }

    // 시스템 설정 및 아이콘/배지 설정
    const settings = await getSystemSettings();
    const notificationIcon =
      icon ||
      (settings?.notificationIcon
        ? settings.notificationIcon
        : "/icon-192x192.png");
    const notificationBadge =
      badge ||
      (settings?.notificationBadge
        ? settings.notificationBadge
        : "/icon-192x192.png");

    // VAPID 키 초기화
    if (!(await initializeVapidKeys())) {
      await createSystemLog(
        "PUSH_NOTIFICATION_VAPID_INIT_FAILED",
        LOG_MESSAGES.PUSH_NOTIFICATION_VAPID_INIT_FAILED(),
        "error",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_vapid_init_failed",
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          notificationType,
          targetUserIds,
        },
        request
      );
      throwBusinessError("VAPID_KEYS_NOT_SET", {
        operation: "send_push_notification",
      });
    }

    // 구독자 조회
    let subscriptions;

    try {
      if (targetUserIds?.length > 0) {
        // 특정 사용자들에게만 발송 (활성 구독만)
        subscriptions = await prisma.push_subscriptions.findMany({
          where: {
            user_id: {
              in: targetUserIds,
            },
            is_active: true, // 활성 구독만
            deleted_at: null, // 삭제되지 않은 구독만
          },
        });
      } else {
        // 브로드캐스트: 모든 활성 구독자에게 발송
        subscriptions = await prisma.push_subscriptions.findMany({
          where: {
            is_active: true, // 활성 구독만
            deleted_at: null, // 삭제되지 않은 구독만
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await createSystemLog(
        "PUSH_NOTIFICATION_SUBSCRIBER_FETCH_FAILED",
        LOG_MESSAGES.PUSH_NOTIFICATION_SUBSCRIBER_FETCH_FAILED(errorMessage),
        "error",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_subscriber_fetch_failed",
          subscriptionError: errorMessage,
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          notificationType,
          targetUserIds,
        },
        request
      );
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "pushSubscription",
        },
        error
      );
    }

    if (!subscriptions?.length) {
      // 구독자가 없는 경우 로그 기록
      await createSystemLog(
        "PUSH_NOTIFICATION_NO_SUBSCRIBERS",
        LOG_MESSAGES.PUSH_NOTIFICATION_NO_SUBSCRIBERS(),
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_no_subscribers",
          user_id: user?.id,
          user_email: user?.email,
          notification_type: notificationType,
          target_user_ids: targetUserIds,
          title,
          message,
        },
        request
      );

      return NextResponse.json(
        {
          message:
            "발송할 구독자가 없습니다. (푸시 알림을 구독한 사용자가 없음)",
          sentCount: 0,
        },
        { status: 200 }
      );
    }

    // 구독자의 사용자 ID 추출 (중복 제거)
    const userIds = Array.from(
      new Set(subscriptions.map((sub: any) => sub.user_id))
    );

    // 알림 설정 조회
    let notificationSettings;
    try {
      notificationSettings = await prisma.user_notification_settings.findMany({
        where: {
          user_id: {
            in: userIds,
          },
          is_active: true,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await createSystemLog(
        "PUSH_NOTIFICATION_SETTINGS_FETCH_FAILED",
        LOG_MESSAGES.PUSH_NOTIFICATION_SETTINGS_FETCH_FAILED(errorMessage),
        "error",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_settings_fetch_failed",
          settingsError: errorMessage,
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          notificationType,
          targetUserIds,
        },
        request
      );
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "notificationSettings",
        },
        error
      );
    }

    // 설정 맵 생성 (빠른 조회를 위해)
    const settingsMap = new Map();
    notificationSettings?.forEach((setting: any) => {
      settingsMap.set(setting.user_id, setting);
    });

    // 알림 설정에 따라 필터링
    const filteredSubscriptions = subscriptions.filter((subscription: any) => {
      const userSettings = settingsMap.get(subscription.user_id);

      // 알림 설정이 없는 경우 기본적으로 알림 발송하지 않음
      if (!userSettings) {
        return false;
      }

      // 알림 설정이 있고 비활성화된 경우에만 제외
      if (userSettings.is_active === false) {
        return false;
      }

      // 알림 유형별 설정 확인
      const alertField = `${notificationType}_alerts`;
      const isEnabled = userSettings[alertField] !== false;

      return isEnabled;
    });

    if (!filteredSubscriptions || filteredSubscriptions.length === 0) {
      // 알림 설정으로 인해 필터링된 경우 로그 기록
      await createSystemLog(
        "PUSH_NOTIFICATION_FILTERED_OUT",
        LOG_MESSAGES.PUSH_NOTIFICATION_FILTERED_OUT(
          subscriptions.length,
          notificationType
        ),
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_filtered_out",
          user_id: user?.id,
          user_email: user?.email,
          notification_type: notificationType,
          total_subscribers: subscriptions.length,
          filtered_subscribers: 0,
          target_user_ids: targetUserIds,
          title,
          message,
          settings_summary: {
            total_settings: userIds.length,
            active_settings: notificationSettings?.length || 0,
          },
        },
        request
      );

      return NextResponse.json(
        {
          message:
            "발송할 구독자가 없습니다. (알림 설정으로 인해 모든 구독자가 필터링됨)",
          sentCount: 0,
        },
        { status: 200 }
      );
    }

    // 푸시 알림 페이로드 생성
    const notificationPayload = {
      title,
      body: message,
      icon: notificationIcon,
      badge: notificationBadge,
      tag: `farm-notification-${notificationType}-${Date.now()}`,
      requireInteraction:
        requireInteraction || settings?.pushRequireInteraction || false,
      silent: !(settings?.pushSoundEnabled || false),
      vibrate: settings?.pushVibrateEnabled ? [200, 100, 200] : undefined,
      actions: [
        {
          action: "view",
          title: "확인하기",
          icon: notificationIcon,
        },
        {
          action: "dismiss",
          title: "닫기",
        },
      ],
      data: {
        url,
        timestamp: Date.now(),
        type: notificationType,
      },
    };

    // 필터링된 구독자에게만 푸시 알림 발송
    const sendPromises = filteredSubscriptions.map(
      async (subscription: any) => {
        try {
          const result = await sendPushWithRetry(
            subscription,
            JSON.stringify(notificationPayload)
          );

          // 성공 시 fail_count 초기화 및 last_used_at 업데이트
          if (result.success) {
            try {
              await prisma.push_subscriptions.update({
                where: { id: subscription.id },
                data: {
                  fail_count: 0,
                  last_used_at: new Date(),
                  updated_at: new Date(),
                },
              });
            } catch (updateError) {
              throwBusinessError(
                "GENERAL_UPDATE_FAILED",
                {
                  resourceType: "pushSubscription",
                },
                updateError
              );
            }
          }

          return {
            success: result.success,
            subscriptionId: subscription.id,
            error: result.error,
            retryCount: result.retryCount,
          };
        } catch (error: any) {
          devLog.error(`푸시 발송 실패 (구독 ID: ${subscription.id}):`, error);

          // 실패 시 fail_count 증가 및 last_fail_at 업데이트
          const newFailCount = (subscription.fail_count || 0) + 1;

          try {
            await prisma.push_subscriptions.update({
              where: { id: subscription.id },
              data: {
                fail_count: newFailCount,
                last_fail_at: new Date(),
                updated_at: new Date(),
              },
            });
          } catch (updateError) {
            throwBusinessError(
              "GENERAL_UPDATE_FAILED",
              {
                resourceType: "pushSubscription",
              },
              updateError
            );
          }

          // 410 Gone 에러이거나 fail_count가 5회 이상인 경우 구독 비활성화
          if (error.statusCode === 410 || newFailCount >= 5) {
            try {
              await prisma.push_subscriptions.update({
                where: { id: subscription.id },
                data: {
                  is_active: false,
                  deleted_at: new Date(),
                  updated_at: new Date(),
                },
              });
            } catch (deactivateError) {
              throwBusinessError(
                "GENERAL_UPDATE_FAILED",
                {
                  resourceType: "pushSubscription",
                },
                deactivateError
              );
            }
          }

          return {
            success: false,
            subscriptionId: subscription.id,
            error: "PUSH_SEND_FAILED",
            statusCode: error.statusCode,
            userId: subscription.user_id,
          };
        }
      }
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // 실패한 경우 요약 로그 기록
    if (failureCount > 0) {
      // 실패 통계 수집
      const failureStats = results
        .filter((r) => !r.success)
        .reduce((acc, result) => {
          const errorType =
            result.statusCode === 410
              ? "410_GONE"
              : result.statusCode === 404
              ? "404_NOT_FOUND"
              : result.statusCode === 429
              ? "429_RATE_LIMIT"
              : "OTHER";

          acc[errorType] = (acc[errorType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      await createSystemLog(
        "PUSH_NOTIFICATION_SEND_FAILED",
        LOG_MESSAGES.PUSH_NOTIFICATION_SEND_FAILED(
          `실패 ${failureCount}건: ${Object.entries(failureStats)
            .map(([type, count]) => `${type}: ${count}건`)
            .join(", ")}`
        ),
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "push_notification",
        {
          action_type: "push_notification_event",
          event: "push_notification_send_failed",
          notification_type: notificationType,
          user_id: user?.id,
          user_email: user?.email,
          title,
          message,
          total_attempts: filteredSubscriptions.length,
          success_count: successCount,
          failure_count: failureCount,
          failure_stats: failureStats,
          target_user_ids: targetUserIds,
          // 첫 번째 실패 사례만 상세 정보 포함
          first_failure_example: results.find((r) => !r.success)
            ? {
                subscription_id: results.find((r) => !r.success)
                  ?.subscriptionId,
                user_id: results.find((r) => !r.success)?.userId,
                error_message: results.find((r) => !r.success)?.error,
                status_code: results.find((r) => !r.success)?.statusCode,
              }
            : null,
        },
        request
      );
    }

    // 시스템 로그 기록
    await createSystemLog(
      "PUSH_NOTIFICATION_SENT",
      LOG_MESSAGES.PUSH_NOTIFICATION_SENT(successCount, failureCount),
      "info",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      "push_notification",
      {
        action_type: "push_notification_event",
        event: "push_notification_sent",
        notification_type: notificationType,
        user_id: user?.id,
        user_email: user?.email,
        title,
        message,
        total_subscribers: subscriptions.length,
        filtered_subscribers: filteredSubscriptions.length,
        success_count: successCount,
        failure_count: failureCount,
        target_user_ids: targetUserIds,
        settings_summary: {
          total_settings: userIds.length,
          active_settings: notificationSettings?.length || 0,
        },
        payload_info: {
          has_icon: !!notificationIcon,
          has_badge: !!notificationBadge,
          require_interaction:
            requireInteraction || settings?.pushRequireInteraction || false,
          sound_enabled: settings?.pushSoundEnabled || false,
          vibrate_enabled: settings?.pushVibrateEnabled || false,
        },
      },
      request
    );

    return NextResponse.json(
      {
        success: true,
        message: `푸시 알림이 성공적으로 발송되었습니다. (성공: ${successCount}명, 실패: ${failureCount}명)`,
        sentCount: successCount,
        failureCount,
        totalAttempts: filteredSubscriptions.length,
        stats: {
          success: successCount,
          failure: failureCount,
          total: filteredSubscriptions.length,
          successRate:
            filteredSubscriptions.length > 0
              ? Math.round((successCount / filteredSubscriptions.length) * 100)
              : 0,
        },
        results,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    // 푸시 알림 발송 시스템 오류 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "PUSH_NOTIFICATION_SYSTEM_ERROR",
      LOG_MESSAGES.PUSH_NOTIFICATION_SYSTEM_ERROR(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      "push_notification",
      {
        action_type: "push_notification_event",
        event: "push_notification_system_error",
        error_message: errorMessage,
        user_id: user?.id,
        user_email: user?.email,
        title: body?.title,
        message: body?.message,
        notification_type: body?.notificationType,
        target_user_ids: body?.targetUserIds,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "send_push_notification",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
