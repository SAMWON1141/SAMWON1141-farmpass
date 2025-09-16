import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, HardDrive, Cpu, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABELS, PAGE_HEADER } from "@/lib/constants/monitoring";
import type { SystemStatusData } from "@/lib/types/monitoring";

interface SystemStatusCardProps {
  data: SystemStatusData;
}

export function SystemStatusCard({ data }: SystemStatusCardProps) {
  // 데이터 유효성 검사
  if (!data) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {PAGE_HEADER.SYSTEM_STATUS}
          </CardTitle>
          <CardDescription>{LABELS.LOADING_SYSTEM_STATUS}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {LABELS.SYSTEM_STATUS_LOADING}
          </div>
        </CardContent>
      </Card>
    );
  }

  const health = data;

  // CPU와 메모리 상태 데이터 유효성 검사
  const cpuStatus = health.system?.cpu?.status ?? "unknown";
  const cpuTotal = health.system?.cpu?.total ?? 0;
  const cpuUser = health.system?.cpu?.user ?? 0;
  const cpuSystem = health.system?.cpu?.system ?? 0;

  const memoryStatus = health.system?.memory?.status ?? "unknown";
  const memoryUsed = health.system?.memory?.used ?? 0;
  const memoryTotal = health.system?.memory?.total ?? 0;
  const memoryExternal = health.system?.memory?.external ?? 0;
  const memoryUsagePercent =
    memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return LABELS.STATUS_NORMAL;
      case "unhealthy":
        return LABELS.STATUS_UNHEALTHY;
      case "warning":
        return LABELS.STATUS_WARNING;
      default:
        return LABELS.STATUS_UNKNOWN;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-green-500";
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 flex-shrink-0" />
              <span>{PAGE_HEADER.SYSTEM_STATUS}</span>
            </CardTitle>
            <CardDescription>
              {LABELS.LAST_UPDATE.replace(
                "{datetime}",
                new Date(data.timestamp).toLocaleString()
              )}
            </CardDescription>
          </div>
          <Badge
            variant={health.status === "healthy" ? "default" : "destructive"}
            className="h-7 w-fit"
          >
            {getStatusText(health.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU 상태 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  getStatusColor(cpuStatus)
                )}
              />
              <span className="font-medium">{LABELS.CPU}</span>
            </div>
            <div className="space-y-2">
              <Progress
                value={cpuTotal}
                className={cn("h-2", getProgressColor(cpuTotal))}
                aria-label={`CPU 사용률: ${cpuTotal}%`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {LABELS.CPU_USAGE.replace("{percent}", cpuTotal.toString())}
                </span>
                <span>
                  {LABELS.CPU_USER.replace("{percent}", cpuUser.toString())}
                </span>
                <span>
                  {LABELS.CPU_SYSTEM.replace("{percent}", cpuSystem.toString())}
                </span>
              </div>
            </div>
          </div>

          {/* 메모리 상태 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  getStatusColor(memoryStatus)
                )}
              />
              <span className="font-medium">{LABELS.MEMORY}</span>
            </div>
            <div className="space-y-2">
              <Progress
                value={memoryUsagePercent}
                className={cn("h-2", getProgressColor(memoryUsagePercent))}
                aria-label={`메모리 사용률: ${memoryUsagePercent}%`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {LABELS.MEMORY_USED.replace("{used}", memoryUsed.toString())}
                </span>
                <span>
                  {LABELS.MEMORY_TOTAL.replace(
                    "{total}",
                    memoryTotal.toString()
                  )}
                </span>
                <span>
                  {LABELS.MEMORY_EXTERNAL.replace(
                    "{external}",
                    memoryExternal.toString()
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 응답 시간 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <span className="font-medium">{LABELS.RESPONSE_TIME}</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {health.performance?.totalResponseTime ?? "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {LABELS.SERVER_STATUS}{" "}
                {getStatusText(health.status ?? "unknown")}
              </div>
            </div>
          </div>

          {/* 시스템 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 flex-shrink-0 text-purple-500" />
              <span className="font-medium">{LABELS.SYSTEM_INFO}</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                {LABELS.NODE_VERSION.replace(
                  "{version}",
                  health.system?.nodeVersion ?? "N/A"
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {LABELS.OS_INFO.replace(
                  "{platform}",
                  health.system?.platform ?? "N/A"
                ).replace("{arch}", health.system?.arch ?? "N/A")}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
