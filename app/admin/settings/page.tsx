"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, UserCheck, Bell, Terminal } from "lucide-react";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { AccessDenied } from "@/components/error/access-denied";
import { useSystemMode } from "@/components/providers/debug-provider";
import { useAuth } from "@/components/providers/auth-provider";
import type { SystemSettings } from "@/lib/types/settings";
import { useSettingsValidator } from "@/hooks/settings/useSettingsValidator";
import { useSettingsSaver } from "@/hooks/settings/useSettingsSaver";
import { SettingsHeader } from "@/components/admin/settings/SettingsHeader";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { LABELS } from "@/lib/constants/settings";
import { useSystemSettingsQuery } from "@/lib/hooks/query/use-system-settings-query";

// 동적 임포트로 코드 스플리팅 - 우선순위 기반 로딩
const GeneralTab = dynamic(
  () => import("@/components/admin/settings/tabs/GeneralTab"),
  {
    loading: () => <CardSkeleton count={2} />,
    ssr: false,
  }
);

const SecurityTab = dynamic(
  () => import("@/components/admin/settings/tabs/SecurityTab"),
  {
    loading: () => <CardSkeleton count={3} />,
    ssr: false,
  }
);

const VisitorTab = dynamic(
  () => import("@/components/admin/settings/tabs/VisitorTab"),
  {
    loading: () => <CardSkeleton count={4} />,
    ssr: false,
  }
);

const NotificationTab = dynamic(
  () => import("@/components/admin/settings/tabs/NotificationTab"),
  {
    loading: () => <CardSkeleton count={3} />,
    ssr: false,
  }
);

const SystemTab = dynamic(
  () => import("@/components/admin/settings/tabs/SystemTab"),
  {
    loading: () => <CardSkeleton count={4} />,
    ssr: false,
  }
);

// 탭 컴포넌트 최적화를 위한 메모이제이션
const TabContent = React.memo(
  ({ value, children }: { value: string; children: React.ReactNode }) => {
    return <TabsContent value={value}>{children}</TabsContent>;
  }
);

TabContent.displayName = "TabContent";

export default function SettingsPage() {
  const {
    data: settings,
    isLoading: loading,
    refetch,
  } = useSystemSettingsQuery();

  const { refreshSystemModes } = useSystemMode();
  const { user, isAdmin, isLoading } = useAuth();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(
    null
  );

  // settings가 로드되면 localSettings 업데이트
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const { validateSetting, inputValidations } = useSettingsValidator({ user });

  const { saving, handleSaveAll } = useSettingsSaver({
    onSettingsUpdate: setLocalSettings,
    onUnsavedChangesChange: setUnsavedChanges,
    refreshSystemModes,
    refetch: async () => {
      refetch();
      return settings;
    },
  });

  // 탭 설정 최적화
  const tabConfig = useMemo(
    () => [
      {
        value: "general",
        icon: Settings,
        label: LABELS.TABS.GENERAL,
        component: GeneralTab,
      },
      {
        value: "security",
        icon: Shield,
        label: LABELS.TABS.SECURITY,
        component: SecurityTab,
      },
      {
        value: "visitor",
        icon: UserCheck,
        label: LABELS.TABS.VISITOR,
        component: VisitorTab,
      },
      {
        value: "notifications",
        icon: Bell,
        label: LABELS.TABS.NOTIFICATIONS,
        component: NotificationTab,
      },
      {
        value: "system",
        icon: Terminal,
        label: LABELS.TABS.SYSTEM,
        component: SystemTab,
      },
    ],
    []
  );

  // useCallback으로 설정 변경 핸들러 최적화
  const handleSettingChange = useCallback(
    <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
      if (!localSettings) return;

      // 로컬 상태 즉시 업데이트
      setLocalSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      setUnsavedChanges(true);

      // 숫자 입력 필드에 대해서만 비동기 유효성 검사 수행
      if (key in inputValidations) {
        validateSetting(key, value).then((isValid) => {
          if (!isValid && settings) {
            // 유효하지 않은 경우 이전 값으로 복원
            setLocalSettings((prev) =>
              prev ? { ...prev, [key]: settings[key] } : prev
            );
            setUnsavedChanges(false);
          }
        });
      }
    },
    [localSettings, settings, inputValidations, validateSetting]
  );

  // useCallback으로 저장 핸들러 최적화
  const handleSave = useCallback(() => {
    if (localSettings) {
      handleSaveAll(localSettings);
    }
  }, [localSettings, handleSaveAll]);

  // 설정이 로딩 중이거나 localSettings가 없거나 프로필 로딩 중일 때는 스켈레톤 표시
  if (loading || !localSettings || isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <SettingsHeader
          saving={false}
          unsavedChanges={false}
          onSave={() => {}}
        />
        <CardSkeleton count={5} />
      </div>
    );
  }

  // admin 권한 체크
  if (!isAdmin) {
    return (
      <AccessDenied
        title={ERROR_CONFIGS.PERMISSION.title}
        description={ERROR_CONFIGS.PERMISSION.description}
        requiredRole="관리자"
        currentRole="일반 사용자"
      />
    );
  }

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <SettingsHeader
          saving={saving}
          unsavedChanges={unsavedChanges}
          onSave={handleSave}
        />
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 h-auto">
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

            {/* 조건부 렌더링으로 활성 탭만 로딩 */}
            {tabConfig.map((tab) => {
              const TabComponent = tab.component;
              return (
                <TabContent key={tab.value} value={tab.value}>
                  {activeTab === tab.value && (
                    <TabComponent
                      settings={localSettings}
                      onUpdate={handleSettingChange}
                      isLoading={tab.value === "general" ? saving : loading}
                    />
                  )}
                </TabContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
