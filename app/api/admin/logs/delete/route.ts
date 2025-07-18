import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  logPermissionError,
  logApiError,
  createSystemLog,
} from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { getClientIP, getUserAgent } from "@/lib/server/ip-helpers";

export async function POST(request: NextRequest) {
  // 요청 컨텍스트 정보 추출
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    devLog.log("로그 삭제 API 시작");

    const supabase = await createClient();

    // 세션 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.account_type !== "admin") {
      // 권한 없는 접근 시도 로그
      await logPermissionError("logs_delete", "execute", user.id, "admin", {
        ip: clientIP,
        email: user.email,
        userAgent,
      });

      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, logId, beforeCount } = body;

    let result;
    let logMessage = "";

    switch (action) {
      case "delete_single":
        // 개별 로그 삭제
        const { error: deleteError } = await supabase
          .from("system_logs")
          .delete()
          .eq("id", logId);

        if (deleteError) throw deleteError;

        result = { deleted: true, logId };
        logMessage = `관리자가 개별 시스템 로그를 삭제했습니다 (로그 ID: ${logId})`;
        break;

      case "delete_all":
        // 전체 로그 삭제
        const { error: deleteAllError } = await supabase
          .from("system_logs")
          .delete()
          .not("id", "is", null);

        if (deleteAllError) throw deleteAllError;

        result = { deleted: true, count: beforeCount };
        logMessage = `관리자가 모든 시스템 로그를 완전히 삭제했습니다 (총 ${beforeCount}개 삭제)`;
        break;

      case "delete_old":
        // 30일 이전 로그 삭제
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: oldLogsCount, error: countError } = await supabase
          .from("system_logs")
          .select("*", { count: "exact", head: true })
          .lt("created_at", thirtyDaysAgo.toISOString());

        if (countError) throw countError;

        if (!oldLogsCount) {
          result = { deleted: false, count: 0 };
          logMessage = "삭제할 30일 이전 로그가 없습니다.";
        } else {
          const { error: deleteOldError } = await supabase
            .from("system_logs")
            .delete()
            .lt("created_at", thirtyDaysAgo.toISOString());

          if (deleteOldError) throw deleteOldError;

          result = { deleted: true, count: oldLogsCount };
          logMessage = `관리자가 30일 이전 시스템 로그를 삭제했습니다 (총 ${oldLogsCount}개 삭제)`;
        }
        break;

      default:
        throw new Error("지원하지 않는 삭제 작업입니다.");
    }

    // 삭제 작업 로그 기록
    await createSystemLog(
      "LOG_DELETE",
      logMessage,
      "info",
      user.id,
      "system",
      undefined,
      {
        action: action,
        user_email: profile.email,
        deleted_count: result.count || 1,
        log_id: logId,
        timestamp: new Date().toISOString(),
      },
      profile.email,
      clientIP,
      userAgent
    );

    devLog.log("로그 삭제 작업 완료:", result);
    return NextResponse.json({
      success: true,
      message: "로그 삭제가 완료되었습니다.",
      result,
    });
  } catch (error) {
    devLog.error("로그 삭제 API 오류:", error);

    // API 에러 로그 기록
    await logApiError(
      "/api/admin/logs/delete",
      "POST",
      error instanceof Error ? error : String(error),
      undefined,
      {
        ip: clientIP,
        userAgent,
      }
    );

    return NextResponse.json(
      {
        error: "로그 삭제 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
