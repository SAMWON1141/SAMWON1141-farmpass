"use client";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Mail,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Loader2,
  History,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { AccessDenied } from "@/components/error/access-denied";
import { useAuth } from "@/components/providers/auth-provider";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { TermsSkeleton } from "@/components/ui/skeleton";
import { CommonPageWrapper } from "@/components/admin/management/shared/CommonPageWrapper";
import TermsCardHeader from "@/components/admin/terms/TermsCardHeader";
import { markdownComponents } from "@/lib/utils/markdown/markdown-components";
import { useTermsManagement } from "@/hooks/terms/use-terms-management";
import {
  PAGE_HEADER,
  BUTTONS,
  LABELS,
  PLACEHOLDERS,
} from "@/lib/constants/terms";
import { useMemo, useCallback, memo, useState, useEffect } from "react";

// SSR 환경에서 에디터 오류 방지 - TermsSkeleton으로 로딩 표시
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <TermsSkeleton />,
});

// 메모이제이션된 컴포넌트들
const MemoizedReactMarkdown = memo(ReactMarkdown);
const MemoizedTermsCardHeader = memo(TermsCardHeader);

export default function TermsManagementPage() {
  const { isAdmin, isLoading } = useAuth();

  // Priority-based loading states
  const [showSecondary, setShowSecondary] = useState(false);
  const [showTertiary, setShowTertiary] = useState(false);

  // 비즈니스 로직 훅 사용
  const {
    activeTab,
    isPreviewMode,
    localContent,
    selectedVersion,
    currentTerm,
    currentTabTerms,
    termsLoading,
    handleLoadVersion,
    handleSave,
    handleActivate,
    handleCreateNewVersion,
    handleDelete,
    handleContentChange,
    handleTabChange,
    setIsPreviewMode,
  } = useTermsManagement();

  // Priority-based loading with timeouts
  useEffect(() => {
    if (!termsLoading && !isLoading) {
      const timer1 = setTimeout(() => setShowSecondary(true), 100);
      const timer2 = setTimeout(() => setShowTertiary(true), 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [termsLoading, isLoading]);

  // 메모이제이션된 탭 설정
  const tabConfig = useMemo(
    () => [
      { value: "privacy", icon: Shield, label: LABELS.TABS.PRIVACY },
      {
        value: "privacy_consent",
        icon: Shield,
        label: LABELS.TABS.PRIVACY_CONSENT,
      },
      { value: "terms", icon: FileText, label: LABELS.TABS.TERMS },
      { value: "marketing", icon: Mail, label: LABELS.TABS.MARKETING },
    ],
    []
  );

  // 메모이제이션된 정렬된 버전 목록
  const sortedVersions = useMemo(() => {
    return currentTabTerms
      .sort((a, b) => parseFloat(b.version) - parseFloat(a.version))
      .map((term) => ({
        version: term.version,
        isActive: term.is_active,
        label: `v${term.version}${
          term.is_active ? LABELS.VERSION_ACTIVE_SUFFIX : ""
        }`,
      }));
  }, [currentTabTerms]);

  // 메모이제이션된 핸들러들
  const handlePreviewModeChange = useCallback(
    (checked: boolean) => {
      setIsPreviewMode(checked);
    },
    [setIsPreviewMode]
  );

  const handleVersionChange = useCallback(
    (version: string) => {
      handleLoadVersion(version);
    },
    [handleLoadVersion]
  );

  if (termsLoading || isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <PageHeader
          title={PAGE_HEADER.PAGE_TITLE}
          description={PAGE_HEADER.PAGE_DESCRIPTION}
          icon={FileText}
        />
        <TermsSkeleton />
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
          icon={FileText}
        />
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
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

            <TabsContent value={activeTab}>
              <CommonPageWrapper>
                {/* 약관 편집 섹션 - Priority-based loading */}
                {showSecondary && (
                  <section className="space-y-4 lg:space-y-6">
                    <Card>
                      <MemoizedTermsCardHeader
                        icon={
                          activeTab === "privacy" ||
                          activeTab === "privacy_consent"
                            ? Shield
                            : activeTab === "terms"
                            ? FileText
                            : Mail
                        }
                        title={
                          currentTerm?.title ||
                          (activeTab === "privacy"
                            ? LABELS.DEFAULT_PRIVACY_TITLE
                            : activeTab === "privacy_consent"
                            ? LABELS.DEFAULT_PRIVACY_CONSENT_TITLE
                            : activeTab === "terms"
                            ? LABELS.DEFAULT_TERMS_TITLE
                            : activeTab === "marketing"
                            ? LABELS.DEFAULT_MARKETING_TITLE
                            : LABELS.DEFAULT_TERMS_FALLBACK)
                        }
                        description={PAGE_HEADER.TERMS_CARD_DESCRIPTION}
                        version={currentTerm?.version || "1.0"}
                        isActive={currentTerm?.is_active || false}
                        publishedAt={
                          currentTerm?.published_at
                            ? new Date(currentTerm.published_at)
                            : undefined
                        }
                        updatedAt={
                          currentTerm?.updated_at
                            ? new Date(currentTerm.updated_at)
                            : new Date()
                        }
                      />
                      <CardContent className="space-y-4">
                        {/* 에디터/미리보기 영역 - Priority-based loading */}
                        {showTertiary && (
                          <>
                            {isPreviewMode ? (
                              <div className="h-[calc(100vh-400px)] min-h-[400px] sm:min-h-[500px] overflow-y-auto">
                                <div className="prose max-w-full break-all">
                                  <div className="markdown-content p-4 border rounded-lg bg-muted/50">
                                    <MemoizedReactMarkdown
                                      components={markdownComponents}
                                    >
                                      {localContent}
                                    </MemoizedReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                data-color-mode="light"
                                className="h-[calc(100vh-400px)] min-h-[400px] sm:min-h-[500px]"
                              >
                                <MDEditor
                                  value={localContent}
                                  onChange={(val) =>
                                    handleContentChange(val || "")
                                  }
                                  height="100%"
                                  preview="edit"
                                  data-color-mode="light"
                                  textareaProps={{
                                    "aria-label":
                                      "약관 내용을 마크다운 형식으로 입력하세요",
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        <Separator />

                        {/* 액션 버튼들 */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-4">
                            {/* 미리보기 모드 - 항상 한 줄 */}
                            <div className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                id="preview-mode"
                                checked={isPreviewMode}
                                onChange={(e) =>
                                  handlePreviewModeChange(e.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label
                                htmlFor="preview-mode"
                                className="text-sm text-muted-foreground"
                              >
                                {LABELS.PREVIEW_MODE}
                              </label>
                            </div>
                            {/* 배지와 셀렉트박스 - 모바일에서는 같은 줄 */}
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    currentTerm?.is_active
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {currentTerm?.is_active ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {LABELS.STATUS_ACTIVE}
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 mr-1" />
                                      {LABELS.STATUS_INACTIVE}
                                    </>
                                  )}
                                </Badge>
                              </div>
                              {currentTabTerms.length > 1 && (
                                <div className="flex items-center gap-2">
                                  <History className="h-4 w-4 text-muted-foreground" />
                                  <Select
                                    value={selectedVersion}
                                    onValueChange={handleVersionChange}
                                  >
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                      <SelectValue
                                        placeholder={
                                          PLACEHOLDERS.VERSION_SELECT
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sortedVersions.map((version) => (
                                        <SelectItem
                                          key={version.version}
                                          value={version.version}
                                          className="text-xs"
                                        >
                                          {version.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                              onClick={handleSave}
                              disabled={isLoading}
                              size="sm"
                              variant="secondary"
                              className="w-full sm:w-auto"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              {isLoading ? BUTTONS.SAVING : BUTTONS.SAVE_TEMP}
                            </Button>
                            <Button
                              onClick={handleCreateNewVersion}
                              disabled={isLoading}
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              {BUTTONS.CREATE_NEW_VERSION}
                            </Button>
                            <Button
                              onClick={handleActivate}
                              disabled={isLoading}
                              variant={
                                currentTerm?.is_active
                                  ? "destructive"
                                  : "default"
                              }
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : currentTerm?.is_active ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              {isLoading
                                ? BUTTONS.ACTIVATING
                                : currentTerm?.is_active
                                ? BUTTONS.DEACTIVATE
                                : BUTTONS.ACTIVATE}
                            </Button>
                            <Button
                              onClick={handleDelete}
                              disabled={isLoading}
                              variant="destructive"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {isLoading
                                ? BUTTONS.DELETING
                                : BUTTONS.DELETE_TERMS}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </CommonPageWrapper>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
