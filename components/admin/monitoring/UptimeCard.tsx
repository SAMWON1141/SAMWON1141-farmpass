import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Hash, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LABELS, PAGE_HEADER } from "@/lib/constants/monitoring";
import type { UptimeData } from "@/lib/types/monitoring";
import { LottieLoading } from "@/components/ui/lottie-loading";

interface UptimeCardProps extends UptimeData {}

export function UptimeCard({
  monitors,
  success,
  error,
  message,
  details,
}: UptimeCardProps) {
  // UptimeRobot 설정이 없거나 에러가 있는 경우
  if (!success && error) {
    let errorMessage = message || LABELS.UPTIME_DATA_ERROR;

    // 구체적인 에러 메시지 제공
    switch (error) {
      case "UPTIMEROBOT_API_KEY_NOT_CONFIGURED":
        errorMessage = LABELS.UPTIME_API_KEY_NOT_CONFIGURED;
        break;
      case "UPTIMEROBOT_API_ERROR":
        errorMessage = LABELS.UPTIME_API_ERROR;
        break;
    }

    return (
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            {PAGE_HEADER.UPTIME}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24">
            <LottieLoading
              animationPath="/lottie/no_connection.json"
              size="md"
              showText={false}
              fullScreen={false}
            />
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
              {details && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {LABELS.DETAILED_ERROR} {details}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 데이터 유효성 검사
  if (!monitors || monitors.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            {PAGE_HEADER.UPTIME}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {LABELS.NO_UPTIME_DATA}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 체크 간격을 사람이 읽기 쉬운 형태로 변환
  const formatInterval = (seconds: number) => {
    // 안전한 숫자 변환
    const safeSeconds = typeof seconds === "number" ? seconds : 0;

    if (safeSeconds < 60) return `${safeSeconds}${LABELS.SECONDS}`;
    if (safeSeconds < 3600)
      return `${Math.round(safeSeconds / 60)}${LABELS.MINUTES}`;
    if (safeSeconds < 86400)
      return `${Math.round(safeSeconds / 3600)}${LABELS.HOURS}`;
    return `${Math.round(safeSeconds / 86400)}${LABELS.DAYS}`;
  };

  // 생성 시간을 사람이 읽기 쉬운 형태로 변환
  const formatCreateTime = (timestamp: number) => {
    if (!timestamp) return LABELS.UNKNOWN_TIME;

    const date = new Date(timestamp * 1000); // Unix timestamp를 밀리초로 변환
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return LABELS.TODAY;
    if (diffInDays === 1) return LABELS.YESTERDAY;
    if (diffInDays < 7)
      return LABELS.DAYS_AGO.replace("{days}", diffInDays.toString());
    if (diffInDays < 30)
      return LABELS.WEEKS_AGO.replace(
        "{weeks}",
        Math.floor(diffInDays / 7).toString()
      );
    return LABELS.MONTHS_AGO.replace(
      "{months}",
      Math.floor(diffInDays / 30).toString()
    );
  };

  // 가동률 우선순위: custom_uptime_ratio > all_time_uptime_ratio
  const getUptimeRatio = (monitor: any) => {
    // custom_uptime_ratio가 있으면 사용
    if (
      monitor.custom_uptime_ratio !== undefined &&
      monitor.custom_uptime_ratio !== null
    ) {
      return Number(monitor.custom_uptime_ratio);
    }
    // all_time_uptime_ratio 사용
    if (
      monitor.all_time_uptime_ratio !== undefined &&
      monitor.all_time_uptime_ratio !== null
    ) {
      return Number(monitor.all_time_uptime_ratio);
    }
    // 기본값
    return 0;
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          {PAGE_HEADER.UPTIME}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(monitors || []).map((monitor) => {
            const uptimeRatio = getUptimeRatio(monitor);
            const isHealthy = monitor.status === 2;

            // 안전한 숫자 변환
            const safeUptimeRatio =
              typeof uptimeRatio === "number" ? uptimeRatio : 0;

            return (
              <div
                key={monitor.friendly_name}
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 rounded-lg bg-muted/50 p-3 sm:p-4 min-w-0"
              >
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="stroke-muted-foreground/20"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${safeUptimeRatio}, 100`}
                      className={
                        isHealthy ? "stroke-green-500" : "stroke-red-500"
                      }
                    />
                    <text
                      x="18"
                      y="20.35"
                      className="fill-current text-[0.5em] font-medium"
                      textAnchor="middle"
                    >
                      {safeUptimeRatio.toFixed(1)}%
                    </text>
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 w-full">
                  <div className="font-medium break-words w-full text-base sm:text-lg">
                    {monitor.friendly_name}
                  </div>
                  <Badge
                    variant={isHealthy ? "default" : "destructive"}
                    className="shrink-0 mt-1 sm:mt-0"
                  >
                    {isHealthy ? LABELS.NORMAL : LABELS.ISSUE_DETECTED}
                  </Badge>
                </div>
                <div className="space-y-1 mt-2 w-full">
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {LABELS.UPTIME_RATIO.replace(
                      "{ratio}",
                      safeUptimeRatio.toFixed(1)
                    )}
                    {monitor.custom_uptime_ratio !== undefined &&
                      monitor.custom_uptime_ratio !== null && (
                        <span className="text-xs text-muted-foreground/70 ml-1">
                          {LABELS.UPTIME_30_DAYS}
                        </span>
                      )}
                  </p>
                  {/* 추가 정보 */}
                  {monitor.id && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <Hash className="h-3 w-3" />
                      <span>
                        {LABELS.MONITOR_ID.replace(
                          "{id}",
                          monitor.id.toString()
                        )}
                      </span>
                    </div>
                  )}
                  {monitor.interval && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <Activity className="h-3 w-3" />
                      <span>
                        {LABELS.CHECK_INTERVAL.replace(
                          "{interval}",
                          formatInterval(monitor.interval)
                        )}
                      </span>
                    </div>
                  )}
                  {monitor.create_datetime && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {LABELS.CREATED.replace(
                          "{time}",
                          formatCreateTime(monitor.create_datetime)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
