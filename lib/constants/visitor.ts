export const PAGE_HEADER = {
  ALL_VISITORS_PAGE_TITLE: "전체 방문자 기록",
  VISITORS_PAGE_TITLE: "방문자 기록",
  ALL_VISITORS_PAGE_DESCRIPTION:
    "모든 농장의 방문자 기록을 조회하고 관리합니다.",
  VISITORS_PAGE_DESCRIPTION: "내 농장의 방문자 기록을 조회하고 관리합니다.",

  // FormHeader
  FORM_HEADER_DEFAULT_TITLE: "방문자 등록",
  FORM_HEADER_DEFAULT_DESCRIPTION:
    "방문 정보를 정확히 입력해주세요. 모든 정보는 방역 관리 목적으로만 사용됩니다.",

  VISITOR_ACTION_MENU_DELETE_TITLE: "방문 기록 삭제",
  VISITOR_ACTION_MENU_DELETE_DESC: "{name} 방문자의 정보를 삭제하시겠습니까?",
} as const;

export const BUTTONS = {
  VISITOR_FORM_SHEET_CANCEL: "취소",
  VISITOR_FORM_SHEET_CREATE_BUTTON: "등록",
  VISITOR_FORM_SHEET_EDIT_BUTTON: "수정",
  VISITOR_FORM_SHEET_PROCESSING: "처리 중...",

  EXPORT_ACTIONS_RESET: "초기화",
  EXPORT_ACTIONS_EXPORTING: "내보내는 중...",
  EXPORT_ACTIONS_CSV_DOWNLOAD: "CSV 다운로드",

  VISITOR_ACTION_MENU_OPEN: "메뉴 열기",
  VISITOR_ACTION_MENU_EDIT: "수정",
  VISITOR_ACTION_MENU_DELETE: "삭제",
  VISITOR_ACTION_MENU_DELETING: "삭제 중...",

  SUCCESS_CARD_VIEW_COMPANY: "회사 소개 보기",
  SUCCESS_CARD_GO_HOME: "홈페이지로 이동",
  VISITOR_FILTERS_ADVANCED: "고급 필터",

  VISITOR_TABLE_DETAILS_BUTTON: "상세보기",

  ACTIVE_FILTERS_CLEAR_ALL: "모든 필터 지우기",

  // FormFooter
  FORM_FOOTER_REGISTERING: "등록 중...",
  FORM_FOOTER_REGISTER_VISIT: "방문 등록",
} as const;

// 라벨
export const LABELS = {
  VISIT_PURPOSE: "방문목적",
  FULL_NAME: "이름",
  PHONE_NUMBER: "휴대폰 번호",
  ADDRESS: "주소",
  CAR_PLATE: "차량번호",
  DISINFECTION: "소독여부",
  NOTES: "비고",
  PROFILE_PHOTO: "프로필 사진",
  CONSENT: "개인정보 수집 및 이용에 동의합니다",
  CONSENT_DESCRIPTION:
    "수집된 정보는 방역 관리 목적으로만 사용되며, 관련 법령에 따라 보관됩니다.",
  REQUIRED_MARK: "*",

  // 방문자 내보내기 라벨
  VISITOR_EXPORT_TITLE: "방문자 데이터 내보내기",
  VISITOR_EXPORT_DESC: "내보낼 방문자 범위와 정보를 설정하세요",
  VISITOR_EXPORT_BUTTON: "방문자 내보내기",
  VISITOR_EXPORT_SUMMARY: "내보내기 요약: 선택된 옵션 {count}개",
  // 방문자 내보내기 섹션 라벨
  VISITOR_EXPORT_DATE_RANGE: "방문일 범위",
  VISITOR_EXPORT_FILTERS: "필터 설정",
  VISITOR_EXPORT_OPTIONS: "포함할 정보",
  // 방문자 필터 라벨
  VISITOR_FILTERS_FARM_SELECT: "농장 선택",
  VISITOR_FILTERS_PERIOD_SETTING: "기간 설정",
  // 필터 라벨
  FILTER_FARM: "농장",
  FILTER_VISITOR_TYPE: "방문자 유형",

  // 정보 유형 라벨
  INFO_TYPE_BASIC: "기본 정보",
  INFO_TYPE_BASIC_DESC: "이름, 연락처 등",
  INFO_TYPE_CONTACT: "연락처 정보",
  INFO_TYPE_CONTACT_DESC: "전화번호, 주소 등",
  INFO_TYPE_VISIT: "방문 정보",
  INFO_TYPE_VISIT_DESC: "방문일, 방문 목적 등",
  INFO_TYPE_EXTRA: "추가 정보",
  INFO_TYPE_EXTRA_DESC: "비고, 차량번호 등",
  // 방문자 테이블 라벨
  VISITOR_TABLE_DISINFECTION_COMPLETE: "완료",
  VISITOR_TABLE_DISINFECTION_INCOMPLETE: "미완료",
  VISITOR_TABLE_DISINFECTION_STATUS: "방역",
  VISITOR_TABLE_DEFAULT_PURPOSE: "기타",
  VISITOR_TABLE_DETAILS_TITLE: "방문자 상세 정보",
  VISITOR_TABLE_DETAILS_DESC: "방문자의 방문 정보, 방역 상태 등을 확인합니다.",
  // 활성 필터 태그 라벨
  ACTIVE_FILTERS_LABEL: "활성 필터:",
  ACTIVE_FILTERS_SEARCH: '검색: "{searchTerm}"',
  ACTIVE_FILTERS_CUSTOM_DATE: "커스텀 날짜",

  // 날짜 범위 선택기 라벨
  DATE_RANGE_SELECTOR_TITLE: "날짜 범위",
  DATE_RANGE_START_DATE: "시작 날짜",
  DATE_RANGE_END_DATE: "종료 날짜",
  DATE_RANGE_SUMMARY: "📅 {startDate} ~ {endDate}",
  // 내보내기 필터 라벨
  EXPORT_FILTERS_TITLE: "필터 설정",
  EXPORT_FILTERS_FARM_SELECT: "농장 선택",
  EXPORT_FILTERS_VISITOR_TYPE: "방문자 유형",
  EXPORT_FILTERS_ALL_FARMS: "모든 농장",
  // 내보내기 옵션 라벨
  EXPORT_OPTIONS_TITLE: "포함할 정보",
  EXPORT_OPTIONS_SELECTED_COUNT: "{count}개 선택",
  EXPORT_OPTIONS_BASIC_INFO: "기본 정보",
  EXPORT_OPTIONS_BASIC_DESC: "이름, 방문일시",
  EXPORT_OPTIONS_CONTACT_INFO: "연락처 정보",
  EXPORT_OPTIONS_CONTACT_DESC: "전화번호, 주소",
  EXPORT_OPTIONS_VISIT_INFO: "방문 정보",
  EXPORT_OPTIONS_VISIT_DESC: "목적, 농장, 차량번호",
  EXPORT_OPTIONS_EXTRA_INFO: "추가 정보",
  EXPORT_OPTIONS_EXTRA_DESC: "방역, 동의, 메모",
  EXPORT_OPTIONS_MIN_SELECTION: "최소 하나의 정보를 선택해야 합니다.",
  // 농장 선택기 라벨
  FARM_SELECTOR_TITLE: "농장 선택",
  FARM_SELECTOR_SUBTITLE: "{count}개 농장 중 선택",
  FARM_SELECTOR_DESCRIPTION: "방문자 기록을 조회할 농장을 선택하세요",
  FARM_SELECTOR_ALL_FARMS: "전체 농장",
  FARM_SELECTOR_FARM_NOT_FOUND: "농장을 찾을 수 없음",
  FARM_SELECTOR_TOTAL_RECORDS: "총 {count}건의 방문 기록",
  FARM_SELECTOR_TODAY_VISITORS: "오늘 방문자",
  // 인사이트 카드 라벨
  INSIGHT_CARD_TITLE: "인사이트",
  INSIGHT_CARD_SUBTITLE: "방문자 데이터 분석",
  INSIGHT_CARD_DAILY_AVERAGE: "평균 일일 방문자",
  INSIGHT_CARD_ACTIVITY_INDEX: "활성도 지수",
  INSIGHT_CARD_AVG_PER_FARM: "농장당 평균 방문자",
  INSIGHT_CARD_UNIT_PERSON: "{value}명",
  INSIGHT_CARD_UNIT_PERCENT: "{value}%",
  // 빠른 필터 라벨
  QUICK_FILTERS_TODAY: "오늘",
  QUICK_FILTERS_WEEK: "7일",
  QUICK_FILTERS_MONTH: "30일",
  QUICK_FILTERS_ALL: "전체",
  // 방문자 상세 모달 라벨
  VISITOR_DETAIL_BASIC_INFO: "기본 정보",
  VISITOR_DETAIL_CONTACT: "연락처",
  VISITOR_DETAIL_ADDRESS: "주소",
  VISITOR_DETAIL_VISIT_INFO: "방문 정보",
  VISITOR_DETAIL_VISIT_PURPOSE: "방문 목적",
  VISITOR_DETAIL_VEHICLE_NUMBER: "차량번호",
  VISITOR_DETAIL_DISINFECTION_INFO: "방역 및 동의 정보",
  VISITOR_DETAIL_DISINFECTION_STATUS: "방역 완료 상태",
  VISITOR_DETAIL_DISINFECTION_COMPLETED: "완료",
  VISITOR_DETAIL_DISINFECTION_INCOMPLETED: "미완료",
  VISITOR_DETAIL_CONSENT: "개인정보 수집 동의",
  VISITOR_DETAIL_CONSENT_COMPLETED: "동의 완료",
  VISITOR_DETAIL_CONSENT_INCOMPLETED: "동의 미완료",
  VISITOR_DETAIL_CONSENT_AGREED: "동의함",
  VISITOR_DETAIL_CONSENT_DISAGREED: "동의하지 않음",
  VISITOR_DETAIL_EXTRA_INFO: "추가 정보",
  VISITOR_DETAIL_UNKNOWN: "Unknown",
  VISITOR_DETAIL_OTHER: "기타",
  // 방문자 테이블 로우 라벨
  VISITOR_TABLE_ROW_DETAILS_TOOLTIP: "상세 보기",
  VISITOR_TABLE_ROW_DEFAULT_PURPOSE: "기타",
  VISITOR_TABLE_ROW_NO_VEHICLE: "-",
  // 방문자 농장 선택기 라벨
  VISITOR_FARM_SELECTOR_ALL_FARMS: "전체 농장",
  VISITOR_FARM_SELECTOR_FARM_NOT_FOUND: "농장을 찾을 수 없음",

  // VisitorFormSheet
  VISITOR_FORM_SHEET_CREATE_TITLE: "방문자 등록",
  VISITOR_FORM_SHEET_EDIT_TITLE: "방문자 정보 수정",
  VISITOR_FORM_SHEET_CREATE_DESC: "새로운 방문자를 등록합니다.",
  VISITOR_FORM_SHEET_EDIT_DESC: "방문자 정보를 수정합니다.",
  VISITOR_FORM_SHEET_LOADING: "데이터를 불러오는 중...",

  // VisitorStats
  VISITOR_STATS_TOTAL_VISITORS: "총 방문자",
  VISITOR_STATS_TOTAL_VISITORS_DESC: "전체 방문자",
  VISITOR_STATS_TODAY_VISITORS: "오늘 방문자",
  VISITOR_STATS_TODAY_VISITORS_DESC: "오늘 방문",
  VISITOR_STATS_REGISTERED_FARMS: "등록 농장",
  VISITOR_STATS_REGISTERED_FARMS_DESC: "관리 농장",
  VISITOR_STATS_DISINFECTION_RATE: "방역 완료율",
  VISITOR_STATS_DISINFECTION_RATE_DESC: "방역 완료",
  VISITOR_STATS_TOP_PURPOSE: "가장 많은 방문 목적",
  VISITOR_STATS_NO_DATA: "데이터 없음",
  VISITOR_STATS_NO_FARMS: "농장 없음",
  VISITOR_STATS_OPERATING: "운영중",
  VISITOR_STATS_SAFE: "안전",

  // CustomDatePicker
  CUSTOM_DATE_PICKER_START_DATE: "시작일 선택",
  CUSTOM_DATE_PICKER_END_DATE: "종료일 선택",

  // VisitorTableEmpty
  VISITOR_TABLE_EMPTY_TITLE: "방문자 기록이 없습니다",
  VISITOR_TABLE_EMPTY_DESC:
    "현재 설정된 필터 조건에 맞는 방문자 기록을 찾을 수 없습니다. 다른 조건으로 검색해보세요.",

  // VisitorTableHeader
  VISITOR_TABLE_HEADER_NUMBER: "번호",
  VISITOR_TABLE_HEADER_VISITOR: "방문자",
  VISITOR_TABLE_HEADER_FARM: "농장",
  VISITOR_TABLE_HEADER_VISIT_DATETIME: "방문일시",
  VISITOR_TABLE_HEADER_VISIT_PURPOSE: "방문목적",
  VISITOR_TABLE_HEADER_VEHICLE_NUMBER: "차량번호",
  VISITOR_TABLE_HEADER_DISINFECTION: "방역",
  VISITOR_TABLE_HEADER_ACTION: "액션",

  // FarmInfoCard
  FARM_INFO_CONTACT_GUIDE: "용무가 있으신 분은 아래로 연락바랍니다.",
  FARM_INFO_NO_ENTRY_WARNING: "축사출입금지 - 방역상 출입을 금지합니다",
  FARM_INFO_MANAGER_LABEL: "관리자",
  FARM_INFO_CONTACT_LABEL: "연락처",

  // SuccessCard
  SUCCESS_CARD_TITLE: "등록 완료",
  SUCCESS_CARD_HEADER: "방문 등록이 완료되었습니다!",
  SUCCESS_CARD_NOTIFICATION: "농장 관리자에게 알림이 전송되었습니다.",
  SUCCESS_CARD_POWERED_BY: "Powered by",
  SUCCESS_CARD_SAMWON_KOREA: "SWKorea",
  SUCCESS_CARD_REGISTRATION_TIME: "등록 시간:",
  SUCCESS_CARD_COMPLETION_GUIDE:
    "등록이 완료되었습니다. 브라우저의 X 버튼을 눌러 창을 닫아주세요.",

  SUCCESS_CARD_SYSTEM_PROVIDER: "🌐 농장 출입 관리 시스템은",
  SUCCESS_CARD_PROVIDED_BY: "에서 제공합니다.",
  SUCCESS_CARD_RECORD_SENT: "📋 방문 기록은 농장 관리자에게 전송되었습니다.",
  SUCCESS_CARD_PRIVACY_DELETION: "🔒 개인정보는 3년 후 자동으로 삭제됩니다.",
  SUCCESS_CARD_CONTACT_GUIDE:
    "📞 문의사항이 있으시면 농장 관리자에게 연락해주세요.",
  SUCCESS_CARD_CANCEL_WARNING: "방문자 등록을 취소하시겠습니까?",
  SUCCESS_CARD_CANCEL_DESC: "확인을 누르면 작성 중인 내용이 사라집니다.",
  SUCCESS_CARD_CANCEL_DESC_HOME: "확인을 누르면 홈페이지로 이동합니다.",

  // 방문자 폼 취소 확인
  VISITOR_FORM_CANCEL_TITLE: "방문자 정보 수정 취소",
  VISITOR_FORM_CANCEL_DESCRIPTION:
    "입력한 정보가 저장되지 않습니다. 정말 나가시겠습니까?",

  FORM_HEADER_COMPANY_LOGO_ALT: "회사 로고",
} as const;

// 플레이스홀더
export const PLACEHOLDERS = {
  FULL_NAME: "이름을 입력하세요",
  PHONE_NUMBER: "하이픈(-) 없이 숫자만 입력해주세요",
  ADDRESS: "주소 검색 버튼을 클릭하여 주소를 입력하세요",
  CAR_PLATE: "12가3456 (선택사항)",
  VISIT_PURPOSE: "방문 목적을 선택하세요",
  NOTES: "추가 사항이 있으면 입력해주세요",
  // 방문자 필터 플레이스홀더
  VISITOR_FILTERS_FARM_ALL: "전체 농장",
  // 날짜 범위 선택기 플레이스홀더
  DATE_RANGE_SELECTOR_FARM_PLACEHOLDER: "농장을 선택하세요",
  DATE_RANGE_SELECTOR_VISITOR_TYPE_PLACEHOLDER: "방문자 유형을 선택하세요",
  // SearchInput
  SEARCH_INPUT_PLACEHOLDER: "방문자 이름, 연락처, 차량번호로 검색...",
  VISITOR_ADDRESS_PLACEHOLDER: "주소를 입력하세요",
} as const;

// 방문 목적 옵션
export const VISIT_PURPOSE_OPTIONS = [
  "납품",
  "점검",
  "미팅",
  "수의사 진료",
  "사료 배송",
  "방역",
  "견학",
  "기타",
] as const;

// 방문자 유형 옵션
export const VISITOR_TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "consented", label: "개인정보 동의자" },
  { value: "disinfected", label: "방역 완료자" },
] as const;

// 날짜 범위 옵션
export const DATE_RANGE_OPTIONS = [
  { value: "today", label: "오늘" },
  { value: "week", label: "최근 7일" },
  { value: "month", label: "최근 30일" },
  { value: "custom", label: "사용자 지정" },
  { value: "all", label: "전체" },
] as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED_NAME: "이름을 입력해주세요",
  REQUIRED_CONTACT: "휴대폰 번호를 입력해주세요",
  REQUIRED_ADDRESS: "주소를 검색해주세요",
  REQUIRED_PURPOSE: "방문목적을 선택해주세요",
  REQUIRED_PHOTO: "방문자 사진을 등록해주세요",
  REQUIRED_CONSENT: "개인정보 수집에 동의해주세요",
  INVALID_PHONE: "올바른 전화번호 형식(010-XXXX-XXXX)을 입력해주세요",
  INVALID_CAR_PLATE: "올바른 차량번호 형식을 입력해주세요. (예: 12가1234)",
} as const;
