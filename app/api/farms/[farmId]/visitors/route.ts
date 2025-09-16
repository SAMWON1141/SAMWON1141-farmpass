import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import {
  getSystemSettings,
  invalidateSystemSettingsCache,
} from "@/lib/cache/system-settings-cache";
import {
  processVisitTemplate,
  createVisitTemplateData,
} from "@/lib/utils/notification/notification-template";
import { devLog } from "@/lib/utils/logging/dev-logger";
import {
  visitorRegistrationRateLimiter,
  createRateLimitHeaders,
} from "@/lib/utils/system/rate-limit";
import { logSecurityError } from "@/lib/utils/logging/system-log";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import { getClientIP } from "@/lib/server/ip-helpers";
import {
  createVisitorFormSchema,
  type VisitorFormData,
} from "@/lib/utils/validation/visitor-validation";

// 농장 멤버들에게 푸시 알림 발송 함수
async function sendVisitorNotificationToFarmMembers(
  farmId: string,
  visitorData: {
    visitor_name: string;
    visitor_phone?: string;
    visitor_purpose?: string;
    vehicle_number?: string;
    disinfection_check?: boolean;
  },
  farmName: string,
  visitDateTime: Date = new Date()
) {
  try {
    // 시스템 설정에서 방문 알림 템플릿 가져오기 (캐시 무효화 후 조회)
    invalidateSystemSettingsCache();
    const settings = await getSystemSettings();

    // 템플릿 데이터 생성
    const templateData = createVisitTemplateData(
      visitorData,
      farmName,
      visitDateTime
    );

    // 템플릿을 사용하여 메시지 생성
    const notificationMessage = processVisitTemplate(
      settings.visitTemplate,
      templateData
    );

    // 농장 소유자와 멤버들의 알림 설정 조회
    let farmMembersWithNotifications;
    try {
      farmMembersWithNotifications = (await prisma.$queryRaw`
        SELECT DISTINCT u.id, u.email, uns.notification_method, uns.visitor_alerts
        FROM auth.users u
        LEFT JOIN public.user_notification_settings uns ON u.id = uns.user_id
        WHERE (
          u.id IN (
            SELECT owner_id FROM public.farms WHERE id = ${farmId}::uuid
            UNION
            SELECT user_id FROM public.farm_members WHERE farm_id = ${farmId}::uuid
          )
        )
        AND uns.notification_method = 'push'
        AND uns.visitor_alerts = true
      `) as Array<{
        id: string;
        email: string;
        notification_method: string | null;
        visitor_alerts: boolean | null;
      }>;
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "notificationSettings",
        },
        queryError
      );
    }

    if (!farmMembersWithNotifications?.length) {
      return;
    }

    // 각 멤버에게 개별적으로 알림 발송
    for (const member of farmMembersWithNotifications) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/push/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "node-fetch/3.0.0", // 시스템 사용자로 처리
            },
            body: JSON.stringify({
              targetUserIds: [member.id],
              farmId,
              title: "새로운 방문자 등록",
              message: notificationMessage,
              url: `/admin/farms/${farmId}/visitors`,
              notificationType: "visitor",
            }),
          }
        );

        if (!response.ok) {
          devLog.error(
            `멤버 ${member.email}에게 푸시 알림 발송 실패:`,
            await response.text()
          );
        }
      } catch (error) {
        devLog.error(`멤버 ${member.email}에게 푸시 알림 발송 중 오류:`, error);
      }
    }
  } catch (error) {
    devLog.error("농장 멤버 푸시 알림 발송 중 오류:", error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  const clientIP = getClientIP(request);

  // 🚦 방문자 등록 전용 Rate Limiting 체크
  // IP당 1분에 10회 방문자 등록 제한
  const rateLimitResult = visitorRegistrationRateLimiter.checkLimit(clientIP);

  if (!rateLimitResult.allowed) {
    // Rate limit 초과 시 보안 로그 기록
    await logSecurityError(
      "RATE_LIMIT_EXCEEDED",
      LOG_MESSAGES.VISITOR_RATE_LIMIT_EXCEEDED(request),
      undefined,
      request
    );

    // getErrorResultFromRawError 사용
    const result = getErrorResultFromRawError(
      {
        code: "RATE_LIMIT_EXCEEDED",
        params: { retryAfter: rateLimitResult.retryAfter },
      },
      { operation: "visitor_registration", rateLimitResult: rateLimitResult }
    );

    const response = NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });

    // Rate limit 헤더 추가
    const headers = createRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  const farmId = params.farmId;
  let visitorData: VisitorFormData | undefined;
  let farm: { id: string; farm_name: string; owner_id: string } | null = null;

  try {
    // 시스템 설정 조회 (ZOD 스키마 생성을 위해 먼저 조회)
    invalidateSystemSettingsCache();
    const settings = await getSystemSettings();

    const requestData: VisitorFormData = await request.json();

    // ZOD 스키마로 검증
    const visitorSchema = createVisitorFormSchema(settings);
    const validation = visitorSchema.safeParse(requestData);
    if (!validation.success) {
      throwBusinessError("INVALID_FORM_DATA", {
        errors: validation.error.errors,
        formType: "visitor",
      });
    }
    visitorData = validation.data;
    const cookieStore = cookies();

    // 기존 세션 토큰 확인
    const sessionToken = cookieStore.get("visitor_session")?.value;
    if (sessionToken) {
      // 세션으로 최근 방문 기록 조회
      let lastVisit;
      try {
        lastVisit = await prisma.visitor_entries.findFirst({
          where: {
            farm_id: farmId,
            session_token: sessionToken,
          },
          orderBy: {
            visit_datetime: "desc",
          },
        });
      } catch (queryError) {
        throwBusinessError(
          "GENERAL_QUERY_FAILED",
          {
            resourceType: "visitor",
          },
          queryError
        );
      }

      if (lastVisit) {
        // 마지막 방문 시간과 현재 시간의 차이 계산 (시간 단위)
        const hoursSinceLastVisit =
          (Date.now() - new Date(lastVisit.visit_datetime).getTime()) /
          (1000 * 60 * 60);

        // 재방문 제한 기간 체크
        if (hoursSinceLastVisit < settings.reVisitAllowInterval) {
          const remainingHours = Math.ceil(
            settings.reVisitAllowInterval - hoursSinceLastVisit
          );
          throwBusinessError("RE_VISIT_LIMIT_EXCEEDED", {
            operation: "visitor_registration",
            remainingHours: remainingHours,
            reVisitAllowInterval: settings.reVisitAllowInterval,
          });
        } else {
          // 재방문 제한 기간이 지났으면 기존 세션 삭제
          cookies().delete("visitor_session");
        }
      }
    }

    // 재방문 허용 간격(시간)을 밀리초로 변환
    // const sessionDuration = settings.reVisitAllowInterval * 60 * 60 * 1000;

    // 새로운 세션 토큰 생성
    const newSessionToken = uuidv4();

    // 세션 토큰을 쿠키에 저장
    // 폼 자동완성을 위해 30일 고정으로 설정
    const cookieExpiresMs = 30 * 24 * 60 * 60 * 1000; // 30일

    cookieStore.set("visitor_session", newSessionToken, {
      expires: new Date(Date.now() + cookieExpiresMs),
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    // 농장 정보 조회
    try {
      farm = await prisma.farms.findUnique({
        where: { id: farmId },
        select: { id: true, farm_name: true, owner_id: true },
      });
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "farm",
        },
        queryError
      );
    }

    if (!farm) {
      throwBusinessError("FARM_NOT_FOUND", {
        operation: "visitor_registration",
        farmId: farmId,
      });
    }

    // 오늘 방문자 수 체크 (일일 제한)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    let todayCount;
    try {
      todayCount = await prisma.visitor_entries.count({
        where: {
          farm_id: farmId,
          visit_datetime: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "visitor",
        },
        queryError
      );
    }
    if (todayCount >= settings.maxVisitorsPerDay) {
      // 일일 방문자 수 초과 로그
      await createSystemLog(
        "VISITOR_DAILY_LIMIT_EXCEEDED",
        LOG_MESSAGES.VISITOR_DAILY_LIMIT_EXCEEDED(
          todayCount,
          settings.maxVisitorsPerDay,
          farm.farm_name,
          visitorData.visitor_name
        ),
        "warn",
        undefined,
        "visitor",
        farmId,
        {
          action_type: "visitor_event",
          event: "visitor_daily_limit_exceeded",
          farm_id: farmId,
          farm_name: farm.farm_name,
          count: todayCount,
          maxVisitorsPerDay: settings.maxVisitorsPerDay,
          visitor_name: visitorData.visitor_name,
        },
        request
      );
      return NextResponse.json(
        {
          message: `오늘 방문자 등록 한도(${settings.maxVisitorsPerDay}명)를 초과했습니다.`,
          error: "DAILY_LIMIT_EXCEEDED",
        },
        { status: 400 }
      );
    }

    // 방문자 데이터 저장 (Prisma 사용하되 실시간 위해 활용)
    // 방문자 등록 + 알림 트랜잭션 처리
    const visitorCreateData = {
      farm_id: farmId,
      visit_datetime: new Date(),
      visitor_name: visitorData!.visitor_name.trim(),
      visitor_phone: visitorData!.visitor_phone?.trim() || "",
      visitor_address: `${visitorData!.visitor_address?.trim() || ""}${
        visitorData!.detailed_address?.trim()
          ? " " + visitorData!.detailed_address.trim()
          : ""
      }`,
      vehicle_number: visitorData!.vehicle_number?.trim() || null,
      visitor_purpose: visitorData!.visitor_purpose?.trim() || null,
      disinfection_check: visitorData!.disinfection_check || false,
      notes: visitorData!.notes?.trim() || null,
      consent_given: visitorData!.consent_given,
      profile_photo_url: visitorData!.profile_photo_url || null,
      session_token: newSessionToken,
    };

    let visitor;
    try {
      visitor = await prisma.$transaction(async (tx: any) => {
        const createdVisitor = await tx.visitor_entries.create({
          data: visitorCreateData,
        });
        const members = await tx.farm_members.findMany({
          where: { farm_id: farmId },
          select: { user_id: true },
        });
        await tx.notifications.createMany({
          data: members.map((m: any) => ({
            user_id: m.user_id,
            type: "visitor_registered",
            title: `새 방문자 등록`,
            message: `${farm!.farm_name} 농장에 방문자가 등록되었습니다: ${
              createdVisitor.visitor_name
            }`,
            data: {
              farm_id: farmId,
              farm_name: farm!.farm_name,
              visitor_id: createdVisitor.id,
              visitor_name: createdVisitor.visitor_name,
            },
            link: `/admin/farms/${farmId}/visitors`,
          })),
        });
        return createdVisitor;
      });
    } catch (transactionError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "visitor",
        },
        transactionError
      );
    }
    // 방문자 등록 성공 로그 생성
    await createSystemLog(
      "VISITOR_CREATED",
      LOG_MESSAGES.VISITOR_CREATED(
        visitorCreateData.visitor_name,
        farm.farm_name
      ),
      "info",
      undefined,
      "visitor",
      visitor.id,
      {
        action_type: "visitor_event",
        event: "visitor_created",
        visitor_id: visitor.id,
        visitor_name: visitorCreateData.visitor_name,
        farm_id: farmId,
        farm_name: farm.farm_name,
      },
      request
    );

    // 농장 멤버들에게 푸시 알림 발송 (비동기로 처리하여 응답 속도에 영향 주지 않음)
    sendVisitorNotificationToFarmMembers(
      farmId,
      {
        visitor_name: String(visitor.visitor_name),
        visitor_phone: visitor.visitor_phone
          ? String(visitor.visitor_phone)
          : undefined,
        visitor_purpose: visitor.visitor_purpose
          ? String(visitor.visitor_purpose)
          : undefined,
        vehicle_number: visitor.vehicle_number
          ? String(visitor.vehicle_number)
          : undefined,
        disinfection_check: Boolean(visitor.disinfection_check) || false,
      },
      farm.farm_name,
      new Date(String(visitor.visit_datetime))
    );

    // 응답 생성 및 쿠키 설정
    return NextResponse.json(
      {
        success: true,
        message: "방문자 등록이 완료되었습니다.",
        visitor,
      },
      { status: 201 }
    );
  } catch (error) {
    // 방문자 등록 실패 로그 생성
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "VISITOR_CREATE_FAILED",
      LOG_MESSAGES.VISITOR_CREATE_FAILED(
        visitorData?.visitor_name || "알 수 없음",
        farmId,
        errorMessage
      ),
      "error",
      undefined,
      "visitor",
      farmId,
      {
        action_type: "visitor_event",
        event: "visitor_create_failed",
        error_message: errorMessage,
        farm_id: farmId,
        farm_name: farm?.farm_name,
        visitor_name: visitorData?.visitor_name || "알 수 없음",
        visitor_data: visitorData,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "visitor_registration",
      farmId: farmId,
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
