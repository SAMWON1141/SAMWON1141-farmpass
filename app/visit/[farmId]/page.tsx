/**
 * 방문자 등록 페이지
 *
 * QR 코드를 스캔한 방문자가 농장 방문 정보를 등록하는 페이지입니다.
 *
 * 주요 기능:
 * - 농장 정보 표시 (농장명, 관리자, 연락처)
 * - 축사출입금지 안내문구 표시
 * - 방문자 정보 입력 폼 (이름, 연락처, 주소, 차량번호, 방문목적, 소독여부, 비고)
 * - 카카오 주소 API 연동
 * - 개인정보 수집 동의
 * - 등록 완료 후 회사 홍보 페이지 연결
 *
 * @route /visit/[farmId]
 * @param farmId - 농장 고유 식별자 (UUID)
 */
"use client";
import { useParams } from "next/navigation";
import { FormSkeleton } from "@/components/ui/skeleton";
import { FarmInfoCard } from "@/components/visitor/FarmInfoCard";
import { SuccessCard } from "@/components/visitor/SuccessCard";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { AdminError } from "@/components/error/admin-error";
import { useSystemSettingsQuery } from "@/lib/hooks/query/use-system-settings-query";
import { useVisitorForm } from "@/hooks/visitor/useVisitorForm";
import { VisitorForm } from "@/components/visitor/VisitorForm";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { useEffect, useMemo, useState, useCallback } from "react";
import { VisitorFormData } from "@/lib/utils/validation/visitor-validation";
import useBlockNavigation from "@/hooks/ui/use-before-unload";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { LABELS } from "@/lib/constants/visitor";
import { FormHeader } from "@/components/visitor/form-layout/FormHeader";
import type { VisitorSettings } from "@/lib/types/visitor";

/**
 * 방문자 등록 페이지 메인 컴포넌트
 *
 * QR 코드 스캔을 통해 접근하는 방문자 등록 폼을 제공합니다.
 * 농장 정보 표시, 방문자 정보 입력, 데이터 저장 기능을 포함합니다.
 */
export default function VisitPage() {
  const router = useRouter();
  const params = useParams();
  if (!params || !params.farmId) {
    throw new Error("잘못된 접근입니다. (farmId 없음)");
  }
  const farmId = params.farmId as string;
  const { showInfo, showSuccess, showError } = useCommonToast();
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  // 전역 시스템 설정 사용
  const {
    data: systemSettings,
    isLoading: isSettingsLoading,
    error: settingsError,
  } = useSystemSettingsQuery();

  // 시스템 설정에서 방문자 설정 추출
  const settings: VisitorSettings = useMemo(() => {
    if (!systemSettings) {
      return {
        reVisitAllowInterval: 6,
        maxVisitorsPerDay: 100,
        visitorDataRetentionDays: 1095,
        requireVisitorPhoto: false,
        requireVisitorContact: true,
        requireVisitPurpose: true,
      };
    }

    return {
      reVisitAllowInterval: systemSettings.reVisitAllowInterval,
      maxVisitorsPerDay: systemSettings.maxVisitorsPerDay,
      visitorDataRetentionDays: systemSettings.visitorDataRetentionDays,
      requireVisitorPhoto: systemSettings.requireVisitorPhoto,
      requireVisitorContact: systemSettings.requireVisitorContact,
      requireVisitPurpose: systemSettings.requireVisitPurpose,
    };
  }, [systemSettings]);

  const {
    formData,
    isSubmitting,
    isSubmitted,
    error,
    uploadedImageUrl,
    farm,
    farmLoading,
    farmError,
    handleSubmit,
    uploadImage,
    deleteImage,
  } = useVisitorForm(farmId, settings);

  // 뒤로가기 처리 함수 메모이제이션
  const handleSheetClose = useCallback(() => {
    setShowConfirmSheet(false);
  }, []);

  // 뒤로가기 처리 - useBlockNavigation 훅 사용
  const { isAttemptingNavigation, proceedNavigation, cancelNavigation } =
    useBlockNavigation(true, true, showConfirmSheet, handleSheetClose, "/");

  // confirm 다이얼로그 처리
  useEffect(() => {
    if (isAttemptingNavigation) {
      setShowConfirmSheet(true);
    }
  }, [isAttemptingNavigation]);

  // 에러 상태에 따른 토스트 처리
  useEffect(() => {
    if (error) {
      showError("방문자 등록 오류", error);
    }
  }, [error, showError]);

  // 농장 에러에 따른 토스트 처리
  useEffect(() => {
    if (farmError) {
      showError("농장 정보 조회 실패", farmError.message);
    }
  }, [farmError, showError]);

  // 설정 에러에 따른 토스트 처리
  useEffect(() => {
    if (settingsError) {
      showError("설정 로드 실패", settingsError.message);
    }
  }, [settingsError, showError]);

  // 폼 제출 핸들러 래핑
  const handleSubmitWrapped = async (data: VisitorFormData) => {
    try {
      showInfo("방문자 등록 중", "방문자 정보를 등록하는 중입니다...");
      const result = await handleSubmit(data);

      showSuccess(
        "방문자 등록 완료",
        result?.message || "방문자 정보를 등록하였습니다."
      );
      // 성공 시 토스트는 isSubmitted 상태 변경으로 처리
    } catch (error) {
      // 에러는 이미 error 상태로 처리됨
    }
  };

  // 이미지 업로드 핸들러 래핑 (토스트 처리 제거)
  const handleImageUploadWrapped = async (file: File) => {
    try {
      const result = await uploadImage(file);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // 이미지 삭제 핸들러 래핑 (토스트 처리 제거)
  const handleImageDeleteWrapped = async (fileName: string) => {
    try {
      await deleteImage();
    } catch (error) {
      throw error;
    }
  };

  if (farmLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto px-3 sm:px-4">
          {farm && <FarmInfoCard farm={farm} />}
          <FormSkeleton
            fields={8}
            className="bg-white shadow-lg rounded-2xl p-6"
          />
        </div>
      </div>
    );
  }

  if (!farm || farmError) {
    const isNotFoundError = !farm && !farmError;
    const errorMessage = farmError
      ? "농장 정보를 불러오는 중 오류가 발생했습니다."
      : "요청하신 농장이 존재하지 않거나 접근할 수 없습니다.";

    return (
      <AdminError
        title={
          isNotFoundError
            ? ERROR_CONFIGS.NOT_FOUND.title
            : ERROR_CONFIGS.LOADING.title
        }
        description={errorMessage}
        error={farmError || new Error(errorMessage)}
        isNotFound={isNotFoundError}
        retry={() => window.location.reload()}
      />
    );
  }

  if (isSubmitted) {
    return <SuccessCard onGoHome={() => router.push("/")} />;
  }

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="min-h-screen items-center justify-center bg-gradient-farm p-3">
        <FormHeader />
        <FarmInfoCard farm={farm} />
        <VisitorForm
          settings={settings}
          formData={formData}
          isSubmitting={isSubmitting}
          uploadedImageUrl={uploadedImageUrl}
          onSubmit={handleSubmitWrapped}
          onImageUpload={handleImageUploadWrapped}
          onImageDelete={handleImageDeleteWrapped}
          error={error}
        />
      </div>

      {/* 네비게이션 확인 시트 */}
      <ConfirmSheet
        open={showConfirmSheet}
        onOpenChange={setShowConfirmSheet}
        onConfirm={() => {
          proceedNavigation();
        }}
        onCancel={() => {
          setShowConfirmSheet(false);
          cancelNavigation();
        }}
        title={
          isSubmitted
            ? LABELS.SUCCESS_CARD_HEADER
            : LABELS.SUCCESS_CARD_CANCEL_WARNING
        }
        warningMessage={
          isSubmitted
            ? LABELS.SUCCESS_CARD_CANCEL_DESC_HOME
            : LABELS.SUCCESS_CARD_CANCEL_DESC
        }
        variant={isSubmitted ? "success" : "warning"}
      />
    </ErrorBoundary>
  );
}
