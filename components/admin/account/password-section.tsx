import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { getAuthErrorMessage } from "@/lib/utils/validation";
import { usePasswordRules } from "@/lib/utils/validation/usePasswordRules";
import {
  createChangePasswordFormSchema,
  createDefaultChangePasswordFormSchema,
  type ChangePasswordFormData,
} from "@/lib/utils/validation/auth-validation";
import type { PasswordFormData } from "@/lib/types/account";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import AccountCardHeader from "./AccountCardHeader";
import {
  LABELS as AUTH_LABELS,
  PLACEHOLDERS as AUTH_PLACEHOLDERS,
} from "@/lib/constants/auth";
import {
  BUTTONS,
  LABELS,
  PLACEHOLDERS,
  PAGE_HEADER,
} from "@/lib/constants/account";

interface PasswordSectionProps {
  profile: {
    email?: string;
  } | null;
  loading: boolean;
  onPasswordChange: (data: PasswordFormData) => Promise<void>;
}

export function PasswordSection({
  profile,
  loading,
  onPasswordChange,
}: PasswordSectionProps) {
  const [schema, setSchema] = useState<any>(null);
  const { showInfo, showError } = useCommonToast();

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
    showInfo("비밀번호 변경 시작", "현재 비밀번호를 확인하는 중입니다...");

    try {
      // 현재 비밀번호 검증
      if (!profile?.email) {
        throw new Error("사용자 이메일을 찾을 수 없습니다.");
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: data.currentPassword,
      });

      if (verifyError) {
        const authError = getAuthErrorMessage(verifyError);
        showError("인증 실패", authError.message);
        return;
      }

      // 기존 로직 사용
      const passwordData: PasswordFormData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };
      await onPasswordChange(passwordData);
      form.reset();
    } catch (error: any) {
      devLog.error("Password change error:", error);
      const authError = getAuthErrorMessage(error);
      showError("오류", authError.message);
    }
  };

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
                <FormItem>
                  <FormLabel className="text-sm text-gray-800">
                    {LABELS.CURRENT_PASSWORD}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={PLACEHOLDERS.CURRENT_PASSWORD_PLACEHOLDER}
                        autoComplete="current-password"
                        className="h-10 pl-10"
                        disabled={loading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-800">
                    {AUTH_LABELS.PASSWORD}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={AUTH_PLACEHOLDERS.PASSWORD}
                        autoComplete="new-password"
                        className="h-10 pl-10"
                        disabled={loading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                  <PasswordStrength password={field.value} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-800">
                    {AUTH_LABELS.CONFIRM_PASSWORD}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={AUTH_PLACEHOLDERS.CONFIRM_PASSWORD}
                        autoComplete="new-password"
                        className="h-10 pl-10"
                        disabled={loading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
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
