"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, Mail, Shield, Info } from "lucide-react";
import {
  useUserConsentsQuery,
  useUpdateUserConsentsMutation,
} from "@/lib/hooks/query/use-user-consents-query";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { PAGE_HEADER, LABELS } from "@/lib/constants/account";
import { TERM_CONFIGS } from "@/lib/constants/terms";

interface PrivacySectionProps {
  userId: string | undefined;
}

export function PrivacySection({ userId }: PrivacySectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useCommonToast();

  // 사용자 동의 정보 조회
  const { data: consentData, refetch } = useUserConsentsQuery();
  const updateConsentsMutation = useUpdateUserConsentsMutation();

  // 동의 정보 배열 추출 및 정렬 (TERM_CONFIGS order 기준)
  const consents = useMemo(() => {
    const consentArray = consentData?.userConsents || [];

    // TERM_CONFIGS의 order 기준으로 정렬
    return consentArray.sort((a, b) => {
      const configA = TERM_CONFIGS.find(
        (config: any) => config.type === a.type
      );
      const configB = TERM_CONFIGS.find(
        (config: any) => config.type === b.type
      );

      const orderA = configA?.order ?? 999;
      const orderB = configB?.order ?? 999;

      return orderA - orderB;
    });
  }, [consentData?.userConsents]);

  // 마케팅 동의 상태 확인
  const marketingConsent = consents?.find(
    (consent) => consent.type === "marketing"
  );
  const hasMarketingConsent = !!marketingConsent;

  // 마케팅 동의 변경 처리
  const handleMarketingConsentChange = async (agreed: boolean) => {
    setIsLoading(true);
    try {
      await updateConsentsMutation.mutateAsync({
        privacyConsent: true, // 필수 동의는 유지
        termsConsent: true, // 필수 동의는 유지
        ageConsent: true, // 필수 동의는 유지
        marketingConsent: agreed, // 마케팅 동의만 변경
      });

      await refetch(); // 동의 정보 새로고침

      showSuccess(
        "설정 변경 완료",
        agreed
          ? "마케팅 정보 수신에 동의하셨습니다."
          : "마케팅 정보 수신을 거부하셨습니다."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "설정 변경에 실패했습니다.";
      showError("설정 변경 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 마케팅 정보 수신 동의 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {PAGE_HEADER.PRIVACY_MARKETING_TITLE}
          </CardTitle>
          <CardDescription>
            {PAGE_HEADER.PRIVACY_MARKETING_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm sm:text-base font-medium">
                {LABELS.MARKETING_CONSENT}
              </p>
            </div>
            <Switch
              id="marketing-consent"
              checked={hasMarketingConsent}
              onCheckedChange={handleMarketingConsentChange}
              disabled={isLoading}
              className="ml-auto"
              aria-label="마케팅 정보 수신 동의"
            />
          </div>
        </CardContent>
      </Card>

      {/* 개인정보 처리 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-700 dark:text-green-400" />
            {PAGE_HEADER.PRIVACY_STATUS_TITLE}
          </CardTitle>

          <CardDescription>
            {PAGE_HEADER.PRIVACY_STATUS_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {consents && consents.length > 0 ? (
            <div className="space-y-3">
              {consents.map((consent, index: number) => (
                <div
                  key={`${consent.type}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        {consent.title || consent.type}
                      </span>
                      {consent.type === "marketing" && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {LABELS.CONSENT_OPTIONAL}
                        </span>
                      )}
                      {(consent.type === "privacy_consent" ||
                        consent.type === "terms" ||
                        consent.type === "age_consent") && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {LABELS.CONSENT_REQUIRED}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {LABELS.CONSENT_DATE(consent.agreed_at || undefined)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      {LABELS.CONSENT_AGREED}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{LABELS.NO_CONSENT_RECORDS}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
