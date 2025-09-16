import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  MapPin,
  Car,
  FileText,
  Clock,
  User,
  Shield,
  Calendar,
} from "lucide-react";
import { getFarmTypeInfo } from "@/lib/constants/farm-types";
import { formatPhoneNumber } from "@/lib/utils/validation";
import { formatDateTime } from "@/lib/utils/datetime/date";
import { VisitorAvatar } from "./VisitorAvatar";
import { StatusBadge } from "./StatusBadge";
import type { VisitorWithFarm } from "@/lib/types/visitor";
import { LABELS } from "@/lib/constants/visitor";

interface VisitorDetailSheetProps {
  visitor: VisitorWithFarm | null;
  onClose: () => void;
}

export function VisitorDetailSheet({
  visitor,
  onClose,
}: VisitorDetailSheetProps) {
  if (!visitor) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 헤더 */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 pb-3 sm:pb-4 flex-shrink-0 border-b border-gray-100 dark:border-slate-700">
        <VisitorAvatar
          name={visitor.visitor_name}
          imageUrl={visitor.profile_photo_url}
          disinfectionCheck={visitor.disinfection_check}
          size="lg"
        />
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-all leading-tight">
            {visitor.visitor_name}
          </h3>
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <ScrollArea className="flex-1 min-h-0 pr-1 sm:pr-2 mt-3 sm:mt-4">
        <div className="space-y-3 sm:space-y-4 pb-2">
          {/* 기본 정보 */}
          <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-800 border border-gray-200/60 dark:border-slate-600/60">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center space-x-2 text-gray-700 dark:text-slate-200">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span>{LABELS.VISITOR_DETAIL_BASIC_INFO}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-gray-100 dark:border-slate-600">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
                    {LABELS.VISITOR_DETAIL_CONTACT}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-100 break-all">
                    {formatPhoneNumber(visitor.visitor_phone)}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-gray-100 dark:border-slate-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
                    {LABELS.VISITOR_DETAIL_ADDRESS}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-100 leading-relaxed break-all">
                    {visitor.visitor_address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 방문 정보 */}
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800 border border-blue-200/60 dark:border-blue-800/60">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span>{LABELS.VISITOR_DETAIL_VISIT_INFO}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100 dark:border-blue-800/60">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                    방문일시
                  </p>
                  {(() => {
                    const datePart = formatDateTime(
                      visitor.visit_datetime,
                      "yyyy.MM.dd"
                    );
                    const timePart = formatDateTime(
                      visitor.visit_datetime,
                      "HH:mm"
                    );
                    return (
                      <div>
                        <p className="text-sm sm:text-base font-bold text-blue-800 dark:text-blue-200 leading-tight">
                          {datePart}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 leading-tight">
                          {timePart}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100 dark:border-blue-800/60">
                {(() => {
                  const { Icon } = getFarmTypeInfo(
                    visitor.farms?.farm_type ?? null
                  );
                  return (
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                    방문 농장
                  </p>
                  <p className="text-sm sm:text-base font-bold text-blue-800 dark:text-blue-200 break-all">
                    {visitor.farms?.farm_name || LABELS.VISITOR_DETAIL_UNKNOWN}
                  </p>
                  {visitor.farms?.farm_type && (
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs sm:text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                    >
                      {getFarmTypeInfo(visitor.farms.farm_type ?? null).label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100 dark:border-blue-800/60">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {LABELS.VISITOR_DETAIL_VISIT_PURPOSE}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-blue-800 dark:text-blue-200 leading-relaxed break-all">
                    {visitor.visitor_purpose || LABELS.VISITOR_DETAIL_OTHER}
                  </p>
                </div>
              </div>
              {visitor.vehicle_number && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-blue-100 dark:border-blue-800/60">
                  <Car className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {LABELS.VISITOR_DETAIL_VEHICLE_NUMBER}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-blue-800 dark:text-blue-200 break-all">
                      {visitor.vehicle_number}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 방역 및 동의 정보 */}
          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-slate-800 border border-green-200/60 dark:border-green-800/60">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>{LABELS.VISITOR_DETAIL_DISINFECTION_INFO}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-green-100 dark:border-green-800/60">
                <StatusBadge isCompleted={visitor.disinfection_check} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">
                    {LABELS.VISITOR_DETAIL_DISINFECTION_STATUS}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-green-800 dark:text-green-200">
                    {visitor.disinfection_check
                      ? LABELS.VISITOR_DETAIL_DISINFECTION_COMPLETED
                      : LABELS.VISITOR_DETAIL_DISINFECTION_INCOMPLETED}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-green-100 dark:border-green-800/60">
                <Badge
                  variant={visitor.consent_given ? "default" : "secondary"}
                  className={`text-xs sm:text-sm ${
                    visitor.consent_given
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {visitor.consent_given
                    ? LABELS.VISITOR_DETAIL_CONSENT_COMPLETED
                    : LABELS.VISITOR_DETAIL_CONSENT_INCOMPLETED}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">
                    {LABELS.VISITOR_DETAIL_CONSENT}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-green-800 dark:text-green-200">
                    {visitor.consent_given
                      ? LABELS.VISITOR_DETAIL_CONSENT_AGREED
                      : LABELS.VISITOR_DETAIL_CONSENT_DISAGREED}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          {visitor.notes && (
            <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800 border border-amber-200/60 dark:border-amber-800/60">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-center space-x-2 text-amber-700 dark:text-amber-300">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                  <span>{LABELS.VISITOR_DETAIL_EXTRA_INFO}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-2 sm:p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-amber-100 dark:border-amber-800/60">
                  <p className="text-sm sm:text-base font-semibold text-amber-800 dark:text-amber-200 leading-relaxed break-all">
                    {visitor.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
