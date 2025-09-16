"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";
import { LABELS, PLACEHOLDERS, PAGE_HEADER } from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";
import { useNumberInput } from "@/hooks/ui/use-number-input";
import SettingsCardHeader from "../SettingsCardHeader";

type PasswordPolicySettings = Pick<
  SystemSettings,
  | "passwordMinLength"
  | "passwordRequireSpecialChar"
  | "passwordRequireNumber"
  | "passwordRequireUpperCase"
  | "passwordRequireLowerCase"
>;

interface PasswordPolicyCardProps {
  settings: PasswordPolicySettings;
  onUpdate: (key: keyof PasswordPolicySettings, value: any) => void;
  isLoading?: boolean;
}

export default function PasswordPolicyCard({
  settings,
  onUpdate,
  isLoading = false,
}: PasswordPolicyCardProps) {
  const passwordMinLength = useNumberInput("passwordMinLength");

  // 디스플레이용 상태
  const [passwordMinLengthDisplay, setPasswordMinLengthDisplay] = useState(
    settings.passwordMinLength.toString()
  );

  // settings가 변경될 때 디스플레이 값 업데이트
  useEffect(() => {
    if (!passwordMinLength.isEditing) {
      setPasswordMinLengthDisplay(settings.passwordMinLength.toString());
    }
  }, [settings.passwordMinLength, passwordMinLength.isEditing]);

  return (
    <Card>
      <SettingsCardHeader
        icon={Lock}
        title={PAGE_HEADER.PASSWORD_POLICY_TITLE}
        description={PAGE_HEADER.PASSWORD_POLICY_DESCRIPTION}
      />
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="passwordMinLength"
              className="text-sm sm:text-base font-medium"
            >
              {PLACEHOLDERS.PASSWORD_MIN_LENGTH}
            </Label>
            <Input
              id="passwordMinLength"
              type="number"
              min={passwordMinLength.min}
              max={passwordMinLength.max}
              value={passwordMinLengthDisplay}
              onChange={(e) =>
                passwordMinLength.handleChange(
                  e,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.passwordMinLength) {
                      onUpdate("passwordMinLength", value);
                    }
                  },
                  setPasswordMinLengthDisplay
                )
              }
              onBlur={(e) =>
                passwordMinLength.handleBlur(
                  e.target.value,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.passwordMinLength) {
                      onUpdate("passwordMinLength", value);
                    }
                  },
                  setPasswordMinLengthDisplay
                )
              }
              disabled={isLoading}
            />
            <p className="text-sm sm:text-base text-muted-foreground">
              {LABELS.PASSWORD_MIN_LENGTH_DESC}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="passwordRequireSpecialChar"
                className="text-sm sm:text-base font-medium"
              >
                {LABELS.PASSWORD_SPECIAL_CHAR}
              </Label>
            </div>
            <Switch
              id="passwordRequireSpecialChar"
              checked={settings.passwordRequireSpecialChar}
              onCheckedChange={(checked) =>
                onUpdate("passwordRequireSpecialChar", checked)
              }
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="passwordRequireNumber"
                className="text-sm sm:text-base font-medium"
              >
                {LABELS.PASSWORD_NUMBER}
              </Label>
            </div>
            <Switch
              id="passwordRequireNumber"
              checked={settings.passwordRequireNumber}
              onCheckedChange={(checked) =>
                onUpdate("passwordRequireNumber", checked)
              }
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="passwordRequireUpperCase"
                className="text-sm sm:text-base font-medium"
              >
                {LABELS.PASSWORD_UPPERCASE}
              </Label>
            </div>
            <Switch
              id="passwordRequireUpperCase"
              checked={settings.passwordRequireUpperCase}
              onCheckedChange={(checked) =>
                onUpdate("passwordRequireUpperCase", checked)
              }
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="passwordRequireLowerCase"
                className="text-sm sm:text-base font-medium"
              >
                {LABELS.PASSWORD_LOWERCASE}
              </Label>
            </div>
            <Switch
              id="passwordRequireLowerCase"
              checked={settings.passwordRequireLowerCase}
              onCheckedChange={(checked) =>
                onUpdate("passwordRequireLowerCase", checked)
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
