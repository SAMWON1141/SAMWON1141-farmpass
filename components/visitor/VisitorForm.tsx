"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { VisitorSettings } from "@/lib/types/visitor";
import type { VisitorFormData } from "@/lib/utils/validation/visitor-validation";
import { createVisitorFormSchema } from "@/lib/utils/validation/visitor-validation";

// 레이아웃 컴포넌트
import { FormCard } from "./form-layout/FormCard";
import { FormFooter } from "./form-layout/FormFooter";

// 섹션 컴포넌트
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { VisitInfoSection } from "./form-sections/VisitInfoSection";
import { ConsentSection } from "./form-sections/ConsentSection";
import { ImageSection } from "./form-sections/ImageSection";

export const VisitorForm = ({
  settings,
  formData,
  isSubmitting,
  uploadedImageUrl,
  error,
  onSubmit,
  onImageUpload,
  onImageDelete,
}: {
  settings: VisitorSettings;
  formData: VisitorFormData;
  isSubmitting: boolean;
  uploadedImageUrl: string | null;
  error?: string | null;
  onSubmit: (data: VisitorFormData) => Promise<void>;
  onImageUpload: (
    file: File
  ) => Promise<{ publicUrl: string; fileName: string } | void>;
  onImageDelete: (fileName: string) => Promise<void>;
}) => {
  // 동적 스키마 생성
  const visitorSchema = createVisitorFormSchema(settings, uploadedImageUrl);

  // React Hook Form 설정
  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues: formData,
  });

  // formData가 바뀔 때마다 input 값 동기화
  useEffect(() => {
    form.reset(formData);
  }, [formData]);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    await onImageUpload(file);
  };

  // 폼 제출 핸들러 래핑
  const handleFormSubmit = async (data: VisitorFormData) => {
    // 이미지 필수 검증
    if (
      settings.requireVisitorPhoto &&
      !uploadedImageUrl &&
      !formData.profile_photo_url
    ) {
      form.setError("root", { message: "방문자 사진을 등록해주세요" });
      return;
    }

    await onSubmit(data);
  };

  return (
    <FormCard>
      <CardContent className="p-3 sm:p-6 w-full">
        {/* 이미지 섹션 */}
        <ImageSection
          settings={settings}
          formData={formData}
          uploadedImageUrl={uploadedImageUrl}
          onImageUpload={handleImageUpload}
          onImageDelete={onImageDelete}
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-3 sm:space-y-6"
          >
            {/* 개인정보 섹션 */}
            <PersonalInfoSection
              form={form}
              settings={settings}
              formData={formData}
            />

            {/* 방문정보 섹션 */}
            <VisitInfoSection form={form} settings={settings} />

            {/* 동의 섹션 */}
            <ConsentSection form={form} />

            {/* 폼 푸터 */}
            <FormFooter
              isSubmitting={isSubmitting}
              error={error}
              formErrors={form.formState.errors}
              onSubmit={handleFormSubmit}
            />
          </form>
        </Form>
      </CardContent>
    </FormCard>
  );
};
