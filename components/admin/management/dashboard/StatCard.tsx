import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: number; // 증감률 (양수: 증가, 음수: 감소)
  variant?: "default" | "success" | "warning" | "info";
  icon?: LucideIcon;
}

const variantStyles = {
  default: "from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900",
  success:
    "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
  warning:
    "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
  info: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
};

const valueColors = {
  default: "text-slate-900 dark:text-slate-100",
  success: "text-emerald-700 dark:text-emerald-300",
  warning: "text-amber-700 dark:text-amber-300",
  info: "text-blue-700 dark:text-blue-300",
};

export function StatCard({
  title,
  value,
  description,
  trend,
  variant = "default",
  icon: Icon,
}: StatCardProps) {
  const DefaultIcon = Icon || Sparkles;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* 배경 그라데이션 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          variantStyles[variant]
        )}
      />

      {/* 메인 컨텐츠 */}
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between">
          {/* 왼쪽: 아이콘 */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
                variant === "default" &&
                  "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700",
                variant === "success" &&
                  "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/30",
                variant === "warning" &&
                  "bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/30",
                variant === "info" &&
                  "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30"
              )}
            >
              <DefaultIcon
                className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  variant === "default" && "text-slate-600 dark:text-slate-400",
                  variant === "success" &&
                    "text-emerald-600 dark:text-emerald-400",
                  variant === "warning" && "text-amber-600 dark:text-amber-400",
                  variant === "info" && "text-blue-600 dark:text-blue-400"
                )}
              />
            </div>
          </div>

          {/* 오른쪽: 트렌드 표시 */}
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium">
              {trend > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              ) : trend < 0 ? (
                <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
              ) : null}
              <span
                className={cn(
                  trend > 0 && "text-emerald-600 dark:text-emerald-400",
                  trend < 0 && "text-red-600 dark:text-red-400",
                  trend === 0 && "text-slate-500 dark:text-slate-400"
                )}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>

        {/* 통계 값 */}
        <div className="mt-4">
          <div
            className={cn(
              "text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300",
              valueColors[variant]
            )}
          >
            {value}
          </div>
        </div>

        {/* 제목과 설명 */}
        <div className="mt-2">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* 하단 장식선 */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300",
            variant === "default" &&
              "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600",
            variant === "success" &&
              "from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-600",
            variant === "warning" &&
              "from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-600",
            variant === "info" &&
              "from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600"
          )}
        />
      </CardContent>
    </Card>
  );
}
