import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BadgeCheck } from "lucide-react";
import { LABELS, PAGE_HEADER } from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";
import SettingsCardHeader from "../SettingsCardHeader";

import { ImageUpload } from "@/components/ui/image-upload";
import { useUnifiedImageUpload } from "@/hooks/media/useUnifiedImageUpload";

interface NotificationIconSectionProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  loading?: boolean;
}

const NotificationIconSection = React.memo(function NotificationIconSection({
  settings,
  onUpdate,
  loading,
}: NotificationIconSectionProps) {
  // 알림 아이콘 업로드 훅
  const notificationIconUpload = useUnifiedImageUpload({
    uploadType: "notificationIcon",
    dbTable: "system_settings",
    dbId: settings.id,
    dbField: "notificationIcon",
    refetchSettings: true, // settings context 즉시 갱신
    onUpdate: (data) => {
      // 프리뷰 업데이트만 수행 (서버에서 이미 갱신됨)
      if (data.notificationIcon) {
        setIconPreview(`${data.notificationIcon}?t=${Date.now()}`);
      } else {
        setIconPreview(null);
      }
    },
  });

  // 배지 아이콘 업로드 훅
  const notificationBadgeUpload = useUnifiedImageUpload({
    uploadType: "notificationBadge",
    dbTable: "system_settings",
    dbId: settings.id,
    dbField: "notificationBadge",
    refetchSettings: true, // settings context 즉시 갱신
    onUpdate: (data) => {
      // 프리뷰 업데이트만 수행 (서버에서 이미 갱신됨)
      if (data.notificationBadge) {
        setBadgePreview(`${data.notificationBadge}?t=${Date.now()}`);
      } else {
        setBadgePreview(null);
      }
    },
  });

  // 이미지 프리뷰 상태 관리
  const [iconPreview, setIconPreview] = useState<string | null>(
    settings.notificationIcon
      ? `${settings.notificationIcon}?t=${Date.now()}`
      : null
  );
  const [badgePreview, setBadgePreview] = useState<string | null>(
    settings.notificationBadge
      ? `${settings.notificationBadge}?t=${Date.now()}`
      : null
  );

  // settings가 변경될 때마다 프리뷰 업데이트
  useEffect(() => {
    if (settings.notificationIcon) {
      setIconPreview(`${settings.notificationIcon}?t=${Date.now()}`);
    } else {
      setIconPreview(null);
    }
    if (settings.notificationBadge) {
      setBadgePreview(`${settings.notificationBadge}?t=${Date.now()}`);
    } else {
      setBadgePreview(null);
    }
  }, [settings]);

  return (
    <Card>
      <SettingsCardHeader
        icon={Bell}
        title={PAGE_HEADER.NOTIFICATION_ICON_TITLE}
        description={PAGE_HEADER.NOTIFICATION_ICON_DESCRIPTION}
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 알림 아이콘 */}
          <div className="relative">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                <Bell className="h-5 w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {LABELS.NOTIFICATION_ICON_LABEL}
                </span>
              </div>
              <div className="flex flex-col items-center sm:block">
                <ImageUpload
                  id="notification-icon-upload"
                  uploadType="notificationIcon"
                  onUpload={notificationIconUpload.uploadImage}
                  onDelete={notificationIconUpload.deleteImage}
                  currentImage={iconPreview}
                  avatarSize="md"
                  label={LABELS.NOTIFICATION_ICON_LABEL}
                  hideGuidelines={false}
                />
              </div>
              <div className="text-sm sm:text-base text-blue-700 dark:text-blue-200 space-y-1 text-center">
                <p>{LABELS.NOTIFICATION_ICON_DESC}</p>
              </div>
            </div>
          </div>
          {/* 배지 아이콘 */}
          <div className="relative">
            <div className="border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-200">
                <BadgeCheck className="h-5 w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {LABELS.NOTIFICATION_BADGE_LABEL}
                </span>
              </div>
              <div className="flex flex-col items-center sm:block">
                <ImageUpload
                  id="notification-badge-upload"
                  uploadType="notificationBadge"
                  onUpload={notificationBadgeUpload.uploadImage}
                  onDelete={notificationBadgeUpload.deleteImage}
                  currentImage={badgePreview}
                  avatarSize="md"
                  label={LABELS.NOTIFICATION_BADGE_LABEL}
                  hideGuidelines={false}
                />
              </div>
              <div className="text-sm sm:text-base text-orange-700 dark:text-orange-200 space-y-1 text-center">
                <p>{LABELS.NOTIFICATION_BADGE_DESC}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default NotificationIconSection;
