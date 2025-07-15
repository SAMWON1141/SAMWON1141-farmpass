import { devLog } from "@/lib/utils/logging/dev-logger";
import { getNotificationErrorMessage } from "@/lib/utils/validation/validation";
import { safeNotificationAccess } from "@/lib/utils/browser/safari-compat";
import { getDeviceInfo } from "@/lib/utils/browser/device-detection";

/**
 * 푸시 구독 공통 로직
 * 알림 설정 다이얼로그와 알림 설정 페이지에서 공통으로 사용
 */
export interface PushSubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Base64 to Uint8Array 변환
 */
export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * 브라우저 푸시 지원 확인
 */
export function checkPushSupport(): {
  supported: boolean;
  details: {
    serviceWorker: boolean;
    pushManager: boolean;
    notification: boolean;
    permissions: boolean;
    userAgent: string;
    isPWA: boolean;
    displayMode: string;
    iosVersion?: number;
    // 추가된 검사 항목들
    isSecureContext: boolean;
    isOnline: boolean;
    hasServiceWorkerRegistration: boolean;
    canSubscribe: boolean;
    browserVersion?: string;
    osVersion?: string;
    isPrivateMode?: boolean;
    hasPushManagerSupport: boolean;
    hasNotificationSupport: boolean;
    hasPermissionsSupport: boolean;
  };
} {
  const deviceInfo = getDeviceInfo();
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;
  const displayMode = isPWA ? "standalone" : "browser";

  // iOS 버전 확인
  let iosVersion: number | undefined;
  if (deviceInfo.os === "iOS") {
    const match = deviceInfo.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      iosVersion = parseInt(match[1]);
    }
  }

  // 브라우저 버전 확인
  let browserVersion: string | undefined;
  if (deviceInfo.browser === "Chrome") {
    const match = deviceInfo.userAgent.match(/Chrome\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (deviceInfo.browser === "Safari") {
    const match = deviceInfo.userAgent.match(/Version\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (deviceInfo.browser === "Firefox") {
    const match = deviceInfo.userAgent.match(/Firefox\/(\d+)/);
    if (match) browserVersion = match[1];
  }

  // OS 버전 확인
  let osVersion: string | undefined;
  if (deviceInfo.os === "Android") {
    const match = deviceInfo.userAgent.match(/Android (\d+)/);
    if (match) osVersion = match[1];
  } else if (deviceInfo.os === "iOS") {
    const match = deviceInfo.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) osVersion = `${match[1]}.${match[2]}`;
  }

  // 프라이빗 모드 감지 (제한적)
  let isPrivateMode: boolean | undefined;
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    isPrivateMode = false;
  } catch {
    isPrivateMode = true;
  }

  // 기본 지원 확인
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasPushManager = "PushManager" in window;
  const hasNotification = "Notification" in window;
  const hasPermissions = "permissions" in navigator;
  const isSecureContext = window.isSecureContext;
  const isOnline = navigator.onLine;

  // Service Worker 등록 가능 여부 확인
  let hasServiceWorkerRegistration = false;
  try {
    if (hasServiceWorker) {
      hasServiceWorkerRegistration = true;
    }
  } catch {
    hasServiceWorkerRegistration = false;
  }

  // 구독 가능 여부 확인 (기본적인 검사)
  let canSubscribe = false;
  try {
    if (
      hasPushManager &&
      hasNotification &&
      hasPermissions &&
      isSecureContext
    ) {
      canSubscribe = true;
    }
  } catch {
    canSubscribe = false;
  }

  // 세부 지원 여부 확인
  const hasPushManagerSupport =
    hasPushManager && typeof PushManager !== "undefined";
  const hasNotificationSupport =
    hasNotification && typeof Notification !== "undefined";
  const hasPermissionsSupport =
    hasPermissions && typeof navigator.permissions !== "undefined";

  return {
    supported:
      hasServiceWorker &&
      hasPushManagerSupport &&
      hasNotificationSupport &&
      hasPermissionsSupport &&
      isSecureContext,
    details: {
      serviceWorker: hasServiceWorker,
      pushManager: hasPushManager,
      notification: hasNotification,
      permissions: hasPermissions,
      userAgent: deviceInfo.userAgent,
      isPWA,
      displayMode,
      iosVersion,
      // 추가된 검사 항목들
      isSecureContext,
      isOnline,
      hasServiceWorkerRegistration,
      canSubscribe,
      browserVersion,
      osVersion,
      isPrivateMode,
      hasPushManagerSupport,
      hasNotificationSupport,
      hasPermissionsSupport,
    },
  };
}

/**
 * 알림 권한 요청 및 구독 처리 공통 로직
 */
export async function requestNotificationPermissionAndSubscribe(
  getVapidKey: () => Promise<string | null>,
  createSubscription: (subscription: PushSubscriptionJSON) => Promise<any>
): Promise<PushSubscriptionResult> {
  try {
    const safeNotification = safeNotificationAccess();

    // 브라우저 지원 확인
    if (!safeNotification.isSupported) {
      return {
        success: false,
        error: "UNSUPPORTED_BROWSER",
        message: "이 브라우저는 알림을 지원하지 않습니다.",
      };
    }

    // 권한이 이미 거부된 상태인지 확인
    if (safeNotification.permission === "denied") {
      const deviceInfo = getDeviceInfo();
      let message =
        "주소창 옆의 🔒 아이콘을 클릭하여 알림 권한을 허용해주세요.";

      // 모바일별 안내 메시지
      if (deviceInfo.browser === "Safari" && deviceInfo.os === "iOS") {
        message = "설정 → Safari → 알림 → 허용으로 변경해주세요.";
      } else if (deviceInfo.browser === "Chrome" && deviceInfo.isMobile) {
        message = "설정 → 사이트 설정 → 알림 → 허용으로 변경해주세요.";
      } else if (deviceInfo.isMobile) {
        message = "브라우저 설정에서 알림 권한을 허용해주세요.";
      }

      return {
        success: false,
        error: "PERMISSION_DENIED",
        message,
      };
    }

    // 권한 요청
    const permission = await safeNotification.requestPermission();

    if (permission === "granted") {
      // VAPID 키 가져오기
      const vapidKey = await getVapidKey();
      if (!vapidKey) {
        return {
          success: false,
          error: "VAPID_KEY_MISSING",
          message: "VAPID 키가 설정되지 않았습니다.",
        };
      }

      // Service Worker 등록
      const registration = await navigator.serviceWorker.ready;

      // 푸시 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // 서버에 구독 정보 전송
      const result = await createSubscription(subscription.toJSON());

      devLog.log("웹푸시 구독이 성공적으로 등록되었습니다.");

      return {
        success: true,
        message: result?.message || "알림 구독이 완료되었습니다.",
      };
    } else if (permission === "unsupported") {
      return {
        success: false,
        error: "UNSUPPORTED",
        message: "현재 브라우저에서는 알림 기능을 지원하지 않습니다.",
      };
    } else {
      return {
        success: false,
        error: "PERMISSION_DENIED",
        message: "알림 권한이 허용되지 않았습니다.",
      };
    }
  } catch (error) {
    devLog.error("알림 권한 요청 및 구독 실패:", error);
    const notificationError = getNotificationErrorMessage(error);
    return {
      success: false,
      error: "SUBSCRIPTION_FAILED",
      message: notificationError.message,
    };
  }
}
