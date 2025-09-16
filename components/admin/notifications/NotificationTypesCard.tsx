import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { UserNotificationSetting } from "@/lib/types/common";
import NotificationCardHeader from "./NotificationCardHeader";
import { NOTIFICATION_TYPES, PAGE_HEADER } from "@/lib/constants/notifications";
import { Bell } from "lucide-react";

interface NotificationTypesCardProps {
  settings: UserNotificationSetting | null;
  onSettingChange: <K extends keyof UserNotificationSetting>(
    key: K,
    value: UserNotificationSetting[K]
  ) => void;
}

const NotificationTypesCard = React.memo(function NotificationTypesCard({
  settings,
  onSettingChange,
}: NotificationTypesCardProps) {
  // 토글 핸들러 - 부모에 변경사항 알림
  const handleToggle = (key: keyof UserNotificationSetting, value: boolean) => {
    onSettingChange(key, value);
  };

  return (
    <Card>
      <NotificationCardHeader
        icon={Bell}
        title={PAGE_HEADER.NOTIFICATION_TYPES_TITLE}
        description={PAGE_HEADER.NOTIFICATION_TYPES_DESCRIPTION}
      />
      <CardContent>
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div
              key={type.key}
              className="flex flex-row items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer hover:border-primary btn-hover"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${type.iconColor}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <p className="text-sm sm:text-base font-medium">{type.label}</p>
              </div>
              <Switch
                checked={Boolean(settings?.[type.key])}
                onCheckedChange={(checked) => handleToggle(type.key, checked)}
                className="ml-auto"
                aria-label={`${type.label} 알림 토글`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export { NotificationTypesCard };
