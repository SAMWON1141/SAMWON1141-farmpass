"use client";

import { ProfileSection } from "./profile-section";
import { CompanySection } from "./company-section";
import { SecuritySection } from "./security-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User2, Building2, Shield } from "lucide-react";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { LABELS } from "@/lib/constants/account";
import { useAccountActions } from "@/hooks/useAccountActions";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { getAuthErrorMessage } from "@/lib/utils/validation/validation";
import type { Profile } from "@/lib/types";

interface AccountTabsProps {
  profile: Profile;
  userId: string;
}

export function AccountTabs({ profile, userId }: AccountTabsProps) {
  const { showInfo, showSuccess, showError } = useCommonToast();
  const {
    isLoading,
    handleImageUpload,
    handleImageDelete,
    handleProfileSave,
    handleCompanySave,
    handlePasswordChange,
  } = useAccountActions({ profile, userId });

  // 저장 핸들러들
  const handleProfileSaveWrapped = async (data: any) => {
    showInfo("프로필 저장 시작", "프로필 정보를 저장하는 중입니다...");

    try {
      const result = await handleProfileSave(data);
      if (result.success) {
        showSuccess(
          "프로필 저장 완료",
          result.message || "프로필 정보가 성공적으로 저장되었습니다."
        );
      } else {
        showError(
          "프로필 저장 실패",
          result.message || "프로필 정보 저장에 실패했습니다."
        );
      }
    } catch (error) {
      const authError = getAuthErrorMessage(error);
      showError("프로필 저장 실패", authError.message);
    }
  };

  const handleCompanySaveWrapped = async (data: any) => {
    showInfo("회사 정보 저장 시작", "회사 정보를 저장하는 중입니다...");

    try {
      const result = await handleCompanySave(data);
      if (result.success) {
        showSuccess(
          "회사 정보 저장 완료",
          result.message || "회사 정보가 성공적으로 저장되었습니다."
        );
      } else {
        showError(
          "회사 정보 저장 실패",
          result.message || "회사 정보 저장에 실패했습니다."
        );
      }
    } catch (error) {
      const authError = getAuthErrorMessage(error);
      showError("회사 정보 저장 실패", authError.message);
    }
  };

  const handlePasswordChangeWrapped = async (data: any) => {
    showInfo("비밀번호 변경 시작", "비밀번호를 변경하는 중입니다...");

    try {
      const result = await handlePasswordChange(data);
      if (result.success) {
        showSuccess(
          "비밀번호 변경 완료",
          "비밀번호가 성공적으로 변경되었습니다."
        );
      } else {
        showError(
          "비밀번호 변경 실패",
          result.error || "비밀번호 변경에 실패했습니다."
        );
      }
    } catch (error) {
      const authError = getAuthErrorMessage(error);
      showError("비밀번호 변경 실패", authError.message);
    }
  };

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 md:p-2 min-w-0"
            >
              <User2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs hidden sm:inline truncate">
                {LABELS.TABS.PROFILE}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 md:p-2 min-w-0"
            >
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs hidden md:inline truncate">
                {LABELS.TABS.COMPANY}
              </span>
              <span className="text-[10px] sm:text-xs hidden sm:inline md:hidden truncate">
                {LABELS.COMPANY_NAME}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 md:p-2 min-w-0"
            >
              <Shield className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs hidden sm:inline truncate">
                {LABELS.TABS.SECURITY}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection
              profile={profile}
              loading={isLoading}
              onSave={handleProfileSaveWrapped}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
            />
          </TabsContent>

          <TabsContent value="company">
            <CompanySection
              profile={profile}
              loading={isLoading}
              onSave={handleCompanySaveWrapped}
            />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection
              profile={profile}
              loading={isLoading}
              onPasswordChange={handlePasswordChangeWrapped}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
