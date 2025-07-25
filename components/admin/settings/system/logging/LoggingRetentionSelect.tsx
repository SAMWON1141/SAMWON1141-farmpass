import { Label } from "@/components/ui/label";
import {
  LABELS,
  PLACEHOLDERS,
  LOGGING_RETENTION_OPTIONS,
} from "@/lib/constants/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoggingRetentionSelectProps {
  value: number;
  onChange: (value: number) => void;
  isLoading: boolean;
}

export function LoggingRetentionSelect({
  value,
  onChange,
  isLoading,
}: LoggingRetentionSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="logging-retention" className="text-sm font-medium">
        {LABELS.LOGGING_RETENTION}
      </Label>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={isLoading}
      >
        <SelectTrigger id="logging-retention">
          <SelectValue placeholder={PLACEHOLDERS.LOGGING_RETENTION} />
        </SelectTrigger>
        <SelectContent>
          {LOGGING_RETENTION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {LABELS.LOGGING_RETENTION_DESC.replace("{days}", value.toString())}
      </p>
    </div>
  );
}
