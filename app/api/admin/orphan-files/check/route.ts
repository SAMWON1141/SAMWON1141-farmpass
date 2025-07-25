import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth-utils";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/utils/logging/system-log";
import { getClientIP, getUserAgent } from "@/lib/server/ip-helpers";

// 재귀적으로 Storage의 모든 파일을 가져오는 함수
async function getAllStorageFiles(
  supabase: any,
  bucket: string,
  prefix: string = ""
): Promise<string[]> {
  const allFiles: string[] = [];

  try {
    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000 });

    if (error) {
      // HTML 응답 오류인지 확인
      if (error.message && error.message.includes("Unexpected token '<'")) {
        devLog.error(`[GET_ALL_FILES] HTML 응답 오류 - ${bucket}/${prefix}:`, {
          error: error.message,
          bucket,
          prefix,
          suggestion: "Storage 버킷 권한 또는 환경 변수를 확인하세요",
        });
      } else {
        devLog.error(
          `[GET_ALL_FILES] Storage API 오류 - ${bucket}/${prefix}:`,
          error
        );
      }
      return [];
    }

    if (!items) return [];

    for (const item of items) {
      if (item.id) {
        // 파일인 경우
        allFiles.push(prefix ? `${prefix}/${item.name}` : item.name);
      } else {
        // 폴더인 경우 재귀적으로 조회
        const subPrefix = prefix ? `${prefix}/${item.name}` : item.name;
        const subFiles = await getAllStorageFiles(supabase, bucket, subPrefix);
        allFiles.push(...subFiles);
      }
    }
  } catch (error) {
    // 예상치 못한 오류 처리
    devLog.error(`[GET_ALL_FILES] 예상치 못한 오류 - ${bucket}/${prefix}:`, {
      error: error instanceof Error ? error.message : String(error),
      bucket,
      prefix,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  return allFiles;
}

export async function GET(request: NextRequest) {
  // 요청 컨텍스트 정보 추출
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);
  const supabase = await createClient();

  // 인증 및 권한 확인 (admin만 접근 가능)
  const authResult = await requireAuth(true);
  if (!authResult.success || !authResult.user) {
    return authResult.response!;
  }

  try {
    // 방문자 orphan 파일 체크
    let usedVisitorUrls;
    let visitorDbError = null;

    try {
      usedVisitorUrls = await prisma.visitor_entries.findMany({
        where: {
          AND: [
            { profile_photo_url: { not: null } },
            { profile_photo_url: { not: "" } },
          ],
        },
        select: {
          profile_photo_url: true,
        },
      });
    } catch (error) {
      visitorDbError = error;
      devLog.error("[CHECK_ORPHAN] Visitor DB error:", visitorDbError);
    }

    const usedVisitorSet = new Set(
      usedVisitorUrls?.map((v: any) => v.profile_photo_url) || []
    );

    // 재귀적으로 모든 방문자 파일 가져오기
    const visitorFiles = await getAllStorageFiles(supabase, "visitor-photos");
    const orphanVisitorFiles = visitorFiles.filter(
      (filePath) =>
        !Array.from(usedVisitorSet).some((url) =>
          (url as string).includes(filePath)
        )
    );

    // 프로필 orphan 파일 체크
    let profiles;
    let profileDbError = null;

    try {
      profiles = await prisma.profiles.findMany({
        where: {
          AND: [
            { profile_image_url: { not: null } },
            { profile_image_url: { not: "" } },
          ],
        },
        select: {
          profile_image_url: true,
        },
      });
    } catch (error) {
      profileDbError = error;
      devLog.error("[CHECK_ORPHAN] Profile DB error:", profileDbError);
    }

    const usedProfileSet = new Set(
      profiles?.map((p: any) => p.profile_image_url).filter(Boolean) || []
    );

    // 재귀적으로 모든 프로필 파일 가져오기 (systems 폴더 제외)
    const profileFiles = await getAllStorageFiles(supabase, "profiles");
    const orphanProfileFiles = profileFiles.filter(
      (filePath) =>
        // systems 폴더는 제외
        !filePath.startsWith("systems/") &&
        !Array.from(usedProfileSet).some((url) =>
          (url as string).includes(filePath)
        )
    );

    // 방문자 DB orphan (DB에는 있는데 Storage에는 없는 profile_photo_url)
    const visitorDbOrphans = (usedVisitorUrls || []).filter((entry: any) => {
      const url = entry.profile_photo_url;
      if (!url) return false;
      const match = url.match(/visitor-photos\/(.+)$/);
      const filePath = match ? match[1] : null;
      if (!filePath) return false;
      return !visitorFiles.includes(filePath);
    });

    // 프로필 DB orphan (DB에는 있는데 Storage에는 없는 profile_image_url)
    const profileDbOrphans = (profiles || []).filter((profile: any) => {
      const url = profile.profile_image_url;
      if (!url) return false;
      const match = url.match(/profiles\/(.+)$/);
      const filePath = match ? match[1] : null;
      if (!filePath) return false;
      if (filePath.startsWith("systems/")) return false;
      return !profileFiles.includes(filePath);
    });

    // 디버깅을 위한 상세 정보 반환
    return NextResponse.json({
      visitorOrphans: orphanVisitorFiles,
      profileOrphans: orphanProfileFiles,
      visitorOrphanCount: orphanVisitorFiles.length,
      profileOrphanCount: orphanProfileFiles.length,
      visitorDbOrphans,
      profileDbOrphans,
      visitorDbOrphanCount: visitorDbOrphans.length,
      profileDbOrphanCount: profileDbOrphans.length,
      // 디버깅 정보
      debug: {
        visitor: {
          usedUrls: Array.from(usedVisitorSet),
          usedUrlCount: usedVisitorSet.size,
          storageFiles: visitorFiles,
          storageFileCount: visitorFiles.length,
          dbError: visitorDbError,
        },
        profile: {
          usedUrls: Array.from(usedProfileSet),
          usedUrlCount: usedProfileSet.size,
          storageFiles: profileFiles,
          storageFileCount: profileFiles.length,
          dbError: profileDbError,
        },
      },
    });
  } catch (error) {
    devLog.error("[CHECK_ORPHAN] General error:", error);

    // API 에러 로그 기록
    await logApiError(
      "/api/admin/orphan-files/check",
      "GET",
      error instanceof Error ? error : String(error),
      undefined,
      {
        ip: clientIP,
        userAgent,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: "ORPHAN_FILES_CHECK_FAILED",
        message: "고아 파일 확인에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
