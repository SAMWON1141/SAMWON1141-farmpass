/**
 * 표준화된 에러 코드 및 메시지 정의
 *
 * 모든 API 응답에서 일관된 에러 형식을 사용하기 위한 중앙화된 에러 관리 시스템
 */
export type ErrorMessage = string | ((params: Record<string, any>) => string);
export type ErrorCode = keyof typeof ERROR_MAP;
export type ErrorInfo = {
  message: ErrorMessage;
  status: number;
};

export const ERROR_MAP: Record<string, ErrorInfo> = {
  // ===========================================
  // 기본 에러
  // ===========================================
  UNKNOWN_ERROR: {
    message: "알 수 없는 오류가 발생했습니다.",
    status: 500,
  },

  // ===========================================
  // 인증 및 권한 에러
  // ===========================================
  UNAUTHORIZED: {
    message: "인증이 필요합니다.",
    status: 401,
  },
  ADMIN_ACCESS_REQUIRED: {
    message: "관리자 권한이 필요합니다.",
    status: 403,
  },
  USER_MISMATCH_OR_AUTHENTICATION_FAILED: {
    message: "사용자 정보가 일치하지 않거나 인증에 실패했습니다.",
    status: 401,
  },
  ADDITIONAL_CHECK_FAILED: {
    message: "추가 권한 확인 중 오류가 발생했습니다.",
    status: 500,
  },

  // ===========================================
  // 비즈니스 로직 에러
  // ===========================================
  MISSING_REQUIRED_FIELDS: {
    message: (params: Record<string, any>) => {
      const missingFields = params.missingFields || [];
      const fieldLabels = {
        email: "이메일",
        turnstile: "캡차 토큰",
        privacyConsent: "개인정보 처리방침 동의",
        termsConsent: "이용약관 동의",
        type: "약관 타입",
        title: "제목",
        message: "메시지",
        notificationType: "알림 유형",
        content: "약관 내용",
        version: "약관 버전",
        termId: "약관 ID",
        consentId: "동의 ID",
        notificationIds: "알림 ID",
        farmIds: "농장 ID",
      };

      const translatedFields = missingFields.map(
        (field: string) =>
          fieldLabels[field as keyof typeof fieldLabels] || field
      );

      if (translatedFields.length === 1) {
        return `${translatedFields[0]}을(를) 입력해주세요.`;
      } else {
        return `다음 항목을 입력해주세요: ${translatedFields.join(", ")}`;
      }
    },
    status: 400,
  },

  INVALID_FORM_DATA: {
    message: (params: Record<string, any>) => {
      const errors = params.errors || [];
      const formType = params.formType || "form";

      const formTypeLabels = {
        profile: "프로필",
        company: "회사 정보",
        farm: "농장",
        visitor: "방문자",
        user: "사용자",
        form: "폼",
      };

      const translatedFormType =
        formTypeLabels[formType as keyof typeof formTypeLabels] || formType;

      if (errors.length === 0) {
        return `${translatedFormType} 데이터가 올바르지 않습니다.`;
      }

      const errorMessages = errors.map((error: any) => {
        const field = error.path?.join(".") || error.field || "알 수 없는 필드";
        const message = error.message || "유효하지 않은 값";
        return `${field}: ${message}`;
      });

      return `${translatedFormType} 데이터가 올바르지 않습니다. ${errorMessages.join(
        ", "
      )}`;
    },
    status: 400,
  },

  // 로그인 비즈니스 에러
  ACCOUNT_LOCKED: {
    message: (params: Record<string, any>) => {
      const timeLeft = params.timeLeft || 0;
      const minutes = Math.ceil(timeLeft / (60 * 1000));
      return `로그인 시도 횟수가 초과되었습니다. ${minutes}분 후에 다시 시도해주세요.`;
    },
    status: 429,
  },
  // ===========================================
  // Turnstile 관련 에러
  // ===========================================

  TURNSTILE_VERIFICATION_FAILED: {
    message: (params: Record<string, any>) => {
      const errorCodes = params.errorCodes || [];
      return `Turnstile 검증에 실패했습니다.${
        errorCodes.length > 0 ? ` (오류 코드: ${errorCodes.join(", ")})` : ""
      }`;
    },
    status: 400,
  },

  // 약관 관련 비즈니스 에러
  TERM_ALREADY_EXISTS: {
    message: (params: Record<string, any>) => {
      const type = params.type || "알 수 없음";
      const version = params.version || "알 수 없음";
      const operation = params.operation || "생성";
      const operationLabels = {
        create_term: "생성",
        update_term: "수정",
      };
      const translatedOperation =
        operationLabels[operation as keyof typeof operationLabels] || operation;
      return `동일한 타입(${type})과 버전(${version})의 약관이 이미 존재합니다. ${translatedOperation}할 수 없습니다.`;
    },
    status: 409,
  },

  INVALID_TERM_TYPE: {
    message: (params: Record<string, any>) => {
      const invalidType = params.invalidType || "알 수 없음";
      const validTypes = params.validTypes || [];
      const typeLabels = {
        privacy: "개인정보처리방침",
        privacy_consent: "개인정보 수집 및 이용 동의",
        terms: "서비스 이용약관",
        marketing: "마케팅 정보 수신 동의",
      };
      const translatedInvalidType =
        typeLabels[invalidType as keyof typeof typeLabels] || invalidType;
      const translatedValidTypes = validTypes.map(
        (type: string) => typeLabels[type as keyof typeof typeLabels] || type
      );
      return `유효하지 않은 약관 타입입니다: ${translatedInvalidType}. 허용된 타입: ${translatedValidTypes.join(
        ", "
      )}`;
    },
    status: 400,
  },

  TERM_ACTIVE_CANNOT_DELETE: {
    message: (params: Record<string, any>) => {
      const termId = params.termId || "알 수 없음";
      return `활성화된 약관(ID: ${termId})은 삭제할 수 없습니다. 먼저 비활성화 후 삭제해주세요.`;
    },
    status: 400,
  },

  TERM_HAS_CONSENTS_CANNOT_DELETE: {
    message: (params: Record<string, any>) => {
      const termId = params.termId || "알 수 없음";
      const consentCount = params.consentCount || 0;
      return `사용자 동의가 있는 약관(ID: ${termId})은 삭제할 수 없습니다. (동의 수: ${consentCount}개)`;
    },
    status: 400,
  },

  // RATE LIMIT 관련 비즈니스 에러
  RATE_LIMIT_EXCEEDED: {
    message: (params: Record<string, any>) => {
      const retryAfter = params.retryAfter || 60;
      return `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`;
    },
    status: 429,
  },
  RE_VISIT_LIMIT_EXCEEDED: {
    message: (params: Record<string, any>) => {
      const remainingHours = params.remainingHours || "알 수 없음";
      const reVisitAllowInterval = params.reVisitAllowInterval || "알 수 없음";
      return `재방문은 ${reVisitAllowInterval}시간 후에 가능합니다. (남은 시간: ${remainingHours}시간)`;
    },
    status: 400,
  },
  // HEALTH CHECK 관련 비즈니스 에러
  HEALTH_CHECK_FAILED: {
    message: (params: Record<string, any>) => {
      const responseTime = params.responseTime || "알 수 없음";
      const errorDetails = params.errorDetails || "알 수 없는 오류";
      return `서버 상태 점검에 실패했습니다. (응답시간: ${responseTime}, 오류: ${errorDetails})`;
    },
    status: 503,
  },

  // 방문자 관련 비즈니스 에러
  INVALID_RETENTION_PERIOD: {
    message: (params: Record<string, any>) => {
      const requestedDays = params.requestedDays || "알 수 없음";
      return `유효하지 않은 보존 기간입니다. (요청된 기간: ${requestedDays}일)`;
    },
    status: 400,
  },
  CONSENT_NOT_GIVEN: {
    message: "개인정보 수집에 동의해주세요.",
    status: 400,
  },

  // 푸시 구독 관련 비즈니스 에러
  INCOMPLETE_SUBSCRIPTION: {
    message: "구독 정보가 불완전합니다.",
    status: 400,
  },
  SUBSCRIPTION_VALIDATION_FAILED: {
    message: (params: Record<string, any>) => {
      const errors = params.errors || [];
      return `구독 데이터 검증에 실패했습니다. (오류: ${errors.join(", ")})`;
    },
    status: 400,
  },
  VAPID_KEY_REQUIRED_FOR_REALTIME: {
    message: "실시간 검사를 위해 VAPID 키가 필요합니다.",
    status: 500,
  },
  VAPID_KEY_NOT_CONFIGURED: {
    message: "VAPID 키가 설정되지 않았습니다. 관리자에게 문의하세요.",
    status: 500,
  },

  // 브로드캐스트 관련 비즈니스 에러
  BROADCAST_INVALID_TYPE: {
    message: (params: Record<string, any>) => {
      const validTypes = params.validTypes || ["visitor", "system"];
      return `유효하지 않은 알림 유형입니다. 허용된 유형: ${validTypes.join(
        ", "
      )}`;
    },
    status: 400,
  },
  BROADCAST_PUSH_FAILED: {
    message: (params: Record<string, any>) => {
      const sentCount = params.sentCount || 0;
      const failureCount = params.failureCount || 0;
      return `푸시 알림 발송에 실패했습니다. (성공: ${sentCount}명, 실패: ${failureCount}명)`;
    },
    status: 500,
  },
  // 데이터 정리 관련 비즈니스 에러
  UNSUPPORTED_DELETE_OPERATION: {
    message: (params: Record<string, any>) => {
      const providedAction = params.providedAction || "알 수 없음";
      return `지원하지 않는 삭제 작업입니다: ${providedAction}`;
    },
    status: 400,
  },
  // Storage 관련 비즈니스 에러
  STORAGE_HTML_RESPONSE_ERROR: {
    message: (params: Record<string, any>) => {
      const bucket = params.bucket || "알 수 없음";
      return `Storage 버킷 접근 오류가 발생했습니다. (버킷: ${bucket})`;
    },
    status: 500,
  },
  STORAGE_UNEXPECTED_ERROR: {
    message: (params: Record<string, any>) => {
      const bucket = params.bucket || "알 수 없음";
      return `Storage 작업 중 예상치 못한 오류가 발생했습니다. (버킷: ${bucket})`;
    },
    status: 500,
  },

  GENERAL_CLEANUP_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        visitor: "방문자 데이터",
        systemLogs: "시스템 로그",
        info: "정보",
      };
      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource} 정리 중 오류가 발생했습니다.`;
    },
    status: 500,
  },

  // DB 쿼리 관련 비즈니스 에러
  GENERAL_QUERY_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        visitor: "방문자 정보",
        farm: "농장 정보",
        farmList: "농장 목록",
        farmsStats: "농장 통계",
        member: "구성원 정보",
        memberList: "구성원 목록",
        notificationList: "알림 목록",
        notificationSettings: "알림 설정",
        pushSubscription: "푸시 구독",
        systemSettings: "시스템 설정",
        user: "사용자 정보",
        profile: "프로필 정보",
        errorLogs: "에러 로그",
        expiredData: "만료된 데이터",
        email: "이메일 정보",
        terms: "약관 정보",
        consent: "동의 정보",
        info: "정보",
        dashboardTotals: "대시보드 통계",
        todayVisitors: "오늘 방문자",
        logsLevelToday: "로그 통계",
        farmTypeDistribution: "농장 유형 분포",
        userRoleDistribution: "사용자 역할 분포",
        farmRegionDistribution: "농장 지역 분포",
        monthlyAggregations: "월별 집계",
        recentActiveUsers: "최근 활동 사용자",
        recentActivities: "최근 활동",
        trendAggregations: "추세 집계",
        logsAggregations: "로그 통계",
        logsList: "로그 목록",
      };

      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource}를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    },
    status: 500,
  },
  GENERAL_UPDATE_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        visitor: "방문자 정보",
        notification: "알림",
        notificationSettings: "알림 설정",
        pushSubscription: "푸시 구독",
        systemSettings: "시스템 설정",
        user: "사용자 정보",
        profile: "프로필 정보",
        loginAttempts: "로그인 시도 정보",
        loginSuccess: "로그인 성공 정보",
        terms: "약관 정보",
        consent: "동의 정보",
        info: "정보",
      };

      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource} 업데이트 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    },
    status: 500,
  },

  GENERAL_DELETE_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        visitor: "방문자 정보",
        farm: "농장 정보",
        member: "구성원 정보",
        notification: "알림",
        pushSubscription: "푸시 구독",
        log: "로그",
        storage: "저장소 파일",
        terms: "약관 정보",
        consent: "동의 정보",
        info: "정보",
      };

      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource} 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    },
    status: 500,
  },

  GENERAL_CREATE_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        user: "사용자",
        farm: "농장",
        notification: "알림",
        notificationSettings: "알림 설정",
        systemSettings: "시스템 설정",
        terms: "약관 정보",
        consent: "동의 정보",
        info: "정보",
      };
      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource} 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    },
    status: 500,
  },

  GENERAL_NOT_FOUND: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const resourceLabels = {
        farm: "농장",
        pushSubscription: "푸시 구독",
        terms: "약관 정보",
        consent: "동의 정보",
        info: "정보",
      };
      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      return `${translatedResource}을(를) 찾을 수 없습니다.`;
    },
    status: 404,
  },

  GENERAL_UNAUTHORIZED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const operationType = params.operationType || "access";
      const multiple = params.multiple || false;
      const unauthorizedItems = params.unauthorizedItems || [];

      const resourceLabels = {
        farm: "농장",
        info: "정보",
      };
      const operationLabels = {
        access: "접근",
        update: "수정",
        delete: "삭제",
        create: "생성",
      };
      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      const translatedOperation =
        operationLabels[operationType as keyof typeof operationLabels] ||
        operationType;

      if (multiple && unauthorizedItems.length > 0) {
        return `일부 ${translatedResource}에 대한 ${translatedOperation} 권한이 없습니다. (권한 없는 ${translatedResource}: ${unauthorizedItems.join(
          ", "
        )})`;
      }

      return `${translatedResource} ${translatedOperation} 권한이 없습니다.`;
    },
    status: 403,
  },

  GENERAL_TRANSACTION_FAILED: {
    message: (params: Record<string, any>) => {
      const resourceType = params.resourceType || "info";
      const operationType = params.operationType || "update";
      const resourceLabels = {
        farm: "농장",
        member: "구성원",
        info: "정보",
      };
      const operationLabels = {
        create: "생성",
        update: "수정",
        delete: "삭제",
      };
      const translatedResource =
        resourceLabels[resourceType as keyof typeof resourceLabels] ||
        resourceType;
      const translatedOperation =
        operationLabels[operationType as keyof typeof operationLabels] ||
        operationType;
      return `${translatedResource} ${translatedOperation} 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    },
    status: 500,
  },
  INVALID_ACTIVATE_VALUE: {
    message: (params: Record<string, any>) => {
      const invalidValue = params.invalidValue ?? "알 수 없음";
      const expectedType = params.expectedType ?? "boolean";
      return `유효하지 않은 활성화 값입니다: ${invalidValue} (필요한 타입: ${expectedType})`;
    },
    status: 400,
  },
} as const;
