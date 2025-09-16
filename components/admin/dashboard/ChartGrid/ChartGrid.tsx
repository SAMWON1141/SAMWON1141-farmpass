import { ChartCard } from "@/components/admin/management/dashboard/ChartCard";
import dynamic from "next/dynamic";
import { TrendingUp, Target, Clock, MapPin, Calendar } from "lucide-react";
import { LABELS } from "@/lib/constants/dashboard";
import type {
  ChartDataPoint,
  DistributionData,
} from "@/lib/utils/data/common-stats";

// 차트 컴포넌트들을 동적 import로 최적화
const VisitorTrendChart = dynamic(
  () =>
    import("@/components/charts/visitor-trend-chart").then((mod) => ({
      default: mod.VisitorTrendChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded" />,
  }
);

const VisitorPurposeChart = dynamic(
  () =>
    import("@/components/charts/visitor-purpose-chart").then((mod) => ({
      default: mod.VisitorPurposeChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded" />,
  }
);

const VisitorTimeChart = dynamic(
  () =>
    import("@/components/charts/visitor-time-chart").then((mod) => ({
      default: mod.VisitorTimeChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded" />,
  }
);

const VisitorRegionChart = dynamic(
  () =>
    import("@/components/charts/visitor-region-chart").then((mod) => ({
      default: mod.VisitorRegionChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded" />,
  }
);

const WeekdayVisitorChart = dynamic(
  () =>
    import("@/components/charts/weekday-visitor-chart").then((mod) => ({
      default: mod.WeekdayVisitorChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded" />,
  }
);

interface ChartGridProps {
  visitorTrend: any[]; // 이건 기존 형식 유지 (useFarmVisitors에서 제공)
  purposeStats: DistributionData[]; // 통합 타입
  timeStats: ChartDataPoint[]; // 통합 타입
  regionStats: DistributionData[]; // 통합 타입
  weekdayStats: ChartDataPoint[]; // 통합 타입
}

export function ChartGrid({
  visitorTrend,
  purposeStats,
  timeStats,
  regionStats,
  weekdayStats,
}: ChartGridProps) {
  // 통합 데이터를 기존 차트 형식으로 변환
  const adaptedPurposeStats =
    (purposeStats || []).map((stat) => ({
      purpose: stat.category,
      count: stat.count,
      percentage: stat.percentage,
    })) || [];

  const adaptedTimeStats =
    (timeStats || []).map((stat) => ({
      hour: stat.label,
      count: stat.value,
    })) || [];

  const adaptedRegionStats =
    (regionStats || []).map((stat) => ({
      region: stat.category,
      count: stat.count,
    })) || [];

  const adaptedWeekdayStats =
    (weekdayStats || []).map((stat) => ({
      day: stat.label,
      count: stat.value,
      average: stat.value, // 평균값은 동일하게 설정
    })) || [];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 주요 차트들 - 2열 레이아웃, 데스크톱에서 더 큰 크기 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <ChartCard
          title={LABELS.VISITOR_TREND_TITLE}
          description={LABELS.VISITOR_TREND_DESCRIPTION}
          icon={TrendingUp}
          variant="info"
          className="min-h-[400px] flex flex-col"
        >
          <VisitorTrendChart data={visitorTrend} />
        </ChartCard>

        <ChartCard
          title={LABELS.VISITOR_PURPOSE_TITLE}
          description={LABELS.VISITOR_PURPOSE_DESCRIPTION}
          icon={Target}
          variant="success"
          className="min-h-[400px] flex flex-col"
        >
          <VisitorPurposeChart data={adaptedPurposeStats} />
        </ChartCard>
      </div>

      {/* 하위 차트들 - 태블릿부터 1열, 대형 데스크톱에서만 3열 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <ChartCard
          title={LABELS.VISITOR_TIME_TITLE}
          description={LABELS.VISITOR_TIME_DESCRIPTION}
          icon={Clock}
          variant="warning"
          className="min-h-[400px] flex flex-col"
        >
          <VisitorTimeChart data={adaptedTimeStats} />
        </ChartCard>

        <ChartCard
          title={LABELS.VISITOR_REGION_TITLE}
          description={LABELS.VISITOR_REGION_DESCRIPTION}
          icon={MapPin}
          variant="info"
          className="min-h-[400px] flex flex-col"
        >
          <VisitorRegionChart data={adaptedRegionStats} />
        </ChartCard>

        <ChartCard
          title={LABELS.WEEKDAY_VISITOR_TITLE}
          description={LABELS.WEEKDAY_VISITOR_DESCRIPTION}
          icon={Calendar}
          variant="warning"
          className="min-h-[400px] flex flex-col"
        >
          <WeekdayVisitorChart data={adaptedWeekdayStats} />
        </ChartCard>
      </div>
    </div>
  );
}
