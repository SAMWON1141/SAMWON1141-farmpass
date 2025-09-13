"use client";

import { useLogo } from "@/hooks/ui/use-logo";
import { useSystemSettingsQuery } from "@/lib/hooks/query/use-system-settings-query";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { SystemSettings } from "@/lib/types/settings";

interface LogoProps {
  className?: string;
  iconClassName?: string;

  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  settings?: SystemSettings | null; // 중복 query 방지용
}

const sizeMap = {
  sm: {
    container: "h-8 w-8",
    icon: "h-5 w-5",
    sizes: "32px", // 8 * 4 = 32px
  },
  md: {
    container: "h-10 w-10",
    icon: "h-6 w-6",
    sizes: "40px", // 10 * 4 = 40px
  },
  lg: {
    container: "h-14 w-28",
    icon: "h-8 w-8",
    sizes: "112px", // 28 * 4 = 112px (가로 기준)
  },
  xl: {
    container: "h-16 w-40",
    icon: "h-10 w-10",
    sizes: "160px", // 40 * 4 = 160px (가로 기준)
  },
  xxl: {
    container: "h-24 w-40",
    icon: "h-16 w-16",
    sizes: "160px", // 40 * 4 = 160px (가로 기준)
  },
};

/**
 * 시스템 로고 표시 컴포넌트
 * 업로드된 로고가 있으면 이미지를, 없으면 기본 로고를 표시
 */
export function Logo({
  className,
  iconClassName,
  size = "md",
  settings, // 중복 query 방지용
}: LogoProps) {
  // settings가 전달되지 않은 경우에만 쿼리 실행
  const { data: systemSettings, isLoading } = useSystemSettingsQuery({
    enabled: !settings, // settings가 없을 때만 쿼리 실행
  });

  // 전달받은 settings가 있으면 우선 사용, 없으면 쿼리 결과 사용
  const currentSettings = settings || systemSettings;

  const { logoUrl, siteName } = useLogo(currentSettings);
  const sizeConfig = sizeMap[size];

  // 로딩 중일 때는 기본 로고 표시
  if (isLoading && !settings) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-muted animate-pulse",
            sizeConfig.container,
            iconClassName
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg",
          sizeConfig.container,
          iconClassName
        )}
      >
        {logoUrl.includes(".svg") ? (
          <img
            src={logoUrl}
            alt={siteName}
            className="h-full w-full object-contain"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <Image
            src={logoUrl}
            alt={siteName}
            fill
            priority
            className="object-contain"
            sizes={sizeConfig.sizes}
          />
        )}
      </div>
    </div>
  );
}
