import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";

// 동적 렌더링 강제
export const dynamic = "force-dynamic";

// GET: 알림 설정 조회
export async function GET(request: NextRequest) {
  let user = null;
  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    let settings;
    try {
      settings = await prisma.user_notification_settings.findUnique({
        where: {
          user_id: user.id,
        },
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

    if (!settings) {
      return NextResponse.json(
        {
          id: null,
          user_id: user.id,
          notification_method: "push",
          visitor_alerts: true,
          system_alerts: true,
          kakao_user_id: null,
          is_active: false,
          created_at: null,
          updated_at: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(settings, {
      status: 200,
    });
  } catch (error) {
    // 시스템 예외 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "NOTIFICATION_SETTINGS_QUERY_FAILED",
      LOG_MESSAGES.NOTIFICATION_SETTINGS_QUERY_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "notification",
      user?.id,
      {
        action_type: "notification_event",
        event: "notification_settings_query_failed",
        error_message: errorMessage,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "get_notification_settings",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}

// PUT: 알림 설정 업데이트
export async function PUT(request: NextRequest) {
  let user = null;
  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    const body = await request.json();
    let existingSettings;
    try {
      existingSettings = await prisma.user_notification_settings.findUnique({
        where: {
          user_id: user.id,
        },
        select: {
          id: true,
        },
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

    let result;
    if (existingSettings) {
      // 기존 레코드 업데이트 시 updated_at 자동 설정
      const { updated_at, ...updateData } = body;
      const now = new Date();

      try {
        result = await prisma.user_notification_settings.update({
          where: {
            user_id: user.id,
          },
          data: {
            ...updateData,
            updated_at: now,
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
    } else {
      // 새 레코드 생성 시 id 필드 제외하고 타임스탬프 설정
      const { id, created_at, updated_at, ...insertData } = body;
      const now = new Date();

      try {
        result = await prisma.user_notification_settings.create({
          data: {
            ...insertData,
            user_id: user.id,
            created_at: now,
            updated_at: now,
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
    }

    // 성공 로그
    await createSystemLog(
      "NOTIFICATION_SETTINGS_UPDATED",
      LOG_MESSAGES.NOTIFICATION_SETTINGS_UPDATED(user.email || user.id),
      "info",
      { id: user.id, email: user.email || "" },
      "notification",
      user?.id,
      {
        user_id: user.id,
        updated_fields: Object.keys(result),
        action_type: "notification_event",
        event: "notification_settings_updated",
      },
      request
    );

    return NextResponse.json({
      ...result,
      success: true,
      message: existingSettings
        ? "알림 설정이 성공적으로 업데이트되었습니다."
        : "알림 설정이 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    // 시스템 예외 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "NOTIFICATION_SETTINGS_UPDATE_FAILED",
      LOG_MESSAGES.NOTIFICATION_SETTINGS_UPDATE_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "notification",
      user?.id,
      {
        action_type: "notification_event",
        event: "notification_settings_update_failed",
        error_message: errorMessage,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "update_notification_settings",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
