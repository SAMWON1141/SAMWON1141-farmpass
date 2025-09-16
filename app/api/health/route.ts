import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { logMemoryUsage } from "@/lib/utils/logging/system-log";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
} from "@/lib/utils/error/errorUtil";
import { requireAuth } from "@/lib/server/auth-utils";

// package.json에서 버전 정보 가져오기
const packageJson = require("../../../package.json");

// 환경변수에서 메모리 임계값 가져오기 (기본값: 500MB)
const MEMORY_THRESHOLD =
  parseInt(process.env.MEMORY_THRESHOLD || "500") * 1024 * 1024;
// 데이터베이스 타임아웃 설정 (기본값: 5초)
const DB_TIMEOUT = parseInt(process.env.DB_TIMEOUT || "5000");
// CPU 사용량 임계값 설정 (기본값: 80%)
const CPU_THRESHOLD = parseInt(process.env.CPU_THRESHOLD || "80");

/**
 * 🏥 헬스체크 API
 * =================================
 *
 * 서버의 전반적인 상태를 확인하는 엔드포인트
 *
 * 주요 기능:
 * - 데이터베이스 연결 상태 확인
 * - 서버 업타임 및 성능 메트릭 수집
 * - 시스템 리소스 사용량 모니터링
 * - PWA 및 서비스 워커 상태 확인
 * - 환경 정보 및 버전 정보 제공
 * - 외부 모니터링 서비스 연동 지원
 *
 * 응답 형식:
 * - 성공 (200): 서버가 정상 동작 중
 * - 실패 (503): 데이터베이스 연결 실패 등 문제 발생
 *
 * 사용 예시:
 * ```bash
 * # 기본 헬스체크
 * curl https://your-domain.com/api/health
 *
 * # 모니터링 서비스 설정
 * URL: https://your-domain.com/api/health
 * Expected Status: 200
 * Check Interval: 5 minutes
 * Timeout: 30 seconds
 * ```
 *
 * 지원하는 모니터링 서비스:
 * - UptimeRobot
 * - Freshping
 * - Pingdom
 * - StatusCake
 * - 기타 HTTP 헬스체크 지원 서비스
 */
export async function GET() {
  const startTime = Date.now();
  let user = null;
  try {
    const authResult = await requireAuth(true); // admin 권한 필수
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }
    user = authResult.user;
    // =================================
    // 1. 데이터베이스 연결 확인 (타임아웃 적용)
    // =================================
    const dbStartTime = Date.now();
    let dbResponseTime = 0;
    let farmCount = 0;
    let visitorCount = 0;

    // 빌드 환경에서는 데이터베이스 연결을 시도하지 않음
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NEXT_PHASE === "phase-production-build"
    ) {
    } else {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Database connection timeout")),
            DB_TIMEOUT
          )
        ),
      ]);
      dbResponseTime = Date.now() - dbStartTime;

      // =================================
      // 2. 핵심 기능 동작 확인
      // =================================
      try {
        [farmCount, visitorCount] = await Promise.all([
          prisma.farms.count(),
          prisma.visitor_entries.count(),
        ]);
      } catch (queryError) {
        devLog.error("Database count queries failed:", queryError);
        // 헬스체크에서는 에러를 던지지 않고 기본값 사용
        farmCount = 0;
        visitorCount = 0;
      }
    }

    // =================================
    // 3. 메모리 사용량 확인
    // =================================
    // Node.js 프로세스의 메모리 사용량 정보
    const memoryUsage = process.memoryUsage();

    // =================================
    // 4. CPU 사용량 확인
    // =================================
    const cpuStartTime = process.cpuUsage();

    // CPU 사용량을 측정하기 위해 더 긴 시간 대기
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cpuEndTime = process.cpuUsage(cpuStartTime);

    // CPU 사용량 계산 (마이크로초를 초로 변환 후 퍼센트 계산)
    const cpuUsagePercent = {
      user: Math.round((cpuEndTime.user / 1000000) * 100) / 100,
      system: Math.round((cpuEndTime.system / 1000000) * 100) / 100,
    };

    // 최소값 설정으로 0% 방지
    if (cpuUsagePercent.user < 0.01) cpuUsagePercent.user = 0.01;
    if (cpuUsagePercent.system < 0.01) cpuUsagePercent.system = 0.01;

    // =================================
    // 5. 응답 시간 계산
    // =================================
    const totalResponseTime = Date.now() - startTime;

    // =================================
    // 6. 시스템 리소스 경고 알림 (비동기 처리)
    // =================================
    const totalCpuUsage = cpuUsagePercent.user + cpuUsagePercent.system;

    // 메모리 사용량 로깅
    await logMemoryUsage({
      heap_used: memoryUsage.heapUsed / 1024 / 1024, // MB로 변환
      heap_total: memoryUsage.heapTotal / 1024 / 1024, // MB로 변환
      warning_threshold: Math.round(MEMORY_THRESHOLD / 1024 / 1024), // MB로 변환
    });

    if (
      memoryUsage.heapUsed > MEMORY_THRESHOLD ||
      totalCpuUsage > CPU_THRESHOLD
    ) {
      // 시스템 리소스 경고 로깅
      await createSystemLog(
        "SYSTEM_RESOURCE_WARNING",
        `시스템 리소스 사용량이 높습니다. 메모리: ${Math.round(
          memoryUsage.heapUsed / 1024 / 1024
        )}MB/${Math.round(
          memoryUsage.heapTotal / 1024 / 1024
        )}MB, CPU: ${totalCpuUsage}%`,
        "warn",
        user?.id ? { id: user.id, email: user.email || "" } : undefined,
        "system",
        "system_resource",
        {
          action_type: "system_resource_event",
          event: "system_resource_warning",
          memory_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          memory_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          memory_threshold_mb: Math.round(MEMORY_THRESHOLD / 1024 / 1024),
          cpu_usage_percent: totalCpuUsage,
          cpu_threshold_percent: CPU_THRESHOLD,
          response_time_ms: totalResponseTime,
        }
      );
    }

    // =================================
    // 7. 성공 응답 생성
    // =================================
    return NextResponse.json(
      {
        // 기본 상태 정보
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${totalResponseTime}ms`,
        version: packageJson.version,

        // 성능 메트릭
        performance: {
          totalResponseTime: `${totalResponseTime}ms`,
          databaseResponseTime: `${dbResponseTime}ms`,
          cpu: {
            user: `${cpuUsagePercent.user}%`,
            system: `${cpuUsagePercent.system}%`,
            total: `${totalCpuUsage}%`,
          },
        },

        // 시스템 리소스 정보
        system: {
          farmCount,
          visitorCount,
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            status:
              memoryUsage.heapUsed < MEMORY_THRESHOLD ? "normal" : "warning",
          },
          cpu: {
            user: cpuUsagePercent.user,
            system: cpuUsagePercent.system,
            total: totalCpuUsage,
            threshold: CPU_THRESHOLD,
            status: totalCpuUsage > CPU_THRESHOLD ? "warning" : "normal",
          },
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          // 개발 스택 버전 정보 추가
          techStack: {
            framework: `Next.js ${
              packageJson.dependencies["next"] || "unknown"
            }`,
            runtime: `Node.js ${process.version}`,
            react: `React ${
              packageJson.dependencies["react"] || "unknown"
            } + React DOM ${
              packageJson.dependencies["react-dom"] || "unknown"
            }`,
            typescript: `TypeScript ${
              packageJson.devDependencies["typescript"] || "unknown"
            }`,
            database: `Supabase ${
              packageJson.dependencies["@supabase/supabase-js"] || "unknown"
            } + Prisma ${
              packageJson.dependencies["@prisma/client"] || "unknown"
            }`,
            authentication: `Supabase Auth (Client: ${
              packageJson.dependencies["@supabase/supabase-js"] || "unknown"
            }, SSR: ${packageJson.dependencies["@supabase/ssr"] || "unknown"})`,
            deployment: process.env.VERCEL ? "Vercel" : "Local",
            ui: `ShadCN UI + Tailwind CSS ${
              packageJson.devDependencies["tailwindcss"] || "unknown"
            }`,
            state: `React Query ${
              packageJson.dependencies["@tanstack/react-query"] || "unknown"
            } + Zustand ${packageJson.dependencies["zustand"] || "unknown"}`,
            pwa: `Serwist ${
              packageJson.dependencies["serwist"] || "unknown"
            } (Next.js Plugin: ${
              packageJson.dependencies["@serwist/next"] || "unknown"
            }, Webpack Plugin: ${
              packageJson.dependencies["@serwist/webpack-plugin"] || "unknown"
            })`,
            pushNotifications: `Web Push ${
              packageJson.dependencies["web-push"] || "unknown"
            }`,
            monitoring: "UptimeRobot",
            analytics: "Google Analytics 4",
          },
        },

        // 서비스 상태
        services: {
          database: "connected", // 데이터베이스 연결 상태
          api: "responsive", // API 서비스 상태
          memory:
            memoryUsage.heapUsed < MEMORY_THRESHOLD ? "normal" : "warning", // 임계값 수정
        },

        // 모니터링 서비스 연동 정보
        monitoring: {
          supported: ["uptimerobot", "freshping", "pingdom", "statuscake"], // 지원 서비스 목록
          checkInterval: "5 minutes", // 권장 체크 간격
          expectedStatus: 200, // 정상 상태 코드
          timeout: "30 seconds", // 권장 타임아웃
          uptimerobot: {
            status: "healthy", // UptimeRobot이 인식하는 상태
            message: "Server is running normally",
            checks: {
              database: "connected",
              memory:
                memoryUsage.heapUsed < MEMORY_THRESHOLD ? "normal" : "warning", // 임계값 수정
              api: "responsive",
            },
          },
        },
      },
      {
        status: 200, // 성공 상태 코드
      }
    );
  } catch (error) {
    // 헬스 체크 시스템 오류 로그
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "HEALTH_CHECK_FAILED",
      LOG_MESSAGES.HEALTH_CHECK_FAILED(errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "system",
      "system_resource",
      {
        action_type: "health_check_event",
        event: "health_check_failed",
        error_message: errorMessage,
        endpoint: "/api/health",
        method: "GET",
        response_time_ms: Date.now() - startTime,
      }
    );

    // =================================
    // 9. 시스템 오류 로깅
    // =================================
    const responseTime = Date.now() - startTime;

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "health_check",
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
