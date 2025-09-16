"use client";

import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Building2, FileText, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { AccessDenied } from "@/components/error/access-denied";
import { useAuth } from "@/components/providers/auth-provider";
import { LABELS, PAGE_HEADER } from "@/lib/constants/management";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { CardSkeleton } from "@/components/ui/skeleton";

// 동적 임포트로 코드 스플리팅 - 우선순위 기반 로딩
const DashboardTab = dynamic(
  () =>
    import("@/components/admin/management/tabs/DashboardTab").then((mod) => ({
      default: mod.DashboardTab,
    })),
  {
    loading: () => <CardSkeleton count={3} />,
    ssr: false,
  }
);

const UsersTab = dynamic(
  () =>
    import("@/components/admin/management/tabs/UsersTab").then((mod) => ({
      default: mod.UsersTab,
    })),
  {
    loading: () => <CardSkeleton count={4} />,
    ssr: false,
  }
);

const FarmsTab = dynamic(
  () =>
    import("@/components/admin/management/tabs/FarmsTab").then((mod) => ({
      default: mod.FarmsTab,
    })),
  {
    loading: () => <CardSkeleton count={4} />,
    ssr: false,
  }
);

const LogsTab = dynamic(
  () =>
    import("@/components/admin/management/tabs/LogsTab").then((mod) => ({
      default: mod.LogsTab,
    })),
  {
    loading: () => <CardSkeleton count={5} />,
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

export default function SystemManagementPage() {
  const { isAdmin, isLoading } = useAuth();

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState("dashboard");

  // 탭 설정 최적화
  const tabConfig = useMemo(
    () => [
      {
        value: "dashboard",
        icon: BarChart3,
        label: LABELS.TABS.DASHBOARD,
        component: DashboardTab,
      },
      {
        value: "users",
        icon: Users,
        label: LABELS.TABS.USERS,
        component: UsersTab,
      },
      {
        value: "farms",
        icon: Building2,
        label: LABELS.TABS.FARMS,
        component: FarmsTab,
      },
      {
        value: "logs",
        icon: FileText,
        label: LABELS.TABS.LOGS,
        component: LogsTab,
      },
    ],
    []
  );

  // 프로필 로딩 중일 때는 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={Shield}
        />
        <CardSkeleton count={4} />
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
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={Shield}
        />

        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
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

            {/* 조건부 렌더링으로 활성 탭만 로딩 */}
            {tabConfig.map((tab) => {
              const TabComponent = tab.component;
              return (
                <TabContent key={tab.value} value={tab.value}>
                  {activeTab === tab.value && <TabComponent />}
                </TabContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
