import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LABELS,
  PLACEHOLDERS,
  SUBSCRIPTION_CLEANUP_DAYS_OPTIONS,
  SUBSCRIPTION_FAIL_COUNT_OPTIONS,
} from "@/lib/constants/settings";
import type { SystemSettings } from "@/lib/types/settings";

interface SubscriptionCleanupFormProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  isLoading: boolean;
}

export function SubscriptionCleanupForm({
  settings,
  onUpdate,
  isLoading,
}: SubscriptionCleanupFormProps) {
  return (
    <div className="space-y-6">
      {/* 삭제 일수 설정 */}
      <div className="space-y-2">
        <Label htmlFor="cleanupDays">{LABELS.SUBSCRIPTION_CLEANUP_DAYS}</Label>
        <Select
          value={settings.subscriptionCleanupDays?.toString() || "30"}
          onValueChange={(value) =>
            onUpdate("subscriptionCleanupDays", parseInt(value))
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={PLACEHOLDERS.SUBSCRIPTION_CLEANUP_DAYS} />
          </SelectTrigger>
          <SelectContent>
            {SUBSCRIPTION_CLEANUP_DAYS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {LABELS.SUBSCRIPTION_CLEANUP_DAYS_DESC}
        </p>
      </div>

      {/* 실패 횟수 임계값 */}
      <div className="space-y-2">
        <Label htmlFor="failCountThreshold">
          {LABELS.SUBSCRIPTION_FAIL_COUNT_THRESHOLD}
        </Label>
        <Select
          value={settings.subscriptionFailCountThreshold?.toString() || "5"}
          onValueChange={(value) =>
            onUpdate("subscriptionFailCountThreshold", parseInt(value))
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={PLACEHOLDERS.SUBSCRIPTION_FAIL_COUNT_THRESHOLD}
            />
          </SelectTrigger>
          <SelectContent>
            {SUBSCRIPTION_FAIL_COUNT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {LABELS.SUBSCRIPTION_FAIL_COUNT_DESC}
        </p>
      </div>

      {/* 비활성 구독 정리 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{LABELS.SUBSCRIPTION_CLEANUP_INACTIVE}</Label>
          <p className="text-sm text-muted-foreground">
            {LABELS.SUBSCRIPTION_CLEANUP_INACTIVE_DESC}
          </p>
        </div>
        <Switch
          checked={settings.subscriptionCleanupInactive || false}
          onCheckedChange={(checked) =>
            onUpdate("subscriptionCleanupInactive", checked)
          }
          disabled={isLoading}
        />
      </div>

      {/* 강제 삭제 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{LABELS.SUBSCRIPTION_FORCE_DELETE_SETTING}</Label>
          <p className="text-sm text-muted-foreground">
            {LABELS.SUBSCRIPTION_FORCE_DELETE_DESC}
          </p>
        </div>
        <Switch
          checked={settings.subscriptionForceDelete || false}
          onCheckedChange={(checked) =>
            onUpdate("subscriptionForceDelete", checked)
          }
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
