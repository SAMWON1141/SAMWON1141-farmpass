import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type {
  UseFormReturn,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { LABELS } from "@/lib/constants/visitor";
import { Button } from "@/components/ui/button";
import { ExternalLink, UserCheck } from "lucide-react";
import { TermsSheet } from "@/components/auth/TermsSheet";

interface ConsentFieldProps<T extends FieldValues = any> {
  form: UseFormReturn<T>;
  className?: string;
}

export const ConsentField = <T extends FieldValues = any>({
  form,
  className = "",
}: ConsentFieldProps<T>) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <FormField
        control={form.control}
        name={"consent_given" as Path<T>}
        render={({ field }) => (
          <FormItem className={`space-y-2 md:col-span-2 ${className}`}>
            <FormControl>
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Checkbox
                  id="visitor-consent_given"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    // 비동기적으로 상태 업데이트
                    setTimeout(() => {
                      field.onChange(checked);
                    }, 0);
                  }}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <div className="flex items-center justify-between flex-1">
                  <Label
                    htmlFor="visitor-consent_given"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="font-medium">{LABELS.CONSENT}</span>
                    <span className="text-red-500 ml-1">
                      {LABELS.REQUIRED_MARK}
                    </span>
                    <br />
                  </Label>
                  <Button
                    type="button" // 🔥 명시적으로 type="button" 추가
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50 h-auto"
                    onClick={(e) => {
                      e.preventDefault(); // 🔥 기본 동작 방지
                      e.stopPropagation(); // 🔥 이벤트 전파 중단
                      setModalOpen(true);
                    }}
                    aria-label="개인정보 수집 및 이용 동의서 상세보기"
                  >
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 개인정보 수집 및 이용 동의서 모달 */}
      <TermsSheet
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        termType="privacy_consent"
        onConsent={() => {
          // 체크박스 체크 처리 - 비동기적으로 처리하여 폼 제출 방지
          setTimeout(() => {
            form.setValue(
              "consent_given" as Path<T>,
              true as PathValue<T, Path<T>>,
              { shouldValidate: false, shouldTouch: false, shouldDirty: false } // 🔥 폼 상태 변화 최소화
            );
          }, 0);
          setModalOpen(false);
        }}
      />
    </>
  );
};
