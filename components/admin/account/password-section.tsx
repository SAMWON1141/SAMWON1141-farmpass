import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { PasswordField } from "@/components/auth";
import { Card, CardContent } from "@/components/ui/card";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { usePasswordRules } from "@/lib/utils/validation/usePasswordRules";
import {
  createChangePasswordFormSchema,
  createDefaultChangePasswordFormSchema,
  type ChangePasswordFormData,
} from "@/lib/utils/validation/auth-validation";
import { Loader2 } from "lucide-react";
import AccountCardHeader from "./AccountCardHeader";
import {
  BUTTONS,
  LABELS,
  PAGE_HEADER,
  SOCIAL_LOGIN_MESSAGES,
} from "@/lib/constants/account";

interface PasswordSectionProps {
  profile: {
    email?: string;
  } | null;
  loading: boolean;
  onPasswordChange: (data: ChangePasswordFormData) => Promise<void>;
  socialUserInfo?: {
    isSocialUser: boolean;
    socialProvider: string;
    allProviders: string[];
    socialProviders: string[];
  };
}

export function PasswordSection({
  profile,
  loading,
  onPasswordChange,
  socialUserInfo,
}: PasswordSectionProps) {
  const [schema, setSchema] = useState<any>(null);
  const { showError } = useCommonToast();

  // 시스템 설정에서 비밀번호 규칙 가져오기 (React Query 기반)
  const { rules: passwordRules, isLoading: isPasswordRulesLoading } =
    usePasswordRules();

  // 동적 스키마 생성
  useEffect(() => {
    if (isPasswordRulesLoading) return;

    try {
      const dynamicSchema = createChangePasswordFormSchema(passwordRules);
      setSchema(dynamicSchema);
    } catch (error) {
      devLog.error("Failed to create change password schema:", error);
      // 에러 시 기본 스키마 사용
      setSchema(createDefaultChangePasswordFormSchema());
    }
  }, [passwordRules, isPasswordRulesLoading]);

  const form = useForm<ChangePasswordFormData>({
    resolver: schema
      ? zodResolver(schema)
      : zodResolver(createDefaultChangePasswordFormSchema()),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    try {
      await onPasswordChange(data);
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      showError("오류", errorMessage);
    }
  };

  // 소셜 로그인 사용자 UI
  if (socialUserInfo?.isSocialUser) {
    return (
      <Card>
        <AccountCardHeader
          icon={Shield}
          title={PAGE_HEADER.PASSWORD_CHANGE_TITLE}
          description={PAGE_HEADER.PASSWORD_CHANGE_DESCRIPTION}
        />
        <CardContent>
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-4 relative">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            </div>
            <div className="text-lg sm:text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">
              {LABELS.SOCIAL_LOGIN_ACCOUNT}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm mx-auto">
              {socialUserInfo.socialProvider === "google" &&
                SOCIAL_LOGIN_MESSAGES.GOOGLE_LOGIN}
              {socialUserInfo.socialProvider === "kakao" &&
                SOCIAL_LOGIN_MESSAGES.KAKAO_LOGIN}
              {socialUserInfo.socialProvider !== "google" &&
                socialUserInfo.socialProvider !== "kakao" &&
                SOCIAL_LOGIN_MESSAGES.OTHER_LOGIN(
                  socialUserInfo.socialProvider
                )}
              <br />
              <br />
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {LABELS.SOCIAL_PASSWORD_CHANGE_GUIDE}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <AccountCardHeader
        icon={Shield}
        title={PAGE_HEADER.PASSWORD_CHANGE_TITLE}
        description={PAGE_HEADER.PASSWORD_CHANGE_DESCRIPTION}
      />
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={profile?.email || ""}
              readOnly
              className="hidden"
            />

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <PasswordField type="current" field={field} loading={loading} />
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <PasswordField type="new" field={field} loading={loading} />
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <PasswordField type="confirm" field={field} loading={loading} />
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {BUTTONS.CHANGING}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {BUTTONS.CHANGE_PASSWORD}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
