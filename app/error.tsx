"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { GLOBAL_ERROR_LABELS } from "@/lib/constants/error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    devLog.error("Global error occurred:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full mx-auto">
        {/* 에러 아이콘과 500 숫자 조합 */}
        <div className="relative mb-12">
          <div className="text-[clamp(6rem,20vw,12rem)] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-orange-300 leading-none select-none">
            {GLOBAL_ERROR_LABELS.ERROR_CODE}
          </div>
          <div className="absolute inset-0 text-[clamp(6rem,20vw,12rem)] font-black text-red-100 leading-none -z-10 blur-sm">
            {GLOBAL_ERROR_LABELS.ERROR_CODE}
          </div>
          {/* 번개 아이콘 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>
        </div>

        {/* 메인 메시지 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 tracking-tight">
          {GLOBAL_ERROR_LABELS.PAGE_TITLE}
        </h1>

        {/* 설명 */}
        <p className="text-base sm:text-lg text-slate-500 mb-10 leading-relaxed">
          {GLOBAL_ERROR_LABELS.DESCRIPTION.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              {index <
                GLOBAL_ERROR_LABELS.DESCRIPTION.split("\n").length - 1 && (
                <br />
              )}
            </span>
          ))}
        </p>

        {/* 세련된 액션 버튼 */}
        <Button
          size="lg"
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
          onClick={reset}
        >
          <RefreshCw className="w-6 h-6 mr-3" />
          {GLOBAL_ERROR_LABELS.BUTTONS.RETRY}
        </Button>

        {/* 로딩 애니메이션(404와 동일하게) */}
        <div className="mt-16 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse delay-150"></div>
        </div>

        {/* 개발 모드에서만 에러 상세 정보 */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-16 text-left bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
            <summary className="cursor-pointer text-lg font-medium text-slate-700 mb-3 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              {GLOBAL_ERROR_LABELS.DEVELOPER_INFO.TITLE}
            </summary>
            <div className="text-base text-red-600 font-mono break-all bg-white p-3 rounded-lg border">
              <p className="mb-2">
                <strong className="text-slate-700">
                  {GLOBAL_ERROR_LABELS.DEVELOPER_INFO.ERROR_LABEL}
                </strong>{" "}
                {error.message}
              </p>
              {error.digest && (
                <p>
                  <strong className="text-slate-700">
                    {GLOBAL_ERROR_LABELS.DEVELOPER_INFO.DIGEST_LABEL}
                  </strong>{" "}
                  {error.digest}
                </p>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
