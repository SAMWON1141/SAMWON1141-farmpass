import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LABELS } from "@/lib/constants/management";

interface CommonResultsSummaryProps {
  /** 총 아이템 수 */
  totalItems: number;
  /** 현재 표시 중인 아이템 수 */
  displayedItems?: number;
  /** 요약 텍스트 (예: "총 사용자", "총 로그", "총 농장") */
  summaryText: string;
  /** 추가 정보 (선택사항) */
  additionalInfo?: ReactNode;
  /** 카드 스타일 클래스 (선택사항) */
  className?: string;
  /** 배경색 (선택사항) */
  variant?: "default" | "primary" | "secondary";
}

export function CommonResultsSummary({
  totalItems,
  displayedItems,
  summaryText,
  additionalInfo,
  className,
  variant = "default",
}: CommonResultsSummaryProps) {
  const variantStyles = {
    default: "bg-card border",
    primary: "bg-primary/15 border-primary/30",
    secondary: "bg-secondary/15 border-secondary/30",
  };

  const dotColors = {
    default: "bg-primary",
    primary: "bg-primary",
    secondary: "bg-secondary",
  };

  return (
    <div className={cn("rounded-lg p-3", variantStyles[variant], className)}>
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", dotColors[variant])} />
          <span className="font-medium text-sm sm:text-base text-foreground">
            {summaryText.replace("{count}", totalItems.toString())}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && displayedItems !== undefined && (
            <div className="text-sm text-muted-foreground">
              {LABELS.DISPLAYED_ITEMS_COUNT.replace(
                "{count}",
                displayedItems.toString()
              )}
            </div>
          )}
          {additionalInfo && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              {additionalInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
