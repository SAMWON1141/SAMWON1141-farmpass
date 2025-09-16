import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SYSTEM_SETTINGS } from "@/lib/constants/defaults";
import { invalidateSystemSettingsCache } from "@/lib/cache/system-settings-cache";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";

// 5분마다 재검증
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    let settings;
    try {
      settings = await prisma.system_settings.findFirst();
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "systemSettings",
        },
        queryError
      );
    }

    if (!settings) {
      // 설정이 없으면 기본값으로 생성
      let newSettings;
      try {
        newSettings = await prisma.system_settings.create({
          data: {
            ...DEFAULT_SYSTEM_SETTINGS,
            id: crypto.randomUUID(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      } catch (createError) {
        throwBusinessError(
          "GENERAL_CREATE_FAILED",
          {
            resourceType: "systemSettings",
          },
          createError
        );
      }

      // 초기화 이벤트 로깅 - 통합 로깅 시스템 사용
      await createSystemLog(
        "SETTINGS_INITIALIZE",
        LOG_MESSAGES.SYSTEM_SETTINGS_INITIALIZED(),
        "info",
        undefined,
        "system",
        newSettings.id,
        {
          action_type: "system_settings_event",
          event: "system_settings_initialized",
          settings_count: Object.keys(DEFAULT_SYSTEM_SETTINGS).length,
        },
        request
      );

      return NextResponse.json(newSettings, {
        status: 200,
      });
    }

    return NextResponse.json(settings, {
      status: 200,
    });
  } catch (error: any) {
    const result = getErrorResultFromRawError(error, {
      operation: "get_system_settings",
    });
    const errorResponse = makeErrorResponseFromResult(result);

    return NextResponse.json(errorResponse, {
      status: result.status,
    });
  }
}

export async function PATCH(request: NextRequest) {
  let user = null;
  try {
    // 관리자 권한 인증 확인
    const authResult = await requireAuth(true);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    const data = await request.json();
    let settings;
    try {
      settings = await prisma.system_settings.findFirst();
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "systemSettings",
        },
        queryError
      );
    }

    if (!settings) {
      throwBusinessError("SYSTEM_SETTINGS_NOT_FOUND", {
        operation: "update_system_settings",
      });
    }

    // 변경된 필드 추적 (날짜 필드 제외)
    const changedFields = Object.keys(data).filter(
      (key) =>
        !["created_at", "updated_at"].includes(key) &&
        settings[key as keyof typeof settings] !== data[key]
    );

    let updatedSettings;
    try {
      updatedSettings = await prisma.$transaction(async (tx: any) => {
        // 설정 업데이트
        const updated = await tx.system_settings.update({
          where: { id: settings.id },
          data,
        });

        return updated;
      });
    } catch (transactionError) {
      throwBusinessError(
        "GENERAL_UPDATE_FAILED",
        {
          resourceType: "systemSettings",
        },
        transactionError
      );
    }

    // 실제 변경된 필드가 있을 때만 로그 생성
    if (changedFields.length > 0) {
      // 전체 설정 변경 요약 로그
      await createSystemLog(
        "SETTINGS_BULK_UPDATED",
        LOG_MESSAGES.SYSTEM_SETTINGS_BULK_UPDATED(
          changedFields.length,
          changedFields.join(", ")
        ),
        "info",
        { id: user.id, email: user.email || "" },
        "system",
        settings.id,
        {
          action_type: "system_settings_event",
          event: "system_settings_bulk_updated",
          updated_fields: Object.keys(data),
          changed_fields: changedFields,
        },
        request
      );
    }

    // 캐시 무효화
    invalidateSystemSettingsCache();

    // 성공 메시지 생성
    const message =
      changedFields.length > 0
        ? `${changedFields.length}개의 설정이 성공적으로 업데이트되었습니다.`
        : "설정이 성공적으로 저장되었습니다.";

    return NextResponse.json(
      {
        ...updatedSettings,
        success: true,
        message,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    // 에러 로그 생성
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "SETTINGS_UPDATE_FAILED",
      LOG_MESSAGES.SETTINGS_UPDATE_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      "system_settings",
      {
        action_type: "system_settings_event",
        event: "system_settings_update_failed",
        error_message: errorMessage,
      }
    );
    const result = getErrorResultFromRawError(error, {
      operation: "update_system_settings",
    });
    const errorResponse = makeErrorResponseFromResult(result);
    return NextResponse.json(errorResponse, {
      status: result.status,
    });
  }
}
