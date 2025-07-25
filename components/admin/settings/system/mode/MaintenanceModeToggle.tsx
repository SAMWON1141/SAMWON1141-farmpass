import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle } from "lucide-react";
import { LABELS } from "@/lib/constants/settings";

interface MaintenanceModeToggleProps {
  maintenanceMode: boolean;
  onUpdate: (value: boolean) => void;
  isLoading: boolean;
}

export function MaintenanceModeToggle({
  maintenanceMode,
  onUpdate,
  isLoading,
}: MaintenanceModeToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="maintenance-mode"
            className="text-sm font-medium flex items-center gap-1"
          >
            <Wrench className="h-4 w-4" />
            {LABELS.MAINTENANCE_MODE}
          </Label>
          {maintenanceMode && (
            <Badge variant="destructive" className="text-xs">
              {LABELS.MAINTENANCE_MODE_ACTIVE}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {LABELS.MAINTENANCE_MODE_DESC}
        </p>
        {maintenanceMode && (
          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{LABELS.MAINTENANCE_MODE_WARNING}</span>
          </div>
        )}
      </div>
      <Switch
        id="maintenance-mode"
        checked={maintenanceMode}
        onCheckedChange={onUpdate}
        disabled={isLoading}
      />
    </div>
  );
}
