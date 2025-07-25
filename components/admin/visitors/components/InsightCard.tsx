import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, Clock, BarChart3, LucideIcon } from "lucide-react";
import {
  calculateDailyAverage,
  calculateActivityIndex,
} from "@/lib/utils/data/common-stats";
import { LABELS } from "@/lib/constants/visitor";

interface InsightCardProps {
  totalVisitors: number;
  todayVisitors: number;
  totalFarms?: number;
  showFarmCount?: boolean;
}

interface InsightItem {
  icon: LucideIcon;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

export function InsightCard({
  totalVisitors,
  todayVisitors,
  totalFarms,
  showFarmCount = false,
}: InsightCardProps) {
  // insights 배열을 useMemo로 메모이제이션하여 무한 렌더링 방지
  const insights = useMemo((): InsightItem[] => {
    const dailyAverage = calculateDailyAverage(totalVisitors);
    const activityIndex = calculateActivityIndex(todayVisitors, totalVisitors);

    const baseInsights: InsightItem[] = [
      {
        icon: Target,
        label: LABELS.INSIGHT_CARD_DAILY_AVERAGE,
        value:
          totalVisitors === 0
            ? LABELS.INSIGHT_CARD_UNIT_PERSON.replace("{value}", "0")
            : LABELS.INSIGHT_CARD_UNIT_PERSON.replace(
                "{value}",
                dailyAverage.toString()
              ),
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
      },
      {
        icon: Zap,
        label: LABELS.INSIGHT_CARD_ACTIVITY_INDEX,
        value:
          totalVisitors === 0
            ? LABELS.INSIGHT_CARD_UNIT_PERCENT.replace("{value}", "0")
            : LABELS.INSIGHT_CARD_UNIT_PERCENT.replace(
                "{value}",
                activityIndex.toString()
              ),
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600",
      },
    ];

    if (showFarmCount && totalFarms !== undefined && totalFarms > 0) {
      const avgPerFarm = Math.round(totalVisitors / totalFarms);
      baseInsights.push({
        icon: Clock,
        label: LABELS.INSIGHT_CARD_AVG_PER_FARM,
        value: LABELS.INSIGHT_CARD_UNIT_PERSON.replace(
          "{value}",
          avgPerFarm.toString()
        ),
        bgColor: "bg-purple-100",
        textColor: "text-purple-600",
      });
    }

    return baseInsights;
  }, [totalVisitors, todayVisitors, totalFarms, showFarmCount]);

  return (
    <Card className="relative overflow-hidden border border-amber-200 bg-amber-50 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group hidden md:block md:col-span-full">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />

      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-amber-800">
              {LABELS.INSIGHT_CARD_TITLE}
            </h3>
            <p className="text-[10px] sm:text-xs text-amber-600">
              {LABELS.INSIGHT_CARD_SUBTITLE}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {insights.map((insight: InsightItem) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.label}
                className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg ${insight.bgColor} group-hover:shadow-sm transition-all duration-200`}
              >
                <Icon
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${insight.textColor}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[10px] sm:text-xs font-medium ${insight.textColor} truncate`}
                  >
                    {insight.label}
                  </p>
                  <p className="text-[9px] sm:text-xs text-amber-600 font-semibold">
                    {insight.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 opacity-60" />
    </Card>
  );
}
