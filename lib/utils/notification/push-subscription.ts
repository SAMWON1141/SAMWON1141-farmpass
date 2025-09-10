import { devLog } from "@/lib/utils/logging/dev-logger";
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
 * Service Worker 재등록 함수
 * iOS Safari에서 Service Worker 문제를 해결하기 위한 강제 재등록
 */
export async function reRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  try {
    // 모든 기존 등록 해제
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
      devLog.info("기존 Service Worker 등록 해제:", reg.scope);
    }

    // 새로 등록
    const registration = await navigator.serviceWorker.register("/sw.js");
    devLog.info("Service Worker 재등록 완료:", registration.scope);

    // 재등록 후 ready 대기
    const readyRegistration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((_, reject) =>
        setTimeout(() => reject(new Error("재등록 후 Ready 타임아웃")), 15000)
      ),
    ]);

    return readyRegistration;
  } catch (error) {
    devLog.error("Service Worker 재등록 실패:", error);
    throw error;
  }
}

/**
 * 디바이스 정보를 기반으로 고유한 device_id를 생성하는 함수
 * @returns device_id 문자열
 */
export function generateDeviceId(): string {
  try {
    const deviceInfo = getDeviceInfo();

    // 더 정확한 디바이스 식별자 생성 (timestamp 제거로 일관성 확보)
    const deviceType = deviceInfo.isMobile
      ? "mobile"
      : deviceInfo.isTablet
      ? "tablet"
      : "desktop";

    // 브라우저, OS, 디바이스 타입만으로 일관된 device_id 생성
    return `${deviceInfo.browser}_${deviceInfo.os}_${deviceType}`;
  } catch (error) {
    // 에러 발생 시 기본값 반환
    devLog.warn("디바이스 정보 생성 실패, 기본값 사용:", error);
    return `device_unknown`;
  }
}

/**
 * 알림 권한 요청 및 구독 처리 공통 로직
 * 모든 구독 생성 시나리오를 처리하는 통합 함수
 */
export async function requestNotificationPermissionAndSubscribe(
  getVapidKey: () => Promise<string | null>,
  createSubscription: (
    subscription: PushSubscriptionJSON,
    deviceId?: string,
    options?: {
      isResubscribe?: boolean;
      updateSettings?: boolean;
    }
  ) => Promise<any>
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

      try {
        // Service Worker 등록 (타임아웃 시 재등록 로직 포함)
        let registration: ServiceWorkerRegistration;
        try {
          registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<ServiceWorkerRegistration>((_, reject) =>
              setTimeout(
                () => reject(new Error("Service Worker Ready 타임아웃")),
                15000
              )
            ),
          ]);
        } catch (error) {
          devLog.warn("Service Worker Ready 타임아웃, 재등록 시도:", error);
          registration = await reRegisterServiceWorker();
        }

        // 푸시 구독 생성
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        // device_id 생성
        const deviceId = generateDeviceId();

        // 서버에 구독 정보 전송 (device_id 포함)
        const result = await createSubscription(
          subscription.toJSON(),
          deviceId
        );

        return {
          success: true,
          message: result?.message || "알림 구독이 완료되었습니다.",
        };
      } catch (error) {
        devLog.error("푸시 구독 생성 실패:", error);
        return {
          success: false,
          error: "SUBSCRIPTION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "푸시 구독에 실패했습니다.",
        };
      }
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
    return {
      success: false,
      error: "SUBSCRIPTION_FAILED",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
