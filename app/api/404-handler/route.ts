import { NextRequest, NextResponse } from "next/server";
import { getClientIP, getUserAgent } from "@/lib/server/ip-helpers";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { maliciousBotRateLimiter } from "@/lib/utils/system/rate-limit";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";

export async function GET(request: NextRequest) {
  return handleMaliciousRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMaliciousRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleMaliciousRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleMaliciousRequest(request);
}

async function handleMaliciousRequest(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);
  const pathname = new URL(request.url).pathname;

  // Rate Limiting 적용
  const botLimitResult = maliciousBotRateLimiter.checkLimit(clientIP);
  if (!botLimitResult.allowed) {
    // 악성 봇 요청 제한 로그 기록
    try {
      await createSystemLog(
        "MALICIOUS_BOT_RATE_LIMITED",
        LOG_MESSAGES.MALICIOUS_BOT_RATE_LIMITED(pathname, clientIP),
        "warn",
        undefined,
        "system",
        pathname,
        {
          action_type: "security_event",
          event: "malicious_bot_rate_limited",
          pathname: pathname,
        },
        request
      );
    } catch (error) {
      devLog.warn("Security logging failed:", error);
    }

    devLog.warn(
      `[404-HANDLER] Malicious bot rate limited: ${pathname} from IP: ${clientIP}`
    );
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": botLimitResult.retryAfter?.toString() || "60",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // 보안 로그 기록
  try {
    await createSystemLog(
      "SECURITY_404_HANDLER_TRIGGERED",
      LOG_MESSAGES.SECURITY_404_HANDLER_TRIGGERED(
        pathname,
        clientIP,
        userAgent
      ),
      "warn",
      undefined,
      "system",
      pathname,
      {
        action_type: "security_event",
        event: "security_404_handler_triggered",
        pathname: pathname,
      },
      request
    );
  } catch (error) {
    devLog.warn("Security logging failed:", error);
  }

  devLog.warn(
    `[404-HANDLER] Malicious request blocked: ${pathname} from IP: ${clientIP}, UA: ${userAgent}`
  );

  // 404 응답 반환 (로그에는 404로 기록됨)
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-cache, must-revalidate",
      "Content-Type": "text/plain",
    },
  });
}
