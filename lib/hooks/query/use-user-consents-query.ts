"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils/data/api-client";
import { userConsentsKeys } from "@/lib/hooks/query/query-keys";
import type { UserConsent } from "@/lib/types/common";

/**
 * 사용자 동의 상태 확인 API 응답 타입
 */
interface UserConsentsCheckResponse {
  success: boolean;
  hasAllRequiredConsents: boolean;
  missingConsents: Array<{
    type: string;
    title: string;
    version: string;
    termId: string;
  }>;
  userConsents: Array<{
    type: string;
    title: string;
    version: string;
    agreed_at: string | null;
  }>;
}

/**
 * 사용자 동의 상태 확인 훅
 */
export function useUserConsentsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: userConsentsKeys.check(),
    queryFn: async (): Promise<UserConsentsCheckResponse> => {
      const response = await apiClient("/api/user-consents/check", {
        method: "GET",
        context: "사용자 동의 상태 확인",
      });

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5분
    enabled,
  });
}

/**
 * 사용자 동의 업데이트 뮤테이션 훅
 */
export function useUpdateUserConsentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      privacyConsent: boolean;
      termsConsent: boolean;
      ageConsent: boolean;
      marketingConsent?: boolean;
    }): Promise<{ consents: UserConsent[]; message: string }> => {
      const response = await apiClient("/api/user-consents/update", {
        method: "POST",
        body: JSON.stringify(data),
        context: "사용자 동의 업데이트",
      });

      return { consents: response.consents, message: response.message };
    },
    onSuccess: () => {
      queryClient.setQueryData(userConsentsKeys.check(), (prev: any) => ({
        ...(prev ?? {}),
        success: true,
        hasAllRequiredConsents: true,
        missingConsents: [],
        userConsents: prev?.userConsents ?? [],
      }));

      queryClient.invalidateQueries({
        queryKey: userConsentsKeys.check(),
        refetchType: "active",
      });
    },
  });
}
