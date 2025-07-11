import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthLog } from "@/lib/utils/logging/system-log";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { getClientIP, getUserAgent } from "@/lib/server/ip-helpers";
import { createClient } from "@/lib/supabase/server";

// 관리자 권한 확인 함수
async function verifyAdminPermission(
  request: NextRequest
): Promise<{ isAdmin: boolean; adminId?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAdmin: false };
    }

    // 관리자 권한 확인 (프로필에서 account_type 확인)
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { account_type: true },
    });

    const isAdmin = profile?.account_type === "admin";
    return { isAdmin, adminId: isAdmin ? user.id : undefined };
  } catch (error) {
    devLog.error("Admin permission check failed:", error);
    return { isAdmin: false };
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    // 관리자 권한 확인
    const { isAdmin, adminId } = await verifyAdminPermission(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 상태 확인 (로그를 위해)
    const currentProfile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true, login_attempts: true, last_failed_login: true },
    });

    // 이미 잠금이 아닌 경우
    if (!currentProfile || currentProfile.login_attempts === 0) {
      return NextResponse.json({
        success: true,
        message: "이미 잠금이 해제된 계정입니다.",
      });
    }

    // 로그인 시도 횟수 초기화
    await prisma.$executeRaw`
      UPDATE profiles
      SET login_attempts = 0,
          last_failed_login = NULL,
          last_login_attempt = NULL
      WHERE email = ${email}
    `;

    // 수동 잠금 해제 로그 기록
    await createAuthLog(
      "LOGIN_ATTEMPTS_RESET",
      `로그인 시도 횟수 수동 초기화: ${email} (이전 시도: ${currentProfile.login_attempts}회)`,
      email,
      currentProfile.id,
      {
        previous_attempts: currentProfile.login_attempts,
        reset_reason: reason || "manual_reset",
        action_type: "security_event",
        reset_at: new Date().toISOString(),
        admin_id: adminId,
        admin_action: true,
      },
      { ip: clientIP, userAgent }
    ).catch((logError) =>
      devLog.error("Failed to log attempts reset:", logError)
    );

    return NextResponse.json({
      success: true,
      message: "계정 잠금이 해제되었습니다!",
    });
  } catch (err) {
    devLog.error("Reset login attempts error:", err);

    const error = err as Error;

    // 에러 로그 기록
    await createAuthLog(
      "LOGIN_ATTEMPTS_RESET_ERROR",
      `로그인 시도 횟수 초기화 실패: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      undefined,
      undefined,
      {
        error_message: error instanceof Error ? error.message : "Unknown error",
        error_type: error.constructor?.name || "Unknown",
        action_type: "system_error",
        timestamp: new Date().toISOString(),
      },
      { ip: clientIP, userAgent }
    ).catch((logError) => devLog.error("Failed to log reset error:", logError));

    return NextResponse.json(
      { error: "로그인 시도 횟수 초기화 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
