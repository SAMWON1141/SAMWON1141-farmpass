import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Farm } from "@/lib/types/common";
import { LABELS, PLACEHOLDERS } from "@/lib/constants/dashboard";

interface FarmSelectorProps {
  selectedFarm: string;
  onFarmChange: (farmId: string) => void;
  availableFarms: Farm[];
  isAdmin: boolean;
}

export function FarmSelector({
  selectedFarm,
  onFarmChange,
  availableFarms,
  isAdmin,
}: FarmSelectorProps) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      <Select value={selectedFarm} onValueChange={onFarmChange}>
        <SelectTrigger
          className="w-full sm:w-[250px] md:w-[280px] h-8 sm:h-9 md:h-10"
          aria-label="농장 선택"
        >
          <SelectValue placeholder={PLACEHOLDERS.FARM_SELECT} />
        </SelectTrigger>
        <SelectContent>
          {isAdmin && <SelectItem value="all">{LABELS.ALL_FARMS}</SelectItem>}
          {(availableFarms || []).map((farm) => (
            <SelectItem key={farm.id} value={farm.id}>
              {farm.farm_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] sm:text-xs text-muted-foreground px-1">
        {isAdmin ? LABELS.FARM_SELECT_ADMIN_DESC : LABELS.FARM_SELECT_USER_DESC}
      </p>
    </div>
  );
}
