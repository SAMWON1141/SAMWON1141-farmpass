import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import {
  visitorRegistrationRateLimiter,
  createRateLimitHeaders,
} from "@/lib/utils/system/rate-limit";
import { logSecurityError } from "@/lib/utils/logging/system-log";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { getClientIP } from "@/lib/server/ip-helpers";

// 동적 렌더링 강제
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAllFarms = searchParams.get("includeAllFarms") === "true";

  // 요청 컨텍스트 정보 추출
  const clientIP = getClientIP(request);
  let user = null;

  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;
    const isAdmin = authResult.isAdmin || false;
    // 🚦 방문자 조회 전용 Rate Limiting 체크
    // IP당 1분에 10회 방문자 조회 제한
    const rateLimitResult = visitorRegistrationRateLimiter.checkLimit(clientIP);

    if (!rateLimitResult.allowed) {
      // Rate limit 초과 시 보안 로그 기록
      await logSecurityError(
        "RATE_LIMIT_EXCEEDED",
        LOG_MESSAGES.RATE_LIMIT_EXCEEDED(clientIP, "/api/visitors"),
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        request
      );

      // getErrorResultFromRawError 사용
      const result = getErrorResultFromRawError(
        {
          code: "RATE_LIMIT_EXCEEDED",
          params: { retryAfter: rateLimitResult.retryAfter },
        },
        { operation: "visitor_list_access", rateLimitResult: rateLimitResult }
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

    // 관리자가 아니거나 includeAllFarms가 false인 경우 권한 제한
    let whereCondition: any = {};
    if (!isAdmin || !includeAllFarms) {
      // 사용자가 소유하거나 관리하는 농장의 방문자만 조회
      let userFarms;
      try {
        userFarms = await prisma.farms.findMany({
          where: {
            OR: [
              { owner_id: user.id },
              {
                farm_members: {
                  some: {
                    user_id: user.id,
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
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

      if (!userFarms || userFarms.length === 0) {
        // 🔒 농장 소속이 없는 사용자는 완전 차단 (403 에러)
        await createSystemLog(
          "VISITOR_ACCESS_DENIED",
          LOG_MESSAGES.VISITOR_ACCESS_DENIED(user.email || ""),
          "warn",
          { id: user.id, email: user.email || "" },
          "visitor",
          user?.id,
          {
            action_type: "visitor_event",
            event: "visitor_access_denied",
            user_id: user.id,
            user_email: user.email || "",
          },
          request
        );

        throwBusinessError("NO_FARM_ACCESS", {
          operation: "access_visitor_data",
          userId: user.id,
        });
      }

      const farmIds = userFarms.map((farm: any) => farm.id);
      whereCondition.farm_id = {
        in: farmIds,
      };
    }

    let visitorData;
    try {
      visitorData = await prisma.visitor_entries.findMany({
        where: whereCondition,
        include: {
          farms: {
            select: {
              id: true,
              farm_name: true,
              farm_type: true,
              farm_address: true,
              owner_id: true,
            },
          },
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

    // 시스템 로그 기록
    await createSystemLog(
      "VISITOR_DATA_ACCESS",
      LOG_MESSAGES.VISITOR_ACCESS(
        visitorData?.length || 0,
        includeAllFarms ? "전체 농장" : "소유 농장"
      ),
      "info",
      { id: user.id, email: user.email || "" },
      "visitor",
      user?.id,
      {
        action_type: "visitor_event",
        event: "visitor_access",
        visitor_count: visitorData?.length || 0,
        access_scope: includeAllFarms ? "all_farms" : "own_farms",
      },
      request
    );

    const responseData = { visitors: visitorData || [] };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        ...createRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    // 방문자 조회 실패 로그 기록
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "VISITOR_QUERY_FAILED",
      LOG_MESSAGES.VISITOR_QUERY_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "visitor",
      user?.id,
      {
        action_type: "visitor_event",
        event: "visitor_query_failed",
        error_message: errorMessage,
        endpoint: "/api/visitors",
        method: "GET",
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "get_visitors",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}

export async function POST(request: NextRequest) {
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

  // 기존 방문자 등록 로직...
  let body: any = null;
  let data: any = null;

  try {
    body = await request.json();

    // 방문자 데이터 검증 및 저장 로직
    try {
      data = await prisma.visitor_entries.create({
        data: body,
      });
    } catch (createError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "visitor",
        },
        createError
      );
    }

    // 방문자 등록 성공 로그 기록
    await createSystemLog(
      "VISITOR_CREATED",
      LOG_MESSAGES.VISITOR_CREATED(
        data.visitor_name || "Unknown",
        data.farm_id || "Unknown"
      ),
      "info",
      undefined,
      "visitor",
      data.id,
      {
        action_type: "visitor_event",
        event: "visitor_created",
        visitor_id: data.id,
        farm_id: data.farm_id,
        farm_name: "Unknown",
      },
      request
    );

    // 성공 응답에 Rate limit 헤더 추가
    const response = NextResponse.json(
      {
        message: "방문자가 성공적으로 등록되었습니다.",
        visitor: data,
      },
      { status: 201 }
    );

    const headers = createRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    // 방문자 등록 실패 로그 기록
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "VISITOR_CREATE_FAILED",
      LOG_MESSAGES.VISITOR_CREATE_FAILED(
        data.visitor_name || "Unknown",
        data.farm_id || "Unknown",
        errorMessage
      ),
      "error",
      undefined,
      "visitor",
      data.id,
      {
        action_type: "visitor_event",
        event: "visitor_created",
        error_message: errorMessage,
        visitor_name: data.visitor_name,
        farm_id: data.farm_id,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "create_visitor",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
