import { useState, useEffect } from "react";

/**
 * 온라인/오프라인 상태를 감지하는 커스텀 훅
 *
 * @returns {object} 온라인 상태와 관련 함수들
 * @returns {boolean} isOnline - 현재 온라인 상태
 * @returns {boolean} isChecking - 연결 확인 중인지 여부
 * @returns {Function} checkConnection - 수동으로 연결 상태 확인
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 초기 온라인 상태 확인
    setIsOnline(navigator.onLine);

    // 온라인/오프라인 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // 이벤트 리스너 등록
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 클린업
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * 수동으로 연결 상태를 확인하는 함수
   * @returns {Promise<boolean>} 연결 상태
   */
  const checkConnection = async (): Promise<boolean> => {
    setIsChecking(true);

    try {
      // 간단한 헬스체크 API 호출
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });

      const isConnected = response.ok;
      setIsOnline(isConnected);
      return isConnected;
    } catch (error) {
      console.error("연결 확인 실패:", error);
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isOnline,
    isChecking,
    checkConnection,
  };
}
