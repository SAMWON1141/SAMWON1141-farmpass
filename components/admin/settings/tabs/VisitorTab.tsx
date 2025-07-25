"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UserCheck } from "lucide-react";
import { LABELS, PAGE_HEADER } from "@/lib/constants/settings";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import type { SystemSettings } from "@/lib/types/settings";
import { useNumberInput } from "@/hooks/use-number-input";
import SettingsCardHeader from "../SettingsCardHeader";

interface VisitorTabProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  isLoading: boolean;
}

export default function VisitorTab({
  settings,
  onUpdate,
  isLoading,
}: VisitorTabProps) {
  const reVisitAllowInterval = useNumberInput("reVisitAllowInterval");
  const maxVisitorsPerDay = useNumberInput("maxVisitorsPerDay");
  const visitorDataRetentionDays = useNumberInput("visitorDataRetentionDays");

  // 디스플레이용 상태 (안전한 처리)
  const [reVisitAllowIntervalDisplay, setReVisitAllowIntervalDisplay] =
    useState((settings.reVisitAllowInterval ?? 0).toString());
  const [maxVisitorsPerDayDisplay, setMaxVisitorsPerDayDisplay] = useState(
    (settings.maxVisitorsPerDay ?? 0).toString()
  );
  const [visitorDataRetentionDaysDisplay, setVisitorDataRetentionDaysDisplay] =
    useState((settings.visitorDataRetentionDays ?? 0).toString());

  // settings가 변경될 때 디스플레이 값 업데이트 (안전한 처리)
  useEffect(() => {
    if (!reVisitAllowInterval.isEditing) {
      setReVisitAllowIntervalDisplay(
        (settings.reVisitAllowInterval ?? 0).toString()
      );
    }
  }, [settings.reVisitAllowInterval, reVisitAllowInterval.isEditing]);

  useEffect(() => {
    if (!maxVisitorsPerDay.isEditing) {
      setMaxVisitorsPerDayDisplay((settings.maxVisitorsPerDay ?? 0).toString());
    }
  }, [settings.maxVisitorsPerDay, maxVisitorsPerDay.isEditing]);

  useEffect(() => {
    if (!visitorDataRetentionDays.isEditing) {
      setVisitorDataRetentionDaysDisplay(
        (settings.visitorDataRetentionDays ?? 0).toString()
      );
    }
  }, [settings.visitorDataRetentionDays, visitorDataRetentionDays.isEditing]);

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <Card>
        <SettingsCardHeader
          icon={UserCheck}
          title={PAGE_HEADER.VISITOR_POLICY_TITLE}
          description={PAGE_HEADER.VISITOR_POLICY_DESC}
        />
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reVisitAllowInterval">
              {LABELS.VISITOR_REVISIT_INTERVAL}
            </Label>
            <Input
              id="reVisitAllowInterval"
              type="number"
              value={reVisitAllowIntervalDisplay}
              onChange={(e) =>
                reVisitAllowInterval.handleChange(
                  e,
                  (value) => onUpdate("reVisitAllowInterval", value),
                  setReVisitAllowIntervalDisplay
                )
              }
              onBlur={(e) =>
                reVisitAllowInterval.handleBlur(
                  e.target.value,
                  (value) => onUpdate("reVisitAllowInterval", value),
                  setReVisitAllowIntervalDisplay
                )
              }
              onFocus={reVisitAllowInterval.handleFocus}
              min={reVisitAllowInterval.min}
              max={reVisitAllowInterval.max}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxVisitorsPerDay">
              {LABELS.VISITOR_MAX_PER_DAY}
            </Label>
            <Input
              id="maxVisitorsPerDay"
              type="number"
              value={maxVisitorsPerDayDisplay}
              onChange={(e) =>
                maxVisitorsPerDay.handleChange(
                  e,
                  (value) => onUpdate("maxVisitorsPerDay", value),
                  setMaxVisitorsPerDayDisplay
                )
              }
              onBlur={(e) =>
                maxVisitorsPerDay.handleBlur(
                  e.target.value,
                  (value) => onUpdate("maxVisitorsPerDay", value),
                  setMaxVisitorsPerDayDisplay
                )
              }
              onFocus={maxVisitorsPerDay.handleFocus}
              min={maxVisitorsPerDay.min}
              max={maxVisitorsPerDay.max}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="visitorDataRetentionDays">
              {LABELS.VISITOR_DATA_RETENTION}
            </Label>
            <Input
              id="visitorDataRetentionDays"
              type="number"
              value={visitorDataRetentionDaysDisplay}
              onChange={(e) =>
                visitorDataRetentionDays.handleChange(
                  e,
                  (value) => onUpdate("visitorDataRetentionDays", value),
                  setVisitorDataRetentionDaysDisplay
                )
              }
              onBlur={(e) =>
                visitorDataRetentionDays.handleBlur(
                  e.target.value,
                  (value) => onUpdate("visitorDataRetentionDays", value),
                  setVisitorDataRetentionDaysDisplay
                )
              }
              onFocus={visitorDataRetentionDays.handleFocus}
              min={visitorDataRetentionDays.min}
              max={visitorDataRetentionDays.max}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requireVisitorPhoto">
              {LABELS.VISITOR_PHOTO_REQUIRED}
            </Label>
            <Switch
              id="requireVisitorPhoto"
              checked={settings.requireVisitorPhoto}
              onCheckedChange={(checked) =>
                onUpdate("requireVisitorPhoto", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requireVisitorContact">
              {LABELS.VISITOR_CONTACT_REQUIRED}
            </Label>
            <Switch
              id="requireVisitorContact"
              checked={settings.requireVisitorContact}
              onCheckedChange={(checked) =>
                onUpdate("requireVisitorContact", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requireVisitPurpose">
              {LABELS.VISITOR_PURPOSE_REQUIRED}
            </Label>
            <Switch
              id="requireVisitPurpose"
              checked={settings.requireVisitPurpose}
              onCheckedChange={(checked) =>
                onUpdate("requireVisitPurpose", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
