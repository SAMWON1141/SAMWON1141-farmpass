// 에러 메시지
export const IMAGE_ERROR_MESSAGES = {
  SIZE_EXCEEDED: "파일 크기는 5MB를 초과할 수 없습니다.",
  PROCESSING_ERROR: "이미지 처리 중 오류가 발생했습니다.",
  DELETE_FAILED: "이미지 삭제에 실패했습니다.",
} as const;

// 아바타 크기 매핑
export const AVATAR_SIZE_MAP = {
  sm: "w-20 h-20",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
} as const;

// 중앙 원 크기 매핑
export const CENTER_CIRCLE_SIZE_MAP = {
  sm: "w-16 h-16",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-32 h-32",
} as const;

// 휠 전체 크기 매핑
export const WHEEL_SIZE_MAP = {
  sm: "w-32 h-32",
  md: "w-40 h-40",
  lg: "w-48 h-48",
  xl: "w-56 h-56",
} as const;

// 업로드 가이드라인
export const UPLOAD_GUIDELINES = {
  ERROR_MESSAGE: (extensions: readonly string[]) =>
    `지원하지 않는 파일 형식입니다. ${extensions
      .map((ext) => ext.toUpperCase())
      .join(", ")} 형식만 지원합니다.`,
  GUIDELINE: (maxWidth: number, maxHeight: number) =>
    `권장 크기: ${maxWidth}x${maxHeight}px`,
} as const;

// 이미지 업로드 컴포넌트 라벨
export const IMAGE_UPLOAD_DEFAULT_LABEL = "이미지";
export const IMAGE_UPLOAD_REQUIRED_MESSAGE = "{label}는 필수 항목입니다";
export const IMAGE_UPLOAD_MAX_SIZE = "최대 {size}MB";
export const IMAGE_UPLOAD_FORMAT_SUPPORT = "{formats} 형식 지원";

// 업로드 타입 정의
export type UploadType =
  | "profile"
  | "logo"
  | "favicon"
  | "visitorPhoto"
  | "notificationIcon"
  | "notificationBadge";

// 이미지 업로드 설정
export const IMAGE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.8,
  targetFormat: "jpeg" as const,
  allowedTypes: ["image/jpeg", "image/png"] as const,
  allowedExtensions: [".jpg", ".jpeg", ".png"] as const,
} as const;

// 업로드 타입별 설정 매핑
export const UPLOAD_TYPE_CONFIGS: Record<
  UploadType,
  {
    bucket: "profiles" | "visitor-photos";
    maxSize: number;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    targetFormat: string;
    allowedTypes: readonly string[];
    allowedExtensions: readonly string[];
    cacheControl: string;
    pathGenerator: (file: File, contextId?: string) => string;
    dbTable?: string;
    dbField?: string;
    cacheBusterField?: string;
  }
> = {
  profile: {
    bucket: "profiles" as const,
    maxSize: 5 * 1024 * 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.9,
    targetFormat: "jpeg",
    allowedTypes: ["image/jpeg", "image/png"] as const,
    allowedExtensions: [".jpg", ".jpeg", ".png"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File, contextId?: string) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      return `${contextId}/profile_${Date.now()}.${ext}`;
    },
    dbTable: "profiles",
    dbField: "profile_image_url",
  },

  logo: {
    bucket: "profiles" as const,
    maxSize: 5 * 1024 * 1024,
    maxWidth: 512,
    maxHeight: 512,
    quality: 1.0,
    targetFormat: "original", // SVG 등 원본 형식 유지
    allowedTypes: ["image/png", "image/jpeg", "image/svg+xml"] as const,
    allowedExtensions: [".png", ".jpg", ".jpeg", ".svg"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      return `systems/logo_${Date.now()}.${ext}`;
    },
    dbTable: "system_settings",
    dbField: "logo",
  },

  favicon: {
    bucket: "profiles" as const,
    maxSize: 1 * 1024 * 1024, // 1MB로 축소 (파비콘은 매우 작음)
    maxWidth: 32, // 32px로 축소 (파비콘은 매우 작음)
    maxHeight: 32,
    quality: 1.0, // 최고 품질 (작은 크기에서 선명도 중요)
    targetFormat: "png", // ICO 대신 PNG 사용 (더 나은 호환성)
    allowedTypes: ["image/x-icon", "image/png"] as const,
    allowedExtensions: [".ico", ".png"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      // 로고와 동일한 경로 구조 사용 (RLS 정책 호환)
      return `systems/favicon_${Date.now()}.${ext}`;
    },
    dbTable: "system_settings",
    dbField: "favicon",
  },

  visitorPhoto: {
    bucket: "visitor-photos" as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    targetFormat: "jpeg",
    allowedTypes: ["image/jpeg", "image/png"] as const,
    allowedExtensions: [".jpg", ".jpeg", ".png"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File, contextId?: string) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      return `${contextId}/${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${ext}`;
    },
  },

  notificationIcon: {
    bucket: "profiles" as const,
    maxSize: 1 * 1024 * 1024, // 1MB로 축소 (아이콘은 작은 파일)
    maxWidth: 64, // 64px로 축소 (아이콘은 작게 표시)
    maxHeight: 64,
    quality: 1.0, // 최고 품질 (아이콘은 선명해야 함)
    targetFormat: "png", // 투명도 지원 (아이콘에 중요)
    allowedTypes: ["image/png", "image/jpeg"] as const,
    allowedExtensions: [".png", ".jpg", ".jpeg"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      return `systems/notification_icon_${Date.now()}.${ext}`;
    },
    dbTable: "system_settings",
    dbField: "notification_icon",
  },

  notificationBadge: {
    bucket: "profiles" as const,
    maxSize: 1 * 1024 * 1024, // 1MB로 축소 (배지는 작은 파일)
    maxWidth: 64, // 64px로 축소 (배지는 작게 표시)
    maxHeight: 64,
    quality: 1.0, // 최고 품질 (배지는 선명해야 함)
    targetFormat: "png", // 투명도 지원 (배지에 중요)
    allowedTypes: ["image/png", "image/jpeg"] as const,
    allowedExtensions: [".png", ".jpg", ".jpeg"] as const,
    cacheControl: "public, max-age=31536000",
    pathGenerator: (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      return `systems/notification_badge_${Date.now()}.${ext}`;
    },
    dbTable: "system_settings",
    dbField: "notification_badge",
  },
} as const;
