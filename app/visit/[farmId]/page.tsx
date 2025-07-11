/**
 * 방문자 등록 페이지
 *
 * QR 코드를 스캔한 방문자가 농장 방문 정보를 등록하는 페이지입니다.
 *
 * 주요 기능:
 * - 농장 정보 표시 (농장명, 관리자, 연락처)
 * - 축사출입금지 안내문구 표시
 * - 방문자 정보 입력 폼 (성명, 연락처, 주소, 차량번호, 방문목적, 소독여부, 비고)
 * - 카카오 주소 API 연동
 * - 개인정보 수집 동의
 * - 등록 완료 후 회사 홍보 페이지 연결
 *
 * @route /visit/[farmId]
 * @param farmId - 농장 고유 식별자 (UUID)
 */

"use client";

import { useParams } from "next/navigation";
import { FormSkeleton } from "@/components/common/skeletons";
import { FarmInfoCard } from "@/components/visitor/FarmInfoCard";
import { SuccessCard } from "@/components/visitor/SuccessCard";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { useVisitorSettings } from "@/hooks/useVisitorSettings";
import { useVisitorForm } from "@/hooks/useVisitorForm";
import { VisitorForm } from "@/components/visitor/VisitorForm";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { useEffect } from "react";
import { VisitorFormData } from "@/lib/utils/validation/visitor-validation";

/**
 * 방문자 등록 페이지 메인 컴포넌트
 *
 * QR 코드 스캔을 통해 접근하는 방문자 등록 폼을 제공합니다.
 * 농장 정보 표시, 방문자 정보 입력, 데이터 저장 기능을 포함합니다.
 */
export default function VisitPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const { showInfo, showWarning, showSuccess, showError } = useCommonToast();

  const {
    settings,
    isLoading: isSettingsLoading,
    error: settingsError,
  } = useVisitorSettings();

  const {
    formData,
    isSubmitting,
    isSubmitted,
    error,
    isLoading,
    uploadedImageUrl,
    farm,
    farmLoading,
    farmError,
    handleSubmit,
    uploadImage,
    deleteImage,
    isImageUploading,
  } = useVisitorForm(farmId, settings);

  // 에러 상태에 따른 토스트 처리
  useEffect(() => {
    if (error) {
      showError("방문자 등록 오류", error);
    }
  }, [error, showError]);

  // 농장 에러에 따른 토스트 처리
  useEffect(() => {
    if (farmError) {
      showError("농장 정보 조회 실패", farmError);
    }
  }, [farmError, showError]);

  // 설정 에러에 따른 토스트 처리
  useEffect(() => {
    if (settingsError) {
      showError("설정 로드 실패", settingsError);
    }
  }, [settingsError, showError]);

  // 폼 제출 핸들러 래핑
  const handleSubmitWrapped = async (data: VisitorFormData) => {
    try {
      showInfo("방문자 등록 중", "방문자 정보를 등록하는 중입니다...");
      await handleSubmit(data);
      // 성공 시 토스트는 isSubmitted 상태 변경으로 처리
    } catch (error) {
      // 에러는 이미 error 상태로 처리됨
    }
  };

  // 이미지 업로드 핸들러 래핑
  const handleImageUploadWrapped = async (file: File) => {
    try {
      showInfo("이미지 업로드 중", "프로필 이미지를 업로드하는 중입니다...");
      await uploadImage(file);
      showSuccess(
        "이미지 업로드 완료",
        "프로필 이미지가 성공적으로 업로드되었습니다."
      );
    } catch (error) {
      showError("이미지 업로드 실패", "프로필 이미지 업로드에 실패했습니다.");
      throw error;
    }
  };

  // 이미지 삭제 핸들러 래핑
  const handleImageDeleteWrapped = async (fileName: string) => {
    try {
      showInfo("이미지 삭제 중", "프로필 이미지를 삭제하는 중입니다...");
      await deleteImage(fileName);
      showSuccess(
        "이미지 삭제 완료",
        "프로필 이미지가 성공적으로 삭제되었습니다."
      );
    } catch (error) {
      showError("이미지 삭제 실패", "프로필 이미지 삭제에 실패했습니다.");
      throw error;
    }
  };

  /**
   * 창 닫기 함수 (수동 방식)
   *
   * 브라우저 호환성 문제로 인해 자동 닫기 대신 수동 닫기 방식을 사용합니다.
   * 다양한 브라우저 환경에 대응하여 적절한 닫기 방법을 시도합니다.
   */
  const handleClose = () => {
    try {
      if (window.opener) {
        window.close();
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      showWarning(
        "브라우저 호환성 문제",
        "브라우저의 뒤로가기 버튼을 사용하거나 직접 창을 닫아주세요."
      );
    }
  };

  if (farmLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto px-3 sm:px-4">
          <FormSkeleton
            fields={8}
            className="bg-white shadow-lg rounded-2xl p-6"
          />
        </div>
      </div>
    );
  }

  if (!farm || farmError) {
    throw new Error(
      farmError
        ? "농장 정보를 불러오는 중 오류가 발생했습니다."
        : "요청하신 농장이 존재하지 않거나 접근할 수 없습니다."
    );
  }

  if (isSubmitted) {
    return <SuccessCard onClose={handleClose} />;
  }

  return (
    <ErrorBoundary
      title="방문자 등록 페이지 오류"
      description="방문자 등록 중 문제가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
    >
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto px-3 sm:px-4">
          <FarmInfoCard farm={farm} />
          <VisitorForm
            settings={settings}
            formData={formData}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            uploadedImageUrl={uploadedImageUrl}
            onSubmit={handleSubmitWrapped}
            onImageUpload={handleImageUploadWrapped}
            onImageDelete={handleImageDeleteWrapped}
            isImageUploading={isImageUploading}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
