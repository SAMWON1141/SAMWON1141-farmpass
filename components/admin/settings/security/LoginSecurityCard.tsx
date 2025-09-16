"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";
import { LABELS, PLACEHOLDERS, PAGE_HEADER } from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";
import { useNumberInput } from "@/hooks/ui/use-number-input";
import SettingsCardHeader from "../SettingsCardHeader";

type LoginSecuritySettings = Pick<
  SystemSettings,
  "maxLoginAttempts" | "accountLockoutDurationMinutes"
>;

interface LoginSecurityCardProps {
  settings: LoginSecuritySettings;
  onUpdate: (key: keyof LoginSecuritySettings, value: any) => void;
  isLoading?: boolean;
}

export default function LoginSecurityCard({
  settings,
  onUpdate,
  isLoading = false,
}: LoginSecurityCardProps) {
  const maxLoginAttempts = useNumberInput("maxLoginAttempts");
  const accountLockoutDuration = useNumberInput(
    "accountLockoutDurationMinutes"
  );

  // 디스플레이용 상태
  const [maxLoginAttemptsDisplay, setMaxLoginAttemptsDisplay] = useState(
    settings.maxLoginAttempts.toString()
  );
  const [accountLockoutDurationDisplay, setAccountLockoutDurationDisplay] =
    useState(settings.accountLockoutDurationMinutes.toString());

  // settings가 변경될 때 디스플레이 값 업데이트
  useEffect(() => {
    if (!maxLoginAttempts.isEditing) {
      setMaxLoginAttemptsDisplay(settings.maxLoginAttempts.toString());
    }
  }, [settings.maxLoginAttempts, maxLoginAttempts.isEditing]);

  useEffect(() => {
    if (!accountLockoutDuration.isEditing) {
      setAccountLockoutDurationDisplay(
        settings.accountLockoutDurationMinutes.toString()
      );
    }
  }, [
    settings.accountLockoutDurationMinutes,
    accountLockoutDuration.isEditing,
  ]);

  return (
    <Card>
      <SettingsCardHeader
        icon={UserCheck}
        title={PAGE_HEADER.LOGIN_SECURITY_TITLE}
        description={PAGE_HEADER.LOGIN_SECURITY_DESCRIPTION}
        iconClassName="h-5 w-5"
      />
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="maxLoginAttempts"
              className="text-sm sm:text-base font-medium"
            >
              {PLACEHOLDERS.MAX_LOGIN_ATTEMPTS}
            </Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              min={maxLoginAttempts.min}
              max={maxLoginAttempts.max}
              value={maxLoginAttemptsDisplay}
              onChange={(e) =>
                maxLoginAttempts.handleChange(
                  e,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.maxLoginAttempts) {
                      onUpdate("maxLoginAttempts", value);
                    }
                  },
                  setMaxLoginAttemptsDisplay
                )
              }
              onBlur={(e) =>
                maxLoginAttempts.handleBlur(
                  e.target.value,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.maxLoginAttempts) {
                      onUpdate("maxLoginAttempts", value);
                    }
                  },
                  setMaxLoginAttemptsDisplay
                )
              }
              disabled={isLoading}
            />
            <p className="text-sm sm:text-base text-muted-foreground">
              {LABELS.LOGIN_ATTEMPTS_DESC}
            </p>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="accountLockoutDurationMinutes"
              className="text-sm sm:text-base font-medium"
            >
              {PLACEHOLDERS.ACCOUNT_LOCKOUT_DURATION}
            </Label>
            <Input
              id="accountLockoutDurationMinutes"
              type="number"
              min={accountLockoutDuration.min}
              max={accountLockoutDuration.max}
              value={accountLockoutDurationDisplay}
              onChange={(e) =>
                accountLockoutDuration.handleChange(
                  e,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.accountLockoutDurationMinutes) {
                      onUpdate("accountLockoutDurationMinutes", value);
                    }
                  },
                  setAccountLockoutDurationDisplay
                )
              }
              onBlur={(e) =>
                accountLockoutDuration.handleBlur(
                  e.target.value,
                  (value) => {
                    // 값이 실제로 변경되었을 때만 업데이트
                    if (value !== settings.accountLockoutDurationMinutes) {
                      onUpdate("accountLockoutDurationMinutes", value);
                    }
                  },
                  setAccountLockoutDurationDisplay
                )
              }
              disabled={isLoading}
            />
            <p className="text-sm sm:text-base text-muted-foreground">
              {LABELS.ACCOUNT_LOCKOUT_DESC}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
