import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Key, AlertTriangle, Copy, Check } from "lucide-react";
import {
  BUTTONS,
  LABELS,
  PLACEHOLDERS,
  PAGE_HEADER,
} from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import SettingsCardHeader from "../SettingsCardHeader";

interface VapidKeySectionProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  onGenerateKeys: () => Promise<{
    publicKey: string;
    privateKey: string;
    message?: string;
    warning?: string;
  }>;
  isLoading: boolean;
}

const VapidKeySection = React.memo(function VapidKeySection({
  settings,
  onUpdate,
  onGenerateKeys,
  isLoading,
}: VapidKeySectionProps) {
  const { showInfo, showSuccess, showError, showWarning } = useCommonToast();
  const [copiedKey, setCopiedKey] = React.useState<"public" | "private" | null>(
    null
  );

  // VAPID 키 생성 핸들러 (토스트 처리 포함)
  const handleGenerateKeys = async () => {
    showInfo("VAPID 키 생성 시작", "VAPID 키를 생성하는 중입니다...");
    try {
      const result = await onGenerateKeys();
      showSuccess(
        "VAPID 키 생성 완료",
        result?.message || "VAPID 키가 성공적으로 생성되었습니다."
      );

      // 경고 메시지가 있으면 표시
      if (result?.warning) {
        showWarning("VAPID 키 생성 완료", result.warning);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      showError("VAPID 키 생성 실패", errorMessage);
    }
  };

  const handleCopyKey = async (keyType: "public" | "private") => {
    showInfo("키 복사 시작", "키를 복사하는 중입니다...");
    const keyValue =
      keyType === "public" ? settings.vapidPublicKey : settings.vapidPrivateKey;

    if (!keyValue) {
      showWarning("키 없음", "먼저 VAPID 키를 생성해주세요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedKey(keyType);
      showSuccess(
        "키 복사 완료",
        `${
          keyType === "public" ? "공개" : "비공개"
        } 키가 클립보드에 복사되었습니다.`
      );

      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "키 복사에 실패했습니다. 다시 시도해주세요.";
      showError("키 복사 실패", errorMessage);
    }
  };

  return (
    <Card>
      <SettingsCardHeader
        icon={Key}
        title={PAGE_HEADER.VAPID_SECTION_TITLE}
        description={PAGE_HEADER.VAPID_SECTION_DESCRIPTION}
      />
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label
            htmlFor="vapidPublicKey"
            className="text-sm sm:text-base font-medium"
          >
            {LABELS.VAPID_PUBLIC_KEY_LABEL}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="vapidPublicKey"
                placeholder={PLACEHOLDERS.VAPID_PUBLIC_KEY}
                value={settings.vapidPublicKey || ""}
                readOnly
                disabled
                className="pr-10 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleCopyKey("public")}
                disabled={!settings.vapidPublicKey}
                aria-label="공개 키 복사"
              >
                {copiedKey === "public" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateKeys}
              disabled={isLoading}
            >
              {BUTTONS.VAPID_GENERATE_BUTTON}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="vapidPrivateKey"
            className="text-sm sm:text-base font-medium"
          >
            {LABELS.VAPID_PRIVATE_KEY_LABEL}
          </Label>
          <div className="relative">
            <Input
              id="vapidPrivateKey"
              type="text"
              placeholder={PLACEHOLDERS.VAPID_PRIVATE_KEY}
              value={settings.vapidPrivateKey || ""}
              readOnly
              disabled
              className="pr-10 bg-muted/50 text-muted-foreground cursor-not-allowed font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
              onClick={() => handleCopyKey("private")}
              disabled={!settings.vapidPrivateKey}
              aria-label="비공개 키 복사"
            >
              {copiedKey === "private" ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">
            {LABELS.VAPID_SECURITY_TITLE}
          </AlertTitle>
          <AlertDescription className="text-sm sm:text-base">
            {LABELS.VAPID_SECURITY_DESCRIPTION}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
});

export default VapidKeySection;
