import { Sprout, MapPin, Phone, AlertTriangle, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Farm } from "@/lib/types/common";
import { LABELS } from "@/lib/constants/visitor";

interface FarmInfoCardProps {
  farm: Farm;
}

export const FarmInfoCard = ({ farm }: FarmInfoCardProps) => {
  return (
    <Card className="mb-2 shadow-lg rounded-lg sm:rounded-2xl border border-gray-200 bg-white/90 max-w-lg mx-auto">
      <CardHeader className="pb-1 sm:pb-3 border-b border-gray-100 px-3 sm:px-6 pt-2 sm:pt-6">
        <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
          <Sprout className="h-4 sm:h-7 w-4 sm:w-7 text-green-600 flex-shrink-0" />
          <CardTitle className="text-base sm:text-2xl font-bold tracking-tight text-gray-900 break-all leading-tight">
            {farm.farm_name}
          </CardTitle>
        </div>
        <CardDescription className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-base text-gray-600">
          <MapPin className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0 text-blue-500 mt-0.5 sm:mt-0" />
          <span className="break-all leading-tight">{farm.farm_address}</span>
        </CardDescription>
        <div className="mt-1.5 sm:mt-2 mb-0.5 text-xs sm:text-sm text-gray-700 font-medium">
          {LABELS.FARM_INFO_CONTACT_GUIDE}
        </div>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-6 px-3 sm:px-6 space-y-2 sm:space-y-4">
        {/* 축사출입금지 안내 */}
        <Alert className="mb-1.5 sm:mb-2 border-0 bg-gradient-to-r from-red-100 to-orange-50 shadow-none flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3">
          <span className="flex items-center">
            <AlertTriangle className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-red-600 flex-shrink-0 mt-0" />
          </span>
          <AlertDescription className="font-semibold text-red-700 text-xs sm:text-base leading-tight flex items-center">
            {LABELS.FARM_INFO_NO_ENTRY_WARNING}
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col gap-1 sm:gap-1">
            <span className="text-xs sm:text-xs text-gray-500 font-medium">
              {LABELS.FARM_INFO_MANAGER_LABEL}
            </span>
            <span className="flex items-center gap-1 sm:gap-1 font-medium text-gray-800">
              <User2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400 flex-shrink-0" />
              <span className="break-all text-sm sm:text-base">
                {farm.manager_name}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:gap-1">
            <span className="text-xs sm:text-xs text-gray-500 font-medium">
              {LABELS.FARM_INFO_CONTACT_LABEL}
            </span>
            <span className="flex items-center gap-1 sm:gap-1 font-medium text-gray-800">
              <Phone className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-400 flex-shrink-0" />
              <span className="break-all text-sm sm:text-base">
                {farm.manager_phone}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
