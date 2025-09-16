import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { getFarmTypeInfo } from "@/lib/constants/farm-types";
import type { Farm } from "@/lib/types/common";
import { LABELS } from "@/lib/constants/visitor";

interface VisitorFarmSelectorProps {
  selectedFarm: string;
  farms: Farm[];
  onFarmChange: (value: string) => void;
  showAllOption?: boolean;
}

export function VisitorFarmSelector({
  selectedFarm,
  farms,
  onFarmChange,
  showAllOption = true,
}: VisitorFarmSelectorProps) {
  const getSelectedFarmInfo = () => {
    if (selectedFarm === "all" || !selectedFarm) {
      return {
        name: LABELS.VISITOR_FARM_SELECTOR_ALL_FARMS,
        type: null,
        icon: Building2,
      };
    }

    const farm = farms.find((f) => f.id === selectedFarm);
    if (!farm) {
      return {
        name: LABELS.VISITOR_FARM_SELECTOR_FARM_NOT_FOUND,
        type: null,
        icon: Building2,
      };
    }

    const { Icon } = getFarmTypeInfo(farm.farm_type ?? null);
    return {
      name: farm.farm_name,
      type: farm.farm_type,
      icon: Icon,
    };
  };

  const selectedFarmInfo = getSelectedFarmInfo();
  const Icon = selectedFarmInfo.icon;

  return (
    <Select value={selectedFarm} onValueChange={onFarmChange}>
      <SelectTrigger
        id="visitor-farm-selector"
        className="h-10 md:h-11 lg:h-12 border-slate-200 dark:border-slate-600 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all duration-300 bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md min-w-0 dark:text-slate-100 dark:placeholder:text-slate-400 dark:disabled:text-slate-500"
        aria-label="농장 선택"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-1 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-md flex-shrink-0">
            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300 flex-shrink-0" />
          </div>
          <span className="truncate font-medium flex-1 min-w-0 dark:text-slate-100">
            {selectedFarmInfo.name}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
        {showAllOption && (
          <SelectItem value="all">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-1 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-md flex-shrink-0">
                <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="truncate dark:text-slate-100">
                {LABELS.VISITOR_FARM_SELECTOR_ALL_FARMS}
              </span>
            </div>
          </SelectItem>
        )}
        {(farms || []).map((farm) => {
          const { Icon } = getFarmTypeInfo(farm.farm_type ?? null);
          return (
            <SelectItem key={farm.id} value={farm.id}>
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-1 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-md flex-shrink-0">
                  <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300 flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium dark:text-slate-100">
                    {farm.farm_name}
                  </div>
                  {farm.farm_type && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-300 font-medium truncate">
                      {getFarmTypeInfo(farm.farm_type).label}
                    </div>
                  )}
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
