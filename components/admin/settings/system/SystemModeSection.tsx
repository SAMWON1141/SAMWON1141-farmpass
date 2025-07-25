import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { SystemSettings } from "@/lib/types/settings";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SettingsCardHeader from "../SettingsCardHeader";
import {
  DebugModeToggle,
  MaintenanceModeToggle,
  MaintenanceSettings,
} from "./mode";
import { BUTTONS, PAGE_HEADER } from "@/lib/constants/settings";

interface SystemModeSectionProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  isLoading: boolean;
}

export function SystemModeSection({
  settings,
  onUpdate,
  isLoading,
}: SystemModeSectionProps) {
  const [showMaintenanceSettings, setShowMaintenanceSettings] = useState(false);

  const handleMaintenanceModeChange = (checked: boolean) => {
    onUpdate("maintenanceMode", checked);

    // 유지보수 모드 활성화 시 시작 시간 설정
    if (checked && !settings.maintenanceStartTime) {
      onUpdate("maintenanceStartTime", new Date().toISOString());
    }
    // 유지보수 모드 비활성화 시 시작 시간 초기화
    else if (!checked) {
      onUpdate("maintenanceStartTime", null);
    }
  };

  return (
    <Card>
      <SettingsCardHeader
        icon={Settings}
        title={PAGE_HEADER.SYSTEM_MODE_SECTION_TITLE}
        description={PAGE_HEADER.SYSTEM_MODE_SECTION_DESC}
      />
      <CardContent className="space-y-4">
        <DebugModeToggle
          debugMode={settings.debugMode}
          onUpdate={(value) => onUpdate("debugMode", value)}
          isLoading={isLoading}
        />
        <Separator />
        <div className="space-y-3">
          <MaintenanceModeToggle
            maintenanceMode={settings.maintenanceMode}
            onUpdate={handleMaintenanceModeChange}
            isLoading={isLoading}
          />
          <Collapsible
            open={showMaintenanceSettings}
            onOpenChange={setShowMaintenanceSettings}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                {BUTTONS.SYSTEM_MODE_MAINTENANCE_DETAILS}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <MaintenanceSettings
                settings={settings}
                onUpdate={onUpdate}
                isLoading={isLoading}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
