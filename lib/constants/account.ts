export const PAGE_HEADER = {
  PAGE_TITLE: "계정 관리",
  PAGE_DESCRIPTION: "개인 정보 및 회사 정보를 관리하세요",
  BREADCRUMB: "계정 관리",

  COMPANY_INFO_TITLE: "회사 정보",
  COMPANY_INFO_DESCRIPTION: "회사 및 농장 정보를 관리합니다",

  LOGIN_ACTIVITY_TITLE: "로그인 활동",
  LOGIN_ACTIVITY_DESCRIPTION: "최근 로그인 기록과 계정 활동을 확인합니다.",

  PASSWORD_CHANGE_TITLE: "비밀번호 변경",
  PASSWORD_CHANGE_DESCRIPTION:
    "계정 보안을 위해 정기적으로 비밀번호를 변경하세요. 변경 후 자동으로 로그아웃됩니다.",

  PROFILE_INFO_TITLE: "개인 정보",
  PROFILE_INFO_DESCRIPTION: "개인 프로필 정보를 관리합니다",

  WITHDRAW_TITLE: "회원탈퇴",
  WITHDRAW_DESCRIPTION:
    "회원탈퇴 시 계정 및 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.",
} as const;

export const BUTTONS = {
  SAVE_COMPANY_INFO: "회사 정보 저장",
  SAVE_PROFILE_INFO: "프로필 정보 저장",
  SAVING: "저장 중...",
  CHANGE_PASSWORD: "비밀번호 변경",
  CHANGING: "변경 중...",
  WITHDRAW: "회원탈퇴",
  WITHDRAWING: "탈퇴 중...",
  WITHDRAW_CONFIRM: "탈퇴하기",
  WITHDRAW_CANCEL: "취소",
} as const;

// 계정 관리 페이지 라벨
export const LABELS = {
  // 회사 정보 섹션
  COMPANY_NAME: "회사명",
  BUSINESS_TYPE: "업종",
  COMPANY_ADDRESS: "회사 주소",
  ESTABLISHMENT_DATE: "설립일",
  EMPLOYEE_COUNT: "직원 수",
  COMPANY_WEBSITE: "웹사이트",
  COMPANY_DESCRIPTION: "회사 소개",
  // 비밀번호 섹션
  CURRENT_PASSWORD: "현재 비밀번호",

  // 프로필 섹션
  PROFILE_PHOTO: "프로필 사진",
  NAME: "이름",
  EMAIL: "이메일",
  PHONE_NUMBER: "휴대폰 번호",
  POSITION: "직책",
  DEPARTMENT: "부서",
  BIO: "자기소개",
  // 탭 라벨
  TABS: {
    PROFILE: "프로필",
    COMPANY: "회사 정보",
    SECURITY: "보안",
  },
  // 로그인 활동
  CURRENT_SESSION: "현재 세션",
  CURRENT_LOCATION: "현재 위치",
  NOW: "지금",
  UNKNOWN_LOCATION: "알 수 없음",
  NO_RECORD: "기록 없음",
  LAST_LOGIN: "마지막 로그인",
  PASSWORD_CHANGE: "비밀번호 변경",
  LOGIN_COUNT: "로그인 횟수",
  ACCOUNT_STATUS: "계정 상태",
  ACTIVE: "활성화",
  INACTIVE: "비활성화",
  WITHDRAW_DIALOG_TITLE: "정말로 회원탈퇴 하시겠습니까?",
  WITHDRAW_DIALOG_DESC:
    "이 작업은 되돌릴 수 없습니다. 계정 및 모든 데이터가 영구적으로 삭제됩니다.",
} as const;

// 플레이스홀더
export const PLACEHOLDERS = {
  BUSINESS_TYPE_SELECT: "업종 선택",
  EMPLOYEE_COUNT_SELECT: "직원 수 선택",
  COMPANY_NAME: "회사명을 입력하세요",
  COMPANY_ADDRESS: "주소 검색을 통해 주소를 입력해주세요",
  COMPANY_WEBSITE: "https://example.com",
  COMPANY_DESCRIPTION: "회사 및 농장에 대한 간단한 소개를 입력하세요",
  // 비밀번호 섹션
  CURRENT_PASSWORD_PLACEHOLDER: "현재 비밀번호를 입력하세요",
  // 프로필 섹션
  EMAIL: "name@example.com",
  NAME: "이름을 입력하세요",
  PHONE_NUMBER: "숫자만 입력 가능합니다",
  POSITION: "직책을 선택하세요",
  DEPARTMENT: "부서명을 입력하세요",
  BIO: "자기소개를 입력하세요",
} as const;

// 직원 수 옵션
export const EMPLOYEE_COUNT_OPTIONS = [
  { value: "10", label: "1-10명" },
  { value: "50", label: "10-50명" },
  { value: "100", label: "50-100명" },
  { value: "500", label: "100명 이상" },
] as const;

// 업종 옵션
export const BUSINESS_TYPE_OPTIONS = [
  { value: "축산업", label: "축산업" },
  { value: "농업", label: "농업" },
  { value: "원예업", label: "원예업" },
  { value: "수산업", label: "수산업" },
  { value: "기타", label: "기타" },
] as const;

// 프로필 섹션
export const POSITION_OPTIONS = [
  { value: "대표", label: "대표" },
  { value: "관리자", label: "관리자" },
  { value: "직원", label: "직원" },
  { value: "방역담당자", label: "방역담당자" },
] as const;
