import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users } from "lucide-react";
import { getFarmTypeIcon, getFarmTypeLabel } from "@/lib/constants/farm-types";
import type { Farm } from "@/lib/types/common";
import { getFarmTypeInfo } from "@/lib/constants/farm-types";
import { LABELS } from "@/lib/constants/visitor";

interface FarmSelectorProps {
  farms: Farm[];
  currentFarm: Farm | null;
  selectedFarmId: string;
  visitorsCount: number;
  todayVisitorsCount: number;
  onFarmChange: (farmId: string) => void;
  showAllOption?: boolean;
}

export function FarmSelector({
  farms,
  currentFarm,
  selectedFarmId,
  visitorsCount,
  todayVisitorsCount,
  onFarmChange,
  showAllOption = true,
}: FarmSelectorProps) {
  const getSelectedFarmInfo = () => {
    if (selectedFarmId === "all" || !selectedFarmId) {
      return {
        name: LABELS.FARM_SELECTOR_ALL_FARMS,
        type: null,
        icon: Building2,
      };
    }

    const farm = farms.find((f) => f.id === selectedFarmId);
    if (!farm) {
      return {
        name: LABELS.FARM_SELECTOR_FARM_NOT_FOUND,
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

  // 여러 농장이 있는 경우의 선택 카드
  if (farms.length > 1) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 via-white to-gray-50 border border-slate-200/60 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-slate-900">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold">
                {LABELS.FARM_SELECTOR_TITLE}
              </span>
              <div className="text-xs sm:text-sm font-normal text-slate-600 mt-0.5">
                {LABELS.FARM_SELECTOR_SUBTITLE.replace(
                  "{count}",
                  farms.length.toString()
                )}
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-slate-700/70 ml-8 sm:ml-11 text-xs sm:text-sm">
            {LABELS.FARM_SELECTOR_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full lg:w-auto">
              <Select value={selectedFarmId} onValueChange={onFarmChange}>
                <SelectTrigger
                  className="h-9 sm:h-10 md:h-11 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 bg-white/90 backdrop-blur-sm text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md"
                  aria-label="농장 선택"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
                    </div>
                    <span className="truncate font-medium">
                      {selectedFarmInfo.name}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-w-xs sm:max-w-sm">
                  {showAllOption && (
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1 bg-gradient-to-br from-slate-100 to-gray-100 rounded-md">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                        </div>
                        <span>{LABELS.FARM_SELECTOR_ALL_FARMS}</span>
                      </div>
                    </SelectItem>
                  )}
                  {(farms || []).map((farm) => {
                    const { Icon } = getFarmTypeInfo(farm.farm_type ?? null);
                    return (
                      <SelectItem key={farm.id} value={farm.id}>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md">
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">
                              {farm.farm_name}
                            </div>
                            {farm.farm_type && (
                              <div className="text-[10px] sm:text-xs text-indigo-600 font-medium">
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
            </div>

            {currentFarm && (
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white/60 rounded-lg border border-slate-200/40 backdrop-blur-sm w-full lg:w-auto">
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="p-1 bg-slate-100 rounded-md">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
                    {currentFarm.farm_name}
                  </span>
                  {currentFarm.farm_type && (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[9px] sm:text-xs ml-1">
                      {getFarmTypeLabel(currentFarm.farm_type)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="p-1 bg-gray-100 rounded-md">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm">
                    {LABELS.FARM_SELECTOR_TOTAL_RECORDS.replace(
                      "{count}",
                      visitorsCount.toString()
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 단일 농장인 경우의 정보 카드
  if (farms.length === 1 && currentFarm) {
    return (
      <Card className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-200/60 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-sm flex-shrink-0">
                {(() => {
                  const FarmIcon = getFarmTypeIcon(
                    currentFarm.farm_type || undefined
                  );
                  return (
                    <FarmIcon className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold text-teal-900 mb-1 sm:mb-2 truncate">
                  {currentFarm.farm_name}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3">
                  {currentFarm.farm_type && (
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 font-medium text-xs sm:text-sm">
                      {getFarmTypeLabel(currentFarm.farm_type)}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-teal-700">
                    <div className="p-1 bg-teal-100 rounded-md">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm">
                      {LABELS.FARM_SELECTOR_TOTAL_RECORDS.replace(
                        "{count}",
                        visitorsCount.toString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto flex justify-center sm:block">
              <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-teal-200/40 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-teal-800">
                    {todayVisitorsCount}
                  </div>
                  <div className="text-[10px] sm:text-xs text-teal-600 font-medium">
                    {LABELS.FARM_SELECTOR_TODAY_VISITORS}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentFarm.farm_address && (
            <CardDescription className="ml-11 sm:ml-14 text-teal-700/70 font-medium text-xs sm:text-sm">
              📍 {currentFarm.farm_address}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    );
  }

  return null;
}
