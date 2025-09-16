"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone, Monitor, Tablet } from "lucide-react";
import { usePWAInstall } from "@/components/providers/pwa-provider";
import { motion, AnimatePresence } from "framer-motion";
import { BUTTONS, LABELS } from "@/lib/constants/common";

interface InstallPromptProps {
  delay?: number; // 표시 지연 시간 (ms)
  onDismiss?: () => void;
  onInstall?: () => void;
}

export function InstallPrompt({
  delay = 10000, // 기본 10초 후 표시
  onDismiss,
  onInstall,
}: InstallPromptProps) {
  const installInfo = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 설치 가능하고 아직 표시되지 않았을 때만 타이머 시작
    if (installInfo.canInstall && !isDismissed) {
      const timer = setTimeout(() => {
        // 알림 권한 시트가 열려있는지 확인
        const notificationSheet = document.querySelector(
          '[data-notification-sheet="true"]'
        );
        const isNotificationOpen =
          notificationSheet &&
          window.getComputedStyle(notificationSheet).display !== "none";

        if (isNotificationOpen) {
          // 알림 시트가 열려있으면 10초 후 다시 시도
          setTimeout(() => {
            setShowPrompt(true);
          }, 10000);
        } else {
          setShowPrompt(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [installInfo.canInstall, delay, isDismissed]);

  // 로컬스토리지에서 이전에 거부했거나 설치했는지 확인
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    const completed = localStorage.getItem("pwa_install_completed");

    // 설치 완료된 경우 프롬프트 표시 안함
    if (completed) {
      // 추가 검증: 정말로 설치되어 있는지 확인
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const now = Date.now();
      const completedTime = parseInt(completed);

      // 설치 완료 후 1분 이내이거나 standalone 모드면 프롬프트 숨김
      if (isStandalone || now - completedTime < 60000) {
        setIsDismissed(true);
        return;
      }

      // 설치 완료 기록이 있지만 standalone 모드가 아니고 시간이 지났으면
      // PWA가 삭제되었을 가능성 - localStorage 정리는 PWAProvider에서 처리
    }

    // 거부된 경우 24시간 체크
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      // 24시간이 지났으면 다시 표시
      if (dismissedTime < oneDayAgo) {
        localStorage.removeItem("pwa_install_dismissed");
      } else {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    onDismiss?.();
  };

  const handleInstall = async () => {
    try {
      setIsInstalling(true);

      // 브라우저 네이티브 설치 프롬프트 트리거
      const result = await installInfo.triggerInstall?.();

      if (result?.outcome === "accepted") {
        // 사용자가 설치를 수락한 경우
        setShowPrompt(false);
        setIsDismissed(true);
        localStorage.setItem("pwa_install_completed", Date.now().toString());
        onInstall?.();
      } else if (result?.outcome === "dismissed") {
        // 사용자가 설치를 거부한 경우
        setShowPrompt(false);
        setIsDismissed(true);
        localStorage.setItem("pwa_install_dismissed", Date.now().toString());
        onDismiss?.();
      } else {
        // outcome이 없거나 다른 경우는 프롬프트 유지
      }
    } catch (error) {
      // 에러 발생 시에도 커스텀 프롬프트는 닫기
      setShowPrompt(false);
      setIsDismissed(true);
      localStorage.setItem("pwa_install_completed", Date.now().toString());
      onInstall?.();
    } finally {
      setIsInstalling(false);
    }
  };

  const getPlatformIcon = () => {
    switch (installInfo.platform) {
      case "iOS":
        return <Smartphone className="w-5 h-5" />;
      case "Android":
        return <Smartphone className="w-5 h-5" />;
      case "Desktop":
        return <Monitor className="w-5 h-5" />;
      default:
        return <Tablet className="w-5 h-5" />;
    }
  };

  const getInstallText = () => {
    switch (installInfo.platform) {
      case "iOS":
        return LABELS.INSTALL_PROMPT_IOS_TEXT;
      case "Android":
        return LABELS.INSTALL_PROMPT_ANDROID_TEXT;
      case "Desktop":
        return LABELS.INSTALL_PROMPT_DESKTOP_TEXT;
      default:
        return LABELS.INSTALL_PROMPT_DEFAULT_TEXT;
    }
  };

  const getGuideText = () => {
    if (installInfo.method === "banner") {
      // 네이티브 설치 지원 브라우저(Chrome, Edge 등)
      return LABELS.INSTALL_PROMPT_BANNER_GUIDE;
    }
    // manual 또는 none: 홈화면 추가 안내만
    if (installInfo.platform === "iOS") {
      return LABELS.INSTALL_PROMPT_IOS_GUIDE;
    }
    if (installInfo.platform === "Android") {
      return installInfo.reason || LABELS.INSTALL_PROMPT_ANDROID_GUIDE;
    }
    return LABELS.INSTALL_PROMPT_DEFAULT_GUIDE;
  };

  if (!installInfo.canInstall || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 md:max-w-md md:left-auto md:right-4"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {getPlatformIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {LABELS.INSTALL_PROMPT_ADD_TO_HOME.replace(
                        "{action}",
                        getInstallText()
                      )}
                    </div>
                    <p className="text-xs opacity-90 mt-1">{getGuideText()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 p-0"
                    aria-label="설치 프롬프트 닫기"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {installInfo.method === "banner" && (
                    <Button
                      onClick={handleInstall}
                      size="sm"
                      disabled={isInstalling}
                      className="bg-white text-blue-600 hover:bg-gray-100 font-medium h-8 px-3"
                      aria-label={isInstalling ? "설치 중..." : "앱 설치하기"}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isInstalling
                        ? BUTTONS.INSTALL_PROMPT_INSTALLING
                        : BUTTONS.INSTALL_PROMPT_INSTALL}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
