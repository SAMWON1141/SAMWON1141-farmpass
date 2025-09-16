import React from "react";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import NotificationCardHeader from "./NotificationCardHeader";
import { BellRing, MessageSquare } from "lucide-react";
import NotificationTypeCard from "@/components/admin/notifications/NotificationTypeCard";
import type { UserNotificationSetting } from "@/lib/types/common";
import { LABELS, PAGE_HEADER } from "@/lib/constants/notifications";

// 알림 방식 옵션
const notificationTypeOptions = [
  {
    title: LABELS.PUSH_NOTIFICATION,
    description: LABELS.PUSH_NOTIFICATION_DESC,
    icon: <BellRing className="h-5 w-5 text-primary" />,
    value: "push" as const,
    badge: "권장",
  },
  {
    title: LABELS.KAKAO_NOTIFICATION,
    description: LABELS.KAKAO_NOTIFICATION_DESC,
    icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
    value: "kakao" as const,
    disabled: true,
  },
];

interface NotificationMethodsCardProps {
  settings: UserNotificationSetting | null;
  onSettingChange: <K extends keyof UserNotificationSetting>(
    key: K,
    value: UserNotificationSetting[K]
  ) => void;
}

const NotificationMethodsCard = React.memo(function NotificationMethodsCard({
  settings,
  onSettingChange,
}: NotificationMethodsCardProps) {
  const handleOptionSelect = (value: string) => {
    onSettingChange("notification_method", value as "push" | "kakao");
  };

  return (
    <Card>
      <NotificationCardHeader
        icon={Bell}
        title={PAGE_HEADER.NOTIFICATION_SETTINGS}
        description={PAGE_HEADER.NOTIFICATION_SETTINGS_DESC}
      />
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {notificationTypeOptions.map((option) => (
              <NotificationTypeCard
                key={option.value}
                title={option.title}
                description={option.description}
                icon={option.icon}
                value={option.value}
                selected={settings?.notification_method === option.value}
                onClick={() =>
                  !option.disabled && handleOptionSelect(option.value)
                }
                disabled={option.disabled}
                badge={option.badge}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { NotificationMethodsCard };
