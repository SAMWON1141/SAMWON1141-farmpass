"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User2, Building2, Shield, FileText } from "lucide-react";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { LABELS } from "@/lib/constants/account";
import { useAccountActions } from "@/hooks/account/useAccountActions";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import type { Profile } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import React from "react";

// 동적 임포트로 탭 컴포넌트들 최적화
const ProfileSection = dynamic(
  () =>
    import("./profile-section").then((mod) => ({
      default: mod.ProfileSection,
    })),
  { loading: () => <CardSkeleton count={2} />, ssr: false }
);

const CompanySection = dynamic(
  () =>
    import("./company-section").then((mod) => ({
      default: mod.CompanySection,
    })),
  { loading: () => <CardSkeleton count={2} />, ssr: false }
);

const SecuritySection = dynamic(
  () =>
    import("./security-section").then((mod) => ({
      default: mod.SecuritySection,
    })),
  { loading: () => <CardSkeleton count={2} />, ssr: false }
);

const PrivacySection = dynamic(
  () =>
    import("./privacy-section").then((mod) => ({
      default: mod.PrivacySection,
    })),
  { loading: () => <CardSkeleton count={2} />, ssr: false }
);

interface AccountTabsProps {
  profile: Profile;
}

export function AccountTabs({ profile }: AccountTabsProps) {
  const { showInfo, showSuccess, showError } = useCommonToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const defaultTab = searchParams.get("tab") || "profile";

  // 소셜 로그인 사용자 감지
  const socialUserInfo = useMemo(() => {
    if (isAuthenticated && user) {
      const provider = user.app_metadata?.provider;
      return {
        isSocialUser: provider && provider !== "email",
        socialProvider: provider || "",
        allProviders: provider ? [provider] : [],
        socialProviders: provider && provider !== "email" ? [provider] : [],
      };
    }
    return {
      isSocialUser: false,
      socialProvider: "",
      allProviders: [],
      socialProviders: [],
    };
  }, [user]) as {
    isSocialUser: boolean;
    socialProvider: string;
    allProviders: string[];
    socialProviders: string[];
  };

  // 탭 설정 최적화
  const tabConfig = useMemo(
    () => [
      {
        value: "profile",
        icon: User2,
        label: LABELS.TABS.PROFILE,
        component: ProfileSection,
      },
      {
        value: "company",
        icon: Building2,
        label: LABELS.TABS.COMPANY,
        component: CompanySection,
      },
      {
        value: "security",
        icon: Shield,
        label: LABELS.TABS.SECURITY,
        component: SecuritySection,
      },
      {
        value: "privacy",
        icon: FileText,
        label: LABELS.TABS.PRIVACY,
        component: PrivacySection,
      },
    ],
    []
  );

  // TabContent 컴포넌트 메모이제이션
  const TabContent = React.memo(
    ({ value, children }: { value: string; children: React.ReactNode }) => {
      return <TabsContent value={value}>{children}</TabsContent>;
    }
  );
  TabContent.displayName = "TabContent";

  const {
    isLoading,
    handleImageUpload,
    handleImageDelete,
    handleProfileSave,
    handleCompanySave,
    handlePasswordChange,
  } = useAccountActions({ profile, userId: user?.id });

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      router.push(`/admin/account?${params.toString()}`);
    },
    [searchParams, router]
  );

  // 저장 핸들러들 - useCallback으로 메모이제이션
  const handleProfileSaveWrapped = useCallback(
    async (data: any) => {
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        showError("프로필 저장 실패", errorMessage);
      }
    },
    [handleProfileSave, showInfo, showSuccess, showError]
  );

  const handleCompanySaveWrapped = useCallback(
    async (data: any) => {
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        showError("회사 정보 저장 실패", errorMessage);
      }
    },
    [handleCompanySave, showInfo, showSuccess, showError]
  );

  const handlePasswordChangeWrapped = useCallback(
    async (data: any) => {
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        showError("비밀번호 변경 실패", errorMessage);
      }
    },
    [handlePasswordChange, showInfo, showSuccess, showError]
  );

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="space-y-6">
        <Tabs
          value={defaultTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center justify-center gap-0.5 p-1 sm:p-1.5 md:p-2 min-w-0"
                >
                  <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs hidden sm:inline truncate">
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 조건부 렌더링으로 활성 탭만 로드 */}
          {defaultTab === "profile" && (
            <TabContent value="profile">
              <ProfileSection
                profile={profile}
                loading={isLoading}
                onSave={handleProfileSaveWrapped}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
              />
            </TabContent>
          )}

          {defaultTab === "company" && (
            <TabContent value="company">
              <CompanySection
                profile={profile}
                loading={isLoading}
                onSave={handleCompanySaveWrapped}
              />
            </TabContent>
          )}

          {defaultTab === "security" && (
            <TabContent value="security">
              <SecuritySection
                profile={profile}
                loading={isLoading}
                onPasswordChange={handlePasswordChangeWrapped}
                socialUserInfo={socialUserInfo}
              />
            </TabContent>
          )}

          {defaultTab === "privacy" && (
            <TabContent value="privacy">
              <PrivacySection userId={user?.id} />
            </TabContent>
          )}
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
