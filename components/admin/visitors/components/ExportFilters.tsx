import { Building2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Farm } from "@/lib/types";
import {
  LABELS,
  PLACEHOLDERS,
  VISITOR_TYPE_OPTIONS,
} from "@/lib/constants/visitor";

interface ExportFiltersProps {
  farms: Farm[];
  farmFilter: string;
  visitorType: string;
  onFarmFilterChange: (value: string) => void;
  onVisitorTypeChange: (value: string) => void;
}

export function ExportFilters({
  farms,
  farmFilter,
  visitorType,
  onFarmFilterChange,
  onVisitorTypeChange,
}: ExportFiltersProps) {
  return (
    <Card className="border border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/50">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-200 text-sm sm:text-base">
          <Filter className="h-4 w-4" />
          <span>{LABELS.EXPORT_FILTERS_TITLE}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {farms.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-100">
              {LABELS.EXPORT_FILTERS_FARM_SELECT}
            </Label>
            <Select value={farmFilter} onValueChange={onFarmFilterChange}>
              <SelectTrigger
                className="h-8 sm:h-9 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                aria-label="농장 필터 선택"
              >
                <SelectValue
                  placeholder={
                    PLACEHOLDERS.DATE_RANGE_SELECTOR_FARM_PLACEHOLDER
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <SelectItem value="all">
                  {LABELS.EXPORT_FILTERS_ALL_FARMS}
                </SelectItem>
                {(farms || []).map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-3 w-3" />
                      <span>{farm.farm_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-100">
            {LABELS.EXPORT_FILTERS_VISITOR_TYPE}
          </Label>
          <Select value={visitorType} onValueChange={onVisitorTypeChange}>
            <SelectTrigger className="h-8 sm:h-9  bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <SelectValue
                placeholder={
                  PLACEHOLDERS.DATE_RANGE_SELECTOR_VISITOR_TYPE_PLACEHOLDER
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {VISITOR_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
