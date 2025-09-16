import { NextRequest } from "next/server";

/**
 * 시스템 로그 메시지 및 메타데이터 템플릿
 *
 * 로그 생성 시 중복을 제거하고 일관성을 유지하기 위한 템플릿들을 정의합니다.
 */

// ===========================================
// 로그 메시지 템플릿
// ===========================================

export const LOG_MESSAGES = {
  // 방문자 관련
  VISITOR_ACCESS: (count: number, scope: string) =>
    `방문자 데이터 접근: ${count}건 조회 (${scope})`,
  VISITOR_ACCESS_DENIED: (email: string) =>
    `방문자 데이터 접근 거부: 농장 소속이 없는 사용자 ${email}`,
  VISITOR_CREATED: (visitorName: string, farmName: string) =>
    `방문자 등록: ${visitorName} (${farmName})`,
  VISITOR_UPDATED: (visitorName: string, farmName: string) =>
    `방문자 정보 수정: ${visitorName} (${farmName})`,
  VISITOR_DELETED: (visitorName: string, farmName: string) =>
    `방문자 삭제: ${visitorName} (${farmName})`,
  VISITOR_DAILY_LIMIT_EXCEEDED: (
    count: number,
    maxCount: number,
    farmName: string,
    visitorName: string
  ) =>
    `일일 방문자 수 초과: ${count}/${maxCount}명 (농장: ${farmName}, 방문자: ${visitorName})`,
  VISITOR_DAILY_LIMIT_WARNING: (
    count: number,
    maxCount: number,
    farmName: string
  ) =>
    `일일 방문자 수 한도에 도달했습니다: ${count}/${maxCount}명 (농장: ${farmName})`,
  VISITOR_COUNT_QUERY_FAILED: (errorMessage: string) =>
    `방문자 수 조회 오류: ${errorMessage}`,
  VISITOR_CREATE_FAILED: (
    visitorName: string,
    farmId: string,
    errorMessage: string
  ) =>
    `방문자 등록 실패: ${visitorName} - ${errorMessage} (농장 ID: ${farmId})`,
  VISITOR_UPDATE_FAILED: (
    visitorId: string,
    farmId: string,
    errorMessage: string
  ) =>
    `방문자 정보 수정 실패: ${errorMessage} (방문자 ID: ${visitorId}, 농장 ID: ${farmId})`,
  VISITOR_DELETE_FAILED: (
    visitorId: string,
    farmId: string,
    errorMessage: string
  ) =>
    `방문자 삭제 실패: ${errorMessage} (방문자 ID: ${visitorId}, 농장 ID: ${farmId})`,
  VISITOR_RATE_LIMIT_EXCEEDED: (request: NextRequest) =>
    `IP ${request.ip || "unknown"}에서 방문자 등록 요청 제한 초과`,
  VISITOR_QUERY_FAILED: (errorMessage: string) =>
    `방문자 조회 실패: ${errorMessage}`,

  // 농장 관련
  FARM_CREATED: (farmName: string, farmId: string) =>
    `농장 생성: ${farmName} (${farmId})`,
  FARM_CREATE_FAILED: (farmName: string, errorMessage: string) =>
    `농장 생성 실패: ${farmName} - ${errorMessage}`,
  FARM_READ: (count: number, accessType: string) =>
    `농장 목록 조회: ${count}개 (${accessType})`,
  FARM_READ_FAILED: (errorMessage: string) =>
    `농장 목록 조회 실패: ${errorMessage}`,
  FARM_UPDATED: (farmName: string) => `농장 정보 수정: ${farmName}`,
  FARM_UPDATE_FAILED: (farmId: string, errorMessage: string) =>
    `농장 정보 수정 실패: ${errorMessage} (농장 ID: ${farmId})`,
  FARM_DELETED: (farmName: string) => `농장 삭제: ${farmName}`,
  FARM_DELETE_FAILED: (farmId: string, errorMessage: string) =>
    `농장 삭제 실패: ${errorMessage} (농장 ID: ${farmId})`,

  // 멤버 관련
  MEMBER_CREATED: (memberEmail: string, farmName: string, role: string) =>
    `멤버 추가: ${memberEmail} (${farmName}, 역할: ${role})`,
  MEMBER_UPDATED: (memberEmail: string, farmName: string, role: string) =>
    `멤버 정보 수정: ${memberEmail} (${farmName}, 역할: ${role})`,
  MEMBER_ROLE_UPDATED: (
    memberName: string,
    memberEmail: string,
    oldRole: string,
    newRole: string,
    farmName: string
  ) =>
    `농장 멤버 역할 변경: ${memberName} (${memberEmail}) - ${oldRole} → ${newRole} (농장: ${farmName})`,
  MEMBER_REMOVED: (memberEmail: string, farmName: string) =>
    `멤버 제거: ${memberEmail} (${farmName})`,
  MEMBER_DELETED: (
    memberName: string,
    memberEmail: string,
    role: string,
    farmName: string
  ) =>
    `농장 멤버 제거: ${memberName} (${memberEmail}) - ${role} 역할 (농장: ${farmName})`,

  MEMBER_CREATE_FAILED: (farmId: string, errorMessage: string) =>
    `농장 멤버 추가 실패: ${errorMessage} (농장 ID: ${farmId})`,
  MEMBER_UPDATE_FAILED: (
    memberId: string,
    farmId: string,
    errorMessage: string
  ) =>
    `농장 멤버 역할 변경 실패: ${errorMessage} (멤버 ID: ${memberId}, 농장 ID: ${farmId})`,
  MEMBER_DELETE_FAILED: (
    memberId: string,
    farmId: string,
    errorMessage: string
  ) =>
    `농장 멤버 제거 실패: ${errorMessage} (멤버 ID: ${memberId}, 농장 ID: ${farmId})`,

  // 인증 관련
  LOGIN_SUCCESS: (email: string) => `로그인 성공: ${email}`,
  LOGIN_FAILED: (email: string, attempts: number) =>
    `로그인 실패: ${email}, 로그인 시도 횟수: ${attempts}`,
  EMAIL_CHECK_FAILED: (errorMessage: string) =>
    `이메일 중복 확인 오류: ${errorMessage}`,
  LOGIN_SYSTEM_ERROR: (errorMessage: string) =>
    `로그인 시스템 오류: ${errorMessage}`,
  LOGIN_ATTEMPTS_RESET: (email: string) => `로그인 시도 횟수 초기화: ${email}`,
  ACCOUNT_LOCKED: (email: string, attempts: number, max: number) =>
    `계정 잠금: ${email} (로그인 시도 횟수 초과: ${attempts}/${max})`,
  ACCOUNT_UNLOCKED: (email: string, duration: number) =>
    `계정 잠금 해제: ${email} (${duration}분 타임아웃 후 자동 해제)`,
  SUSPICIOUS_LOGIN_ATTEMPTS: (
    email: string,
    attempts: number,
    threshold: number
  ) =>
    `의심스러운 로그인 시도 감지: ${email} (${attempts}회 시도, 임계값: ${threshold}회)`,
  LOGIN_ATTEMPTS_RESET_ERROR: (email: string, errorMessage: string) =>
    `로그인 시도 횟수 초기화 실패: ${email} - ${errorMessage}`,
  PASSWORD_RESET_SYSTEM_ERROR: (email: string, errorMessage: string) =>
    `비밀번호 재설정 시스템 오류: ${email} - ${errorMessage}`,
  TURNSTILE_VERIFICATION_FAILED: (errorCodes: string[]) =>
    `Turnstile 검증 실패: ${
      errorCodes.length > 0 ? errorCodes.join(", ") : "알 수 없는 오류"
    }`,
  PASSWORD_RESET: (email: string) => `비밀번호 재설정: ${email}`,
  WITHDRAW_SUCCESS: (email: string) => `계정 탈퇴: ${email}`,
  WITHDRAW_FAILED: (email: string, errorMessage: string) =>
    `회원탈퇴 실패: ${email} - ${errorMessage}`,
  USER_CREATE_FAILED: (email: string, errorMessage: string) =>
    `회원가입 실패: ${email} - ${errorMessage}`,
  USER_CREATED: (name: string, email: string) =>
    `새로운 사용자 회원가입 완료: ${name} (${email})`,
  USER_CREATE_SYSTEM_ERROR: (errorMessage: string) =>
    `회원가입 처리 중 오류 발생: ${errorMessage}`,

  // 푸시 알림 관련
  PUSH_SUBSCRIPTION_CREATED: (endpoint: string) =>
    `사용자가 푸시 알림을 구독했습니다. (엔드포인트: ${endpoint})`,
  PUSH_SUBSCRIPTION_CREATE_FAILED: (errorMessage: string) =>
    `푸시 구독 생성 실패: ${errorMessage}`,
  PUSH_SUBSCRIPTION_UPDATED: (email: string) => `푸시 구독 수정: ${email}`,
  PUSH_SUBSCRIPTION_DELETED: (endpoint: string) =>
    `사용자가 푸시 알림 구독을 해제했습니다. (엔드포인트: ${endpoint})`,
  PUSH_SUBSCRIPTION_DELETE_FAILED: (errorMessage: string) =>
    `푸시 구독 삭제 실패: ${errorMessage}`,
  PUSH_SUBSCRIPTION_CLEANUP_NONE: () => `정리할 구독이 없습니다.`,
  PUSH_SUBSCRIPTION_CLEANUP: (data: any) =>
    `푸시 구독이 정리되었습니다. 정리된 구독 수: ${data.cleanedCount} (방식: ${
      data.realTimeCheck ? "realtime" : "basic"
    }, 강제삭제: ${data.forceDelete})`,
  PUSH_SUBSCRIPTION_CLEANUP_ALL_VALID: (data: any) =>
    `모든 푸시 구독이 유효합니다. (방식: ${
      data.realTimeCheck ? "realtime" : "basic"
    }, 검사: ${data.totalChecked}, 유효: ${data.validCount})`,
  PUSH_SUBSCRIPTION_CLEANUP_FAILED: (errorMessage: string) =>
    `푸시 구독 정리 실패: ${errorMessage}`,
  PUSH_SUBSCRIPTION_READ: () => `사용자가 푸시 알림 구독을 조회했습니다.`,
  PUSH_SUBSCRIPTION_READ_FAILED: (errorMessage: string) =>
    `푸시 구독 조회 실패: ${errorMessage}`,
  PUSH_SUBSCRIPTION_FORCE_DELETED: (endpoint: string) =>
    `강제 구독 해제: ${endpoint}`,
  PUSH_NOTIFICATION_SENT: (successCount: number, failureCount: number) =>
    `푸시 알림이 발송되었습니다. 성공: ${successCount}, 실패: ${failureCount}`,
  PUSH_NOTIFICATION_INVALID_INPUT: (message: string) =>
    `푸시 알림 입력 오류: ${message}`,
  PUSH_NOTIFICATION_INVALID_TYPE: (type: string) =>
    `지원하지 않는 푸시 알림 타입: ${type}`,
  PUSH_NOTIFICATION_VAPID_INIT_FAILED: () => `VAPID 키 초기화 실패`,
  PUSH_NOTIFICATION_SUBSCRIBER_FETCH_FAILED: (error: string) =>
    `구독자 조회 실패: ${error}`,
  PUSH_NOTIFICATION_NO_SUBSCRIBERS: () => `발송할 구독자가 없습니다.`,
  PUSH_NOTIFICATION_SETTINGS_FETCH_FAILED: (error: string) =>
    `알림 설정 조회 실패: ${error}`,
  PUSH_NOTIFICATION_FILTERED_OUT: (
    recipientCount: number,
    totalCount: number
  ) => `알림 설정에 의해 ${recipientCount}/${totalCount}명이 필터링되었습니다.`,
  PUSH_NOTIFICATION_SEND_FAILED: (error: string) =>
    `푸시 알림 발송 실패: ${error}`,
  PUSH_NOTIFICATION_SYSTEM_ERROR: (errorMessage: string) =>
    `푸시 알림 시스템 오류: ${errorMessage}`,

  // VAPID 관련
  VAPID_KEY_CREATED: (userId: string) =>
    `VAPID 키가 생성되었습니다. (사용자: ${userId})`,
  VAPID_KEY_CREATE_FAILED: () => `VAPID 키 생성 실패.`,
  VAPID_KEY_CONFIGURED: () => `VAPID 키가 설정되었습니다.`,
  VAPID_KEY_NOT_CONFIGURED: () => `VAPID 키가 설정되지 않았습니다.`,
  VAPID_KEY_FETCH_FAILED: (errorMessage: string) =>
    `VAPID 키 조회 실패: ${errorMessage}`,

  // 알림 설정 관련
  NOTIFICATION_SETTINGS_UPDATED: (email: string) => `알림 설정 수정: ${email}`,
  NOTIFICATION_SETTINGS_QUERY_FAILED: (errorMessage: string) =>
    `알림 설정 조회 실패: ${errorMessage}`,
  NOTIFICATION_SETTINGS_UPDATE_FAILED: (errorMessage: string) =>
    `알림 설정 업데이트 실패: ${errorMessage}`,
  NOTIFICATION_CREATED: (type: string, recipientCount: number) =>
    `${type} 알림 생성: ${recipientCount}명에게 발송`,

  // 프로필 관련
  PROFILE_UPDATED: (email: string) => `프로필 정보 수정: ${email}`,
  PROFILE_UPDATE_FAILED: (userId: string, errorMessage: string) =>
    `프로필 정보 수정 실패: ${errorMessage} (사용자 ID: ${userId})`,

  // 관리자 기능
  BROADCAST_NOTIFICATION_SENT: (adminEmail: string, recipientCount: number) =>
    `브로드캐스 알림 발송: ${adminEmail} → ${recipientCount}명`,
  BROADCAST_NOTIFICATION_FAILED: (errorMessage: string) =>
    `브로드캐스트 알림 발송 실패: ${errorMessage}`,
  LOG_CLEANUP: (adminEmail: string, deletedCount: number) =>
    `로그 정리: ${adminEmail} → ${deletedCount}건 삭제`,
  LOG_CLEANUP_FAILED: (errorMessage: string) =>
    `데이터 정리 시스템 오류: ${errorMessage}`,
  ORPHAN_FILES_CLEANUP: (
    adminEmail: string,
    totalDeleted: number,
    visitorOrphanUpdated: number,
    profileOrphanUpdated: number
  ) =>
    `고아 파일 정리: ${adminEmail} → ${totalDeleted}개 삭제, 방문자 DB orphan ${visitorOrphanUpdated}건, 프로필 DB orphan ${profileOrphanUpdated}건 초기화`,
  ORPHAN_FILES_CLEANUP_FAILED: (errorMessage: string) =>
    `관리자가 orphan 파일 정리에 실패했습니다: ${errorMessage}`,
  ORPHAN_FILES_CHECK_FAILED: (errorMessage: string) =>
    `고아 파일 체크 오류: ${errorMessage}`,

  // 시스템 관련
  SYSTEM_SETTINGS_INITIALIZED: () => "시스템 설정이 초기화되었습니다",
  SYSTEM_SETTINGS_UPDATED: (adminEmail: string) =>
    `시스템 설정 수정: ${adminEmail}`,
  SYSTEM_SETTINGS_BULK_UPDATED: (changedCount: number, changedFields: string) =>
    `시스템 설정 일괄 업데이트: ${changedCount}개 필드 변경 (${changedFields})`,
  SETTINGS_UPDATE_FAILED: (errorMessage: string) =>
    `시스템 설정 업데이트 오류: ${errorMessage}`,
  HEALTH_CHECK: (status: string, details?: string) =>
    `시스템 상태 점검: ${status}${details ? ` (${details})` : ""}`,
  PERFORMANCE_WARNING: (operation: string, duration: number) =>
    `성능 경고: ${operation} (${duration}ms)`,

  // 사용자 검색
  USER_SEARCH: (adminEmail: string, query: string, resultCount: number) =>
    `사용자 검색: ${adminEmail} → "${query}" → ${resultCount}건 결과`,
  USER_SEARCH_UNAUTHORIZED: (userId: string, farmId: string) =>
    `농장 멤버/소유자 아님: userId=${userId}, farmId=${farmId}`,
  USER_SEARCH_FAILED: (errorMessage: string) =>
    `사용자 검색 실패: ${errorMessage}`,

  // 세션 관련
  SESSION_CHECK: (visitorName: string, farmName: string, isValid: boolean) =>
    `세션 확인: ${visitorName} (${farmName}) - ${isValid ? "유효" : "만료"}`,
  VISITOR_SESSION_NOT_FOUND: (farmId: string) =>
    `방문자 세션 없음 - 첫 방문 (농장 ID: ${farmId})`,
  VISITOR_RECORD_NOT_FOUND: (farmId: string) =>
    `방문자 기록 없음 - 새 방문자 (농장 ID: ${farmId})`,
  VISITOR_SESSION_EXPIRED: (hoursSinceLastVisit: number, farmId: string) =>
    `방문자 세션 만료 - ${hoursSinceLastVisit}시간 경과 (농장 ID: ${farmId})`,
  VISITOR_SESSION_VALID: (remainingHours: number, farmId: string) =>
    `방문자 세션 유효 - 재방문 (${remainingHours}시간 남음, 농장 ID: ${farmId})`,
  VISITOR_SESSION_CHECK_ERROR: (farmId: string, errorMessage: string) =>
    `방문자 세션 체크 오류: ${errorMessage} (농장 ID: ${farmId})`,

  // 방문자 통계
  VISITOR_COUNT_TODAY: (farmName: string, count: number) =>
    `오늘 방문자 수: ${farmName} → ${count}명`,

  // 만료된 방문자
  EXPIRED_VISITORS_COUNT: (adminEmail: string, count: number) =>
    `만료된 방문자 수 조회: ${adminEmail} → ${count}명`,
  EXPIRED_COUNT_INVALID_PARAMS: (days: number) =>
    `만료된 방문자 데이터 개수 조회 실패: 유효하지 않은 보존 기간 (${days})`,
  EXPIRED_COUNT_QUERY_FAILED: (errorMessage: string) =>
    `만료된 방문자 데이터 개수 조회 실패: ${errorMessage}`,

  // 보안 이벤트 관련
  UNAUTHORIZED_ACCESS: (pathname: string) =>
    `관리자 페이지 무단 접근 시도: ${pathname}`,
  MAINTENANCE_ACCESS_DENIED: (userId: string, pathname: string) =>
    `유지보수 모드 접근 권한 없음: 사용자 ${userId}가 관리자 권한 없이 접근 시도`,
  RATE_LIMIT_EXCEEDED: (ip: string, pathname: string) =>
    `IP ${ip}에서 API 요청 제한 초과: ${pathname}`,
  MALICIOUS_REQUEST_BLOCKED: (
    pathname: string,
    ip: string,
    userAgent: string
  ) => `악성 요청 차단: ${pathname} (IP: ${ip}, UA: ${userAgent})`,
  MALICIOUS_BOT_RATE_LIMITED: (pathname: string, ip: string) =>
    `악성 봇 요청 제한: ${pathname} (IP: ${ip})`,
  SECURITY_404_HANDLER_TRIGGERED: (
    pathname: string,
    ip: string,
    userAgent: string
  ) => `404 핸들러 보안 차단: ${pathname} (IP: ${ip}, UA: ${userAgent})`,

  // 모니터링 관련
  ERROR_LOGS_CHECK_FAILED: (errorMessage: string) =>
    `에러 로그 조회 실패: ${errorMessage}`,
  MONITORING_ANALYTICS_FAILED: (errorMessage: string) =>
    `모니터링 분석 데이터 조회 실패: ${errorMessage}`,
  MONITORING_HEALTH_CHECK_FAILED: (errorMessage: string) =>
    `모니터링 헬스 체크 실패: ${errorMessage}`,
  MONITORING_UPTIME_FAILED: (errorMessage: string) =>
    `모니터링 업타임 상태 조회 실패: ${errorMessage}`,
  HEALTH_CHECK_FAILED: (errorMessage: string) =>
    `헬스 체크 실패: ${errorMessage}`,
} as const;

export type LogMessageKey = keyof typeof LOG_MESSAGES;
