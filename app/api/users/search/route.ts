import { NextResponse, NextRequest } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { requireAuth } from "@/lib/server/auth-utils";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";

// 동적 렌더링 강제
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let user = null;
  try {
    const { searchParams } = new URL(request.url);
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;
    const isAdmin = authResult.isAdmin || false;
    const query = searchParams.get("q");
    const farmId = searchParams.get("farmId");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // 농장 ID가 제공된 경우, 해당 농장에 대한 접근 권한 확인
    if (farmId) {
      // 시스템 관리자가 아닌 경우에만 농장별 권한 확인
      if (!isAdmin) {
        let farm;
        try {
          farm = await prisma.farms.findUnique({
            where: {
              id: farmId,
            },
            select: {
              owner_id: true,
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

        if (!farm) {
          throwBusinessError("GENERAL_NOT_FOUND", {
            resourceType: "farm",
          });
        }

        // 농장 소유자이거나 구성원인지 확인
        let membership;
        try {
          membership = await prisma.farm_members.findFirst({
            where: {
              farm_id: farmId,
              user_id: user.id,
            },
            select: {
              role: true,
            },
          });
        } catch (queryError) {
          throwBusinessError(
            "GENERAL_QUERY_FAILED",
            {
              resourceType: "member",
            },
            queryError
          );
        }

        const isOwner = farm.owner_id === user.id;
        const isMember = !!membership;

        if (!isOwner && !isMember) {
          // 권한 거부 로그(warn)
          await createSystemLog(
            "USER_SEARCH_UNAUTHORIZED",
            LOG_MESSAGES.USER_SEARCH_UNAUTHORIZED(user.id, farmId),
            "warn",
            { id: user.id, email: user.email || "" },
            "user",
            user?.id,
            {
              action_type: "user_search_event",
              event: "user_search_unauthorized",
              farm_id: farmId,
              attempted_user_id: user.id,
              reason: "not_owner_or_member",
            },
            request
          );
          throwBusinessError("USER_SEARCH_UNAUTHORIZED", {
            operation: "search_users_in_farm",
            farmId: farmId,
            userId: user.id,
          });
        }
      }
    }

    // 사용자 검색 (이메일, 이름으로 검색)
    let users;
    try {
      users = await prisma.profiles.findMany({
        where: {
          OR: [
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 10,
      });
    } catch (queryError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "user",
        },
        queryError
      );
    }

    // 농장 ID가 제공된 경우, 이미 해당 농장의 구성원인 사용자 제외
    let filteredUsers = users || [];
    if (farmId) {
      let existingMembers;
      try {
        existingMembers = await prisma.farm_members.findMany({
          where: {
            farm_id: farmId,
          },
          select: {
            user_id: true,
          },
        });
      } catch (queryError) {
        throwBusinessError(
          "GENERAL_QUERY_FAILED",
          {
            resourceType: "member",
          },
          queryError
        );
      }

      const memberUserIds = new Set(
        existingMembers?.map((m: any) => m.user_id) || []
      );

      filteredUsers = filteredUsers.filter(
        (user: any) => !memberUserIds.has(user.id)
      );
    }

    // 사용자 검색 로그 기록
    await createSystemLog(
      "USER_SEARCH",
      LOG_MESSAGES.USER_SEARCH(user.email || "", query, filteredUsers.length),
      "info",
      { id: user.id, email: user.email || "" },
      "user",
      user?.id,
      {
        action_type: "user_search_event",
        event: "user_search",
        farm_id: farmId,
        search_context: farmId ? "farm_member_search" : "general_search",
      },
      request
    );

    return NextResponse.json({ users: filteredUsers }, { status: 200 });
  } catch (error) {
    // 검색 실패 로그 기록
    const errorMessage = error instanceof Error ? error.message : String(error);
    try {
      if (user) {
        await createSystemLog(
          "USER_SEARCH_FAILED",
          LOG_MESSAGES.USER_SEARCH_FAILED(errorMessage),
          "error",
          { id: user.id, email: user.email || "" },
          "user",
          user?.id,
          {
            action_type: "user_search_event",
            event: "user_search_failed",
            error_message: errorMessage,
            search_query: new URL(request.url).searchParams.get("q"),
            farm_id: new URL(request.url).searchParams.get("farmId"),
          },
          request
        );
      }
    } catch (logError) {
      devLog.error("Failed to log search error:", logError);
    }

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "search_users",
      userId: user?.id,
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
