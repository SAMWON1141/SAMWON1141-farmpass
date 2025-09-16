import { CommonListItem } from "../shared/CommonListItem";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils/datetime/date";
import {
  getFarmTypeLabel,
  getFarmTypeColor,
  getFarmTypeIcon,
} from "@/lib/constants/farm-types";
import { LABELS } from "@/lib/constants/management";
import { useState } from "react";
import { FarmDetailSheet } from "./FarmDetailSheet";
import { CommonListWrapper } from "../shared/CommonListWrapper";
import type { Farm } from "@/lib/types/common";

type FarmWithExtras = Farm & {
  owner_name: string;
  member_count: number;
  visitor_count: number;
};

interface FarmListProps {
  farms: FarmWithExtras[];
}

export function FarmList({ farms }: FarmListProps) {
  const [selectedFarm, setSelectedFarm] = useState<FarmWithExtras | null>(null);

  return (
    <>
      <CommonListWrapper>
        {(farms || []).map((farm) => (
          <CommonListItem
            key={farm.id}
            avatar={
              <Avatar className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 flex items-center justify-center w-full h-full">
                  {(() => {
                    const Icon = getFarmTypeIcon(farm.farm_type || undefined);
                    return (
                      <Icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-blue-600 dark:text-blue-300" />
                    );
                  })()}
                </AvatarFallback>
              </Avatar>
            }
            primary={<span>{farm.farm_name}</span>}
            secondary={<span>{farm.farm_address}</span>}
            meta={
              <span>
                {`${farm.owner_name || LABELS.UNASSIGNED} / ${formatDateTime(
                  farm.created_at
                )}`}
              </span>
            }
            badges={
              farm.farm_type && (
                <Badge
                  className={`${getFarmTypeColor(
                    farm.farm_type
                  )} text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5`}
                >
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {(() => {
                      const Icon = getFarmTypeIcon(farm.farm_type);
                      return <Icon className="h-3 w-3 sm:h-4 sm:w-4" />;
                    })()}
                    <span>{getFarmTypeLabel(farm.farm_type)}</span>
                  </div>
                </Badge>
              )
            }
            actions={
              <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                        onClick={() => setSelectedFarm(farm)}
                        aria-label={`${farm.farm_name} 상세보기`}
                      >
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{LABELS.DETAIL_INFO_VIEW}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            }
          />
        ))}
      </CommonListWrapper>

      <FarmDetailSheet
        farm={selectedFarm}
        open={!!selectedFarm}
        onClose={() => setSelectedFarm(null)}
      />
    </>
  );
}
