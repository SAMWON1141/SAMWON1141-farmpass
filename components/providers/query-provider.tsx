"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// QueryClient 설정
function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 15분 캐싱 (staleTime) - 중복 호출 방지
        staleTime: 15 * 60 * 1000,
        // 30분 후 가비지 컬렉션
        gcTime: 30 * 60 * 1000,
        // 네트워크 에러 시 3번 재시도
        retry: (failureCount, error) => {
          // 인증 에러는 재시도 안함
          if (
            error?.message?.includes("Unauthorized") ||
            error?.message?.includes("Admin access required") ||
            error?.message?.includes("Failed to verify admin status") ||
            (error as any)?.status === 401 ||
            (error as any)?.status === 403 ||
            (error as any)?.status === 500
          ) {
            return false;
          }
          return failureCount < 3;
        },
        // 기본적으로는 수동 새로고침 (성능 최적화)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        // Mutation 에러 시 1번 재시도
        retry: 1,
      },
    },
  });

  // v5 권장: 글로벌 에러 처리 (이벤트 기반)
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated") {
      const query = event.query;
      const error = query.state.error;

      if (error) {
        // 글로벌 에러 처리 로직
        console.warn("React Query Error:", {
          queryKey: query.queryKey,
          error: error.message,
        });
      }
    }
  });

  return queryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
