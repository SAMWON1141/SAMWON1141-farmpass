import { useState, useEffect } from "react";
import { Activity, Clock, History, CheckCircle2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { supabase } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils/datetime/date";
import { getDeviceInfo } from "@/lib/utils/browser/device-detection";
import {
  mapRawErrorToCode,
  getErrorMessage,
} from "@/lib/utils/error/errorUtil";
import AccountCardHeader from "./AccountCardHeader";
import { LABELS, PAGE_HEADER } from "@/lib/constants/account";

interface LoginActivity {
  id: string;
  device: string;
  location: string;
  time: string;
  isCurrent: boolean;
  icon: any;
  ip?: string;
  user_agent?: string;
}

interface LoginActivitySectionProps {
  profile: {
    id?: string;
    last_login_at?: string | null;
    password_changed_at?: string | null;
    login_count?: number | null;
    is_active?: boolean | null;
  } | null;
}

export function LoginActivitySection({ profile }: LoginActivitySectionProps) {
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);

  // 로그인 활동 데이터 로드
  const loadLoginActivity = async () => {
    if (!profile?.id) return;

    try {
      // 최근 로그인 기록 조회 (최근 5개)
      const { data: logs, error } = await supabase
        .from("system_logs")
        .select("*")
        .eq("user_id", profile.id)
        .eq("action", "LOGIN_SUCCESS")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        const errorCode = mapRawErrorToCode(error, "db");
        const message = getErrorMessage(errorCode);
        throw new Error(message);
      }

      const activities: LoginActivity[] = [];

      // 현재 세션 정보
      const currentDevice = getDeviceInfo();
      activities.push({
        id: "current",
        device: currentDevice.type,
        location: LABELS.CURRENT_LOCATION,
        time: LABELS.NOW,
        isCurrent: true,
        icon: currentDevice.icon,
        user_agent: currentDevice.userAgent,
      });

      // 이전 로그인 기록 변환
      logs?.forEach((log) => {
        // metadata가 string이면 JSON 파싱
        let metadata = log.metadata;
        if (typeof metadata === "string") {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = {};
          }
        }

        // 저장된 user_agent 문자열로 DeviceInfo 생성
        const userAgent = metadata?.user_agent || log.user_agent;
        // SSR에서도 동작하도록 window 객체를 오버라이드
        const mockWindow = { navigator: { userAgent } };
        const deviceInfo = getDeviceInfo.call({ window: mockWindow });

        activities.push({
          id: log.id,
          device: deviceInfo.type,
          location: metadata?.location || LABELS.UNKNOWN_LOCATION,
          time: formatTimeAgo(new Date(log.created_at)),
          isCurrent: false,
          icon: deviceInfo.icon,
          ip: metadata?.ip || log.user_ip,
          user_agent: userAgent,
        });
      });

      setLoginActivity(activities);
    } catch (error) {
      const errorCode = mapRawErrorToCode(error);
      const message = getErrorMessage(errorCode);
      devLog.error("Failed to load login activity:", message);
    }
  };

  // Load login activity on mount
  useEffect(() => {
    loadLoginActivity();
  }, [profile?.id]);

  return (
    <Card>
      <AccountCardHeader
        icon={Activity}
        title={PAGE_HEADER.LOGIN_ACTIVITY_TITLE}
        description={PAGE_HEADER.LOGIN_ACTIVITY_DESCRIPTION}
      />
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {(loginActivity || []).map((activity) => (
            <div
              key={activity.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg ${
                activity.isCurrent
                  ? "bg-primary/20 border border-primary/40"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                <activity.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base break-words">
                    {activity.device}
                    {activity.isCurrent && (
                      <span className="ml-2 text-xs sm:text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                        {LABELS.CURRENT_SESSION}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {activity.location}
                    {activity.ip && !activity.isCurrent && (
                      <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                        ({activity.ip})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground text-right sm:text-left">
                {activity.time}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium text-sm sm:text-base">
                {LABELS.LAST_LOGIN}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground break-words">
                {profile?.last_login_at
                  ? new Date(profile.last_login_at).toLocaleString()
                  : LABELS.NO_RECORD}
              </div>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium text-sm sm:text-base">
                {LABELS.PASSWORD_CHANGE}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground break-words">
                {profile?.password_changed_at
                  ? new Date(profile.password_changed_at).toLocaleString()
                  : LABELS.NO_RECORD}
              </div>
            </div>
            <History className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium text-sm sm:text-base">
                {LABELS.LOGIN_COUNT}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {profile?.login_count || 0}회
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium text-sm sm:text-base">
                {LABELS.ACCOUNT_STATUS}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {profile?.is_active ? LABELS.ACTIVE : LABELS.INACTIVE}
              </div>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
