import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Image, Monitor, Bookmark } from "lucide-react";
import { LABELS, PLACEHOLDERS, PAGE_HEADER } from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";
import SettingsCardHeader from "../SettingsCardHeader";
import { useUnifiedImageUpload } from "@/hooks/media/useUnifiedImageUpload";

interface BrandingSectionProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  loading?: boolean;
}

export function BrandingSection({
  settings,
  onSettingChange,
  loading,
}: BrandingSectionProps) {
  // 로고 업로드 훅
  const logoUpload = useUnifiedImageUpload({
    uploadType: "logo",
    dbTable: "system_settings",
    dbId: settings.id,
    dbField: "logo",
    refetchSettings: true, // settings context 즉시 갱신
    onUpdate: (data) => {
      onSettingChange("logo", data.logo);
      // 프리뷰 업데이트
      if (data.logo) {
        setLogoPreview(`${data.logo}?t=${Date.now()}`);
      } else {
        setLogoPreview(null);
      }
    },
  });

  // 파비콘 업로드 훅
  const faviconUpload = useUnifiedImageUpload({
    uploadType: "favicon",
    dbTable: "system_settings",
    dbId: settings.id,
    dbField: "favicon",
    refetchSettings: true, // settings context 즉시 갱신
    onUpdate: (data) => {
      onSettingChange("favicon", data.favicon);
      // 프리뷰 업데이트 (강력한 캐시 버스터 적용)
      if (data.favicon) {
        setFaviconPreview(
          `${data.favicon}?t=${Date.now()}&v=${Date.now()}&cb=${Math.random()}`
        );
      } else {
        setFaviconPreview(null);
      }

      // 파비콘 업로드 완료 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1초 후 새로고침 (사용자가 성공 메시지를 볼 수 있도록)
    },
  });

  // 이미지 프리뷰 상태 관리
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.logo ? `${settings.logo}?t=${Date.now()}` : null
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    settings.favicon
      ? `${settings.favicon}?t=${Date.now()}&v=${Date.now()}`
      : null
  );

  // settings가 변경될 때마다 프리뷰 업데이트
  useEffect(() => {
    if (settings.logo) {
      setLogoPreview(`${settings.logo}?t=${Date.now()}`);
    } else {
      setLogoPreview(null);
    }

    if (settings.favicon) {
      setFaviconPreview(`${settings.favicon}?t=${Date.now()}&v=${Date.now()}`);
    } else {
      setFaviconPreview(null);
    }
  }, [settings]);

  return (
    <Card>
      <SettingsCardHeader
        icon={Image}
        title={PAGE_HEADER.BRANDING_TITLE}
        description={PAGE_HEADER.BRANDING_DESCRIPTION}
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 로고 */}
          <div className="relative">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Monitor className="h-5 w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {LABELS.SITE_LOGO}
                </span>
              </div>
              <div className="flex flex-col items-center sm:block">
                <ImageUpload
                  id="logo-upload"
                  uploadType="logo"
                  onUpload={logoUpload.uploadImage}
                  onDelete={logoUpload.deleteImage}
                  currentImage={logoPreview}
                  avatarSize="md"
                  label={LABELS.SITE_LOGO}
                  hideGuidelines={false}
                />
              </div>
              <div className="text-sm sm:text-base text-blue-600/80 space-y-1 text-center">
                <p>{LABELS.SITE_LOGO_DESCRIPTION}</p>
              </div>
            </div>
          </div>

          {/* 파비콘 */}
          <div className="relative">
            <div className="border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-700">
                <Bookmark className="h-5 w-5" />
                <span className="font-medium text-sm sm:text-base">
                  {LABELS.FAVICON}
                </span>
              </div>
              <div className="flex flex-col items-center sm:block">
                <ImageUpload
                  id="favicon-upload"
                  uploadType="favicon"
                  onUpload={faviconUpload.uploadImage}
                  onDelete={faviconUpload.deleteImage}
                  currentImage={faviconPreview}
                  avatarSize="md"
                  label={LABELS.FAVICON}
                  hideGuidelines={false}
                />
              </div>
              <div className="text-sm sm:text-base text-orange-600/80 space-y-1 text-center">
                <p>{LABELS.FAVICON_DESCRIPTION}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이트명 */}
        <div className="space-y-2">
          <Label
            htmlFor="siteName"
            className="text-sm sm:text-base font-medium"
          >
            {LABELS.SITE_NAME}
          </Label>
          <Input
            id="siteName"
            value={settings.siteName}
            onChange={(e) => onSettingChange("siteName", e.target.value)}
            disabled={loading}
            placeholder={PLACEHOLDERS.SITE_NAME}
          />
          <p className="text-sm sm:text-base text-muted-foreground">
            {LABELS.SITE_NAME_DESCRIPTION}
          </p>
        </div>

        {/* 사이트 설명 */}
        <div className="space-y-2">
          <Label
            htmlFor="siteDescription"
            className="text-sm sm:text-base font-medium"
          >
            {LABELS.SITE_DESCRIPTION}
          </Label>
          <Textarea
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => onSettingChange("siteDescription", e.target.value)}
            disabled={loading}
            placeholder={PLACEHOLDERS.SITE_DESCRIPTION}
            rows={3}
          />
          <p className="text-sm sm:text-base text-muted-foreground">
            {LABELS.SITE_DESCRIPTION_HELP}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
