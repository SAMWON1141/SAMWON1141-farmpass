import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import { getUserAgent } from "@/lib/server/ip-helpers";

/**
 * 푸시 구독 데이터 무결성 검증
 * @param subscription 구독 데이터
 * @returns 검증 결과
 */
function validateSubscriptionData(subscription: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 필수 필드 검증
  if (!subscription?.endpoint) {
    errors.push("endpoint가 필요합니다.");
  }

  if (!subscription?.keys?.p256dh) {
    errors.push("p256dh 키가 필요합니다.");
  }

  if (!subscription?.keys?.auth) {
    errors.push("auth 키가 필요합니다.");
  }

  // endpoint URL 형식 검증
  if (subscription?.endpoint && !subscription.endpoint.startsWith("https://")) {
    errors.push("endpoint는 HTTPS URL이어야 합니다.");
  }

  // 키 길이 검증 (기본적인 형식 검증)
  if (subscription?.keys?.p256dh && subscription.keys.p256dh.length < 80) {
    errors.push("p256dh 키가 너무 짧습니다.");
  }

  if (subscription?.keys?.auth && subscription.keys.auth.length < 20) {
    errors.push("auth 키가 너무 짧습니다.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 푸시 구독 등록
export async function POST(request: NextRequest) {
  const userAgent = getUserAgent(request);
  let user = null;
  let body: any = null;

  try {
    // 사용자 인증 확인
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    body = await request.json();
    const { subscription, deviceId, options } = body;
    // 더 이상 사용하지 않음 - 항상 전체 구독으로 통합

    if (!subscription || !subscription.endpoint) {
      throwBusinessError("INCOMPLETE_SUBSCRIPTION");
    }

    // 구독 데이터 무결성 검증
    const validation = validateSubscriptionData(subscription);
    if (!validation.valid) {
      devLog.error("구독 데이터 검증 실패:", validation.errors);
      throwBusinessError("SUBSCRIPTION_VALIDATION_FAILED", {
        errors: validation.errors,
      });
    }

    // 기존 구독 확인 및 등록/갱신을 upsert로 통합
    let newSubscription;
    try {
      newSubscription = await prisma.push_subscriptions.upsert({
        where: {
          // user_id와 device_id의 복합 unique 인덱스
          user_id_device_id: {
            user_id: user.id,
            device_id: deviceId || null,
          },
        },
        update: {
          is_active: true,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh || null,
          auth: subscription.keys?.auth || null,
          device_id: deviceId || null,
          user_agent: userAgent || null,
          last_used_at: new Date(),
          fail_count: 0,
          deleted_at: null,
          updated_at: new Date(),
        },
        create: {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh || null,
          auth: subscription.keys?.auth || null,
          device_id: deviceId || null,
          user_agent: userAgent || null,
          is_active: true,
          fail_count: 0,
          last_used_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (upsertError) {
      throwBusinessError(
        "GENERAL_UPDATE_FAILED",
        {
          resourceType: "pushSubscription",
        },
        upsertError
      );
    }

    // 알림 설정 업데이트 (options.updateSettings가 true인 경우에만)
    if (options?.updateSettings !== false) {
      let existingSettings;
      try {
        existingSettings = await prisma.user_notification_settings.findUnique({
          where: { user_id: user.id },
        });
      } catch (queryError) {
        throwBusinessError(
          "GENERAL_QUERY_FAILED",
          {
            resourceType: "notificationSettings",
          },
          queryError
        );
      }

      if (!existingSettings) {
        try {
          await prisma.user_notification_settings.create({
            data: {
              user_id: user.id,
              notification_method: "push",
              visitor_alerts: true,
              system_alerts: true,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        } catch (createError) {
          throwBusinessError(
            "GENERAL_CREATE_FAILED",
            {
              resourceType: "notificationSettings",
            },
            createError
          );
        }
      } else if (options?.isResubscribe) {
        try {
          await prisma.user_notification_settings.update({
            where: { user_id: user.id },
            data: { is_active: true, updated_at: new Date() },
          });
        } catch (updateError) {
          throwBusinessError(
            "GENERAL_UPDATE_FAILED",
            {
              resourceType: "notificationSettings",
            },
            updateError
          );
        }
      }
    }

    // 푸시 구독 성공 시 시스템 로그 기록 (기본 동작)
    await createSystemLog(
      "PUSH_SUBSCRIPTION_CREATED",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_CREATED(newSubscription.endpoint),
      "info",
      { id: user.id, email: user.email || "" },
      "system",
      newSubscription.endpoint,
      {
        action_type: "push_notification_event",
        event: "push_subscription_created",
        user_id: user.id,
        user_email: user.email,
        endpoint: newSubscription.endpoint,
        device_id: deviceId,
        user_agent: userAgent,
        is_active: newSubscription.is_active,
        fail_count: newSubscription.fail_count,
      },
      request
    );

    return NextResponse.json(
      {
        success: true,
        message: "푸시 알림 구독이 완료되었습니다.",
        subscription: newSubscription,
      },
      { status: 201 }
    );
  } catch (error) {
    // 푸시 구독 생성 시스템 오류 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "PUSH_SUBSCRIPTION_CREATE_FAILED",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_CREATE_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      body?.subscription?.endpoint || "unknown_endpoint", // endpoint를 resourceId로 사용
      {
        action_type: "push_notification_event",
        event: "push_subscription_create_failed",
        error_message: errorMessage,
        user_id: user?.id,
        user_email: user?.email,
        endpoint: body?.subscription?.endpoint,
        device_id: body?.deviceId,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "create_push_subscription",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}

// 푸시 구독 조회
export async function GET(request: NextRequest) {
  let user = null;

  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    let whereCondition: any = {
      user_id: user.id,
    };

    let subscriptions;
    try {
      subscriptions = await prisma.push_subscriptions.findMany({
        where: whereCondition,
      });
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "pushSubscription",
        },
        queryError
      );
    }

    // 구독 유효성 검사 (만료된 구독 감지)
    let expiredCount = 0;
    const validSubscriptions = [];

    if (subscriptions && subscriptions.length > 0) {
      // VAPID 키 설정 확인
      // 환경변수 우선, 없으면 시스템 설정에서 조회
      const envPublicKey = process.env.VAPID_PUBLIC_KEY;
      const envPrivateKey = process.env.VAPID_PRIVATE_KEY;
      let publicKey: string | undefined = envPublicKey;
      let privateKey: string | undefined = envPrivateKey;
      if (!publicKey || !privateKey) {
        let settings;
        try {
          settings = await prisma.system_settings.findFirst({
            select: {
              vapidPublicKey: true,
              vapidPrivateKey: true,
            },
          });
        } catch (queryError) {
          throwBusinessError(
            "GENERAL_QUERY_FAILED",
            {
              resourceType: "systemSettings",
            },
            queryError
          );
        }
        publicKey = publicKey || settings?.vapidPublicKey || undefined;
        privateKey = privateKey || settings?.vapidPrivateKey || undefined;
      }
      if (publicKey && privateKey) {
        const webpush = require("web-push");
        webpush.setVapidDetails("mailto:admin@demo.com", publicKey, privateKey);

        // 각 구독의 유효성 검사
        for (const subscription of subscriptions) {
          try {
            // 실제로는 발송하지 않고 구독 객체만 검증
            if (
              subscription.endpoint &&
              subscription.p256dh &&
              subscription.auth
            ) {
              validSubscriptions.push(subscription);
            } else {
              devLog.warn("구독 정보 불완전:", subscription);
              continue; // 이 구독은 건너뛰고 다음 구독으로
            }
          } catch (error: any) {
            // 만료된 구독으로 간주하고 삭제
            expiredCount++;
            try {
              await prisma.push_subscriptions.delete({
                where: {
                  id: subscription.id,
                },
              });
            } catch (deleteError) {
              throwBusinessError(
                "GENERAL_DELETE_FAILED",
                {
                  resourceType: "pushSubscription",
                },
                deleteError
              );
            }
          }
        }
      } else {
        // VAPID 키가 없으면 모든 구독을 유효한 것으로 간주
        validSubscriptions.push(...subscriptions);
      }
    }

    const response = {
      subscriptions: validSubscriptions,
      ...(expiredCount > 0 && { expiredCount }),
    };

    // 구독 조회 성공 시 시스템 로그 기록
    await createSystemLog(
      "PUSH_SUBSCRIPTION_READ",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_READ(),
      "info",
      { id: user.id, email: user.email || "" },
      "system",
      undefined,
      {
        action_type: "push_notification_event",
        event: "push_subscription_read",
        user_id: user.id,
        user_email: user.email,
      },
      request
    );

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    // 푸시 구독 조회 시스템 오류 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "PUSH_SUBSCRIPTION_READ_FAILED",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_READ_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      user?.id || "unknown_user", // user ID를 resourceId로 사용
      {
        action_type: "push_notification_event",
        event: "push_subscription_read_failed",
        error_message: errorMessage,
        user_id: user?.id,
        user_email: user?.email,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "get_push_subscriptions",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}

// 푸시 구독 해제
export async function DELETE(request: NextRequest) {
  let body: any = null;
  let user = null;

  try {
    body = await request.json();
    const { endpoint, forceDelete, options } = body;

    if (!endpoint) {
      throwBusinessError("MISSING_ENDPOINT", {
        operation: "delete_push_subscription",
      });
    }

    // forceDelete가 true인 경우 (특수한 경우에만 사용) 인증 없이 endpoint로만 삭제
    if (forceDelete) {
      try {
        // 강제 삭제 시에는 실제 삭제 (soft delete 아님)
        const deletedSubscriptions = await prisma.push_subscriptions.deleteMany(
          {
            where: {
              endpoint: endpoint,
            },
          }
        );

        await createSystemLog(
          "PUSH_SUBSCRIPTION_FORCE_DELETED",
          LOG_MESSAGES.PUSH_SUBSCRIPTION_FORCE_DELETED(endpoint),
          "info",
          undefined,
          "notification",
          endpoint, // endpoint를 resourceId로 사용
          {
            action_type: "push_notification_event",
            event: "push_subscription_force_deleted",
            endpoint,
            deletedCount: deletedSubscriptions.count,
          },
          request
        );

        return NextResponse.json({
          success: true,
          message: "구독이 강제로 해제되었습니다.",
          deletedCount: deletedSubscriptions.count,
        });
      } catch (deleteError) {
        throwBusinessError(
          "GENERAL_DELETE_FAILED",
          {
            resourceType: "pushSubscription",
          },
          deleteError
        );
      }
    }

    // 일반적인 경우 - 인증 필요
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    // 구독 정보 조회 (soft delete 전에 정보 확인)
    let existingSubscriptions;
    try {
      existingSubscriptions = await prisma.push_subscriptions.findMany({
        where: {
          user_id: user.id,
          endpoint: endpoint,
          is_active: true, // 활성 구독만
        },
      });
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "pushSubscription",
        },
        queryError
      );
    }

    if (existingSubscriptions.length === 0) {
      throwBusinessError("GENERAL_NOT_FOUND", {
        resourceType: "pushSubscription",
      });
    }

    // 구독 soft delete (전체 구독 해제)
    let updateResult;
    try {
      updateResult = await prisma.push_subscriptions.updateMany({
        where: {
          user_id: user.id,
          endpoint: endpoint,
          is_active: true, // 활성 구독만
        },
        data: {
          is_active: false,
          deleted_at: new Date(),
          updated_at: new Date(),
          // fail_count는 0으로 초기화 (수동 해제이므로)
          fail_count: 0,
          last_fail_at: null,
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

    // 알림 설정 업데이트 (options.updateSettings가 true인 경우에만)
    if (options?.updateSettings !== false) {
      try {
        // 구독 해제 시 알림 설정 비활성화
        await prisma.user_notification_settings.update({
          where: { user_id: user.id },
          data: {
            is_active: false,
            updated_at: new Date(),
          },
        });
      } catch (updateError) {
        throwBusinessError(
          "GENERAL_UPDATE_FAILED",
          {
            resourceType: "notificationSettings",
          },
          updateError
        );
      }
    }

    // 시스템 로그 기록 (상세 정보 포함)
    await createSystemLog(
      "PUSH_SUBSCRIPTION_DELETED",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_DELETED(endpoint),
      "info",
      { id: user.id, email: user.email || "" },
      "system",
      endpoint,
      {
        action_type: "push_notification_event",
        event: "push_subscription_deleted",
        user_email: user.email,
        user_id: user.id,
        endpoint,
        deletedCount: updateResult.count,
        deviceIds: existingSubscriptions
          .map((sub: any) => sub.device_id)
          .filter(Boolean),
        updateSettings: options?.updateSettings !== false,
      },
      request
    );

    return NextResponse.json(
      {
        success: true,
        message: "푸시 알림 구독이 해제되었습니다.",
        deletedCount: updateResult.count,
        endpoint,
      },
      { status: 200 }
    );
  } catch (error) {
    // 푸시 구독 삭제 시스템 오류 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "PUSH_SUBSCRIPTION_DELETE_FAILED",
      LOG_MESSAGES.PUSH_SUBSCRIPTION_DELETE_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      body?.endpoint || "unknown_endpoint", // endpoint를 resourceId로 사용
      {
        action_type: "push_notification_event",
        event: "push_subscription_delete_failed",
        error_message: errorMessage,
        endpoint: body?.endpoint,
        force_delete: body?.forceDelete,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "delete_push_subscription",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
