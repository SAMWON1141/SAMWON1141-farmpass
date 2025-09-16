"use client";

import { useMemo } from "react";
import { Progress } from "./progress";
import { useSystemSettingsQuery } from "@/lib/hooks/query/use-system-settings-query";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { LABELS } from "@/lib/constants/common";
import { SECURITY_DEFAULTS } from "@/lib/constants/defaults";
import type { PasswordRules } from "@/lib/types/settings";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  // 전역 시스템 설정 사용
  const { data: settings, isLoading, error } = useSystemSettingsQuery();
  // 시스템 설정에서 비밀번호 규칙 추출
  const rules: PasswordRules = useMemo(() => {
    if (!settings) {
      devLog.warn(
        "System settings not available, using default password rules"
      );
      return SECURITY_DEFAULTS;
    }

    return {
      passwordMinLength: settings.passwordMinLength,
      passwordRequireSpecialChar: settings.passwordRequireSpecialChar,
      passwordRequireNumber: settings.passwordRequireNumber,
      passwordRequireUpperCase: settings.passwordRequireUpperCase,
      passwordRequireLowerCase: settings.passwordRequireLowerCase,
    };
  }, [settings]);

  // 에러 처리
  if (error) {
    devLog.error("Failed to fetch password rules:", error);
    devLog.warn("Using default password rules as fallback");
  } // 컴포넌트 마운트 시에만 실행

  const requirements = [
    {
      id: "length",
      label: LABELS.PASSWORD_STRENGTH_LENGTH_LABEL.replace(
        "{minLength}",
        rules.passwordMinLength.toString()
      ),
      shortLabel: LABELS.PASSWORD_STRENGTH_LENGTH_SHORT.replace(
        "{minLength}",
        rules.passwordMinLength.toString()
      ),
      validator: (pass: string) => pass.length >= rules.passwordMinLength,
    },
    {
      id: "number",
      label: LABELS.PASSWORD_STRENGTH_NUMBER_LABEL,
      shortLabel: LABELS.PASSWORD_STRENGTH_NUMBER_SHORT,
      validator: (pass: string) =>
        !rules.passwordRequireNumber || /\d/.test(pass),
      optional: !rules.passwordRequireNumber,
    },
    {
      id: "uppercase",
      label: LABELS.PASSWORD_STRENGTH_UPPERCASE_LABEL,
      shortLabel: LABELS.PASSWORD_STRENGTH_UPPERCASE_SHORT,
      validator: (pass: string) =>
        !rules.passwordRequireUpperCase || /[A-Z]/.test(pass),
      optional: !rules.passwordRequireUpperCase,
    },
    {
      id: "lowercase",
      label: LABELS.PASSWORD_STRENGTH_LOWERCASE_LABEL,
      shortLabel: LABELS.PASSWORD_STRENGTH_LOWERCASE_SHORT,
      validator: (pass: string) =>
        !rules.passwordRequireLowerCase || /[a-z]/.test(pass),
      optional: !rules.passwordRequireLowerCase,
    },
    {
      id: "special",
      label: LABELS.PASSWORD_STRENGTH_SPECIAL_LABEL,
      shortLabel: LABELS.PASSWORD_STRENGTH_SPECIAL_SHORT,
      validator: (pass: string) =>
        !rules.passwordRequireSpecialChar ||
        /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      optional: !rules.passwordRequireSpecialChar,
    },
  ];

  const getStrengthPercentage = () => {
    if (!password) return 0;
    const validRequirements = requirements.filter((req) =>
      req.validator(password)
    ).length;
    return (validRequirements / requirements.length) * 100;
  };

  const getStrengthColor = () => {
    const strength = getStrengthPercentage();
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = () => {
    const strength = getStrengthPercentage();
    if (strength <= 20) return "text-red-600";
    if (strength <= 40) return "text-orange-600";
    if (strength <= 60) return "text-yellow-600";
    if (strength <= 80) return "text-blue-600";
    return "text-green-700 dark:text-green-400";
  };

  const getStrengthText = () => {
    const strength = getStrengthPercentage();
    if (strength <= 20) return LABELS.PASSWORD_STRENGTH_VERY_WEAK;
    if (strength <= 40) return LABELS.PASSWORD_STRENGTH_WEAK;
    if (strength <= 60) return LABELS.PASSWORD_STRENGTH_NORMAL;
    if (strength <= 80) return LABELS.PASSWORD_STRENGTH_STRONG;
    return LABELS.PASSWORD_STRENGTH_VERY_STRONG;
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-6 bg-gray-200 rounded"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <div
          className="flex flex-wrap gap-1 min-w-0"
          style={{ rowGap: 4, columnGap: 4 }}
        >
          {requirements.map((req) => (
            <span
              key={req.id}
              className={`inline-flex items-center rounded px-2 py-1 text-xs whitespace-nowrap ${
                req.validator(password)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
              style={{ minWidth: 40 }}
            >
              <span className="hidden sm:inline">{req.shortLabel}</span>
              <span className="sm:hidden">
                {req.id === "length"
                  ? "길이"
                  : req.id === "number"
                  ? "12345"
                  : req.id === "uppercase"
                  ? "ABCD"
                  : req.id === "lowercase"
                  ? "abcd"
                  : req.id === "special"
                  ? "#@!%^&"
                  : req.shortLabel}
              </span>
              {req.optional && (
                <span className="hidden sm:inline">
                  {LABELS.PASSWORD_STRENGTH_OPTIONAL}
                </span>
              )}
            </span>
          ))}
        </div>
        <span
          className={`text-sm font-medium ${getStrengthTextColor()} text-left`}
        >
          {getStrengthText()}
        </span>
      </div>
      <Progress
        value={getStrengthPercentage()}
        className={getStrengthColor()}
        aria-label={`비밀번호 강도: ${getStrengthPercentage()}%`}
      />
    </div>
  );
}
