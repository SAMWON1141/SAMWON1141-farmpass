import { useState } from "react";
import { formatDateTime } from "@/lib/utils/datetime/date";
import { Table, TableBody } from "@/components/ui/table";
import { Sheet } from "@/components/ui/sheet";
import {
  CommonSheetContent,
  CommonSheetHeader,
} from "@/components/ui/sheet-common";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Car, FileText, Calendar, Sparkles } from "lucide-react";
import { getFarmTypeInfo } from "@/lib/constants/farm-types";
import { formatPhoneNumber } from "@/lib/utils/validation";
import { BUTTONS, LABELS } from "@/lib/constants/visitor";
import {
  VisitorAvatar,
  StatusBadge,
  VisitorDetailSheet,
  VisitorActionMenu,
  VisitorTableLoading,
  VisitorTableEmpty,
  VisitorTableRow,
  VisitorTableHeader,
} from "./components";
import type { VisitorWithFarm } from "@/lib/types/visitor";
import type { VisitorSheetFormData } from "@/lib/utils/validation/visitor-validation";
import { ZoomableImage } from "@/components/ui/zoomable-image";

interface VisitorTableSheetProps {
  visitors: VisitorWithFarm[];
  showFarmColumn?: boolean;
  loading?: boolean;
  isAdmin?: boolean;
  onEdit?: (visitor: VisitorSheetFormData) => Promise<void>;
  onDelete?: (visitorId: string, farmId: string) => Promise<void>;
}

// 모바일 카드 컴포넌트
function MobileVisitorCard({
  visitor,
  index,
  showFarmColumn,
  onViewDetails,
  isAdmin,
  onEdit,
  onDelete,
}: {
  visitor: VisitorWithFarm;
  index: number;
  showFarmColumn: boolean;
  onViewDetails: (visitor: VisitorWithFarm) => void;
  isAdmin?: boolean;
  onEdit?: (visitor: VisitorSheetFormData) => Promise<void>;
  onDelete?: (visitorId: string, farmId: string) => Promise<void>;
}) {
  return (
    <Card className="border border-gray-200/60 dark:border-slate-600/60 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="relative">
              {visitor.profile_photo_url ? (
                <ZoomableImage
                  src={visitor.profile_photo_url}
                  alt={visitor.visitor_name}
                  title={`${visitor.visitor_name} 프로필`}
                  className="rounded-full"
                  shape="circle"
                  size="md"
                />
              ) : (
                <VisitorAvatar
                  name={visitor.visitor_name}
                  imageUrl={visitor.profile_photo_url}
                  disinfectionCheck={visitor.disinfection_check}
                  size="md"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="font-semibold text-gray-900 dark:text-slate-100 truncate text-base sm:text-lg max-w-[120px] sm:max-w-none cursor-help touch-manipulation">
                      {visitor.visitor_name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="max-w-[200px] z-[9999]"
                    sideOffset={8}
                  >
                    <p>{visitor.visitor_name}</p>
                  </TooltipContent>
                </Tooltip>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm px-1 sm:px-1.5 py-0.5 font-medium bg-white/95 dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 border-gray-300 dark:border-slate-500 backdrop-blur-sm"
                >
                  #{index + 1}
                </Badge>
              </div>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-slate-200 font-medium cursor-help touch-manipulation">
                    {formatPhoneNumber(visitor.visitor_phone)}
                  </p>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-[200px] z-[9999]"
                  sideOffset={8}
                >
                  <p>{formatPhoneNumber(visitor.visitor_phone)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge isCompleted={visitor.disinfection_check} />
            {isAdmin && (
              <VisitorActionMenu
                visitor={visitor}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-2.5 text-sm sm:text-base">
          <div className="flex items-start space-x-2 sm:space-x-3 p-1.5 sm:p-2 bg-gray-50/90 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              {(() => {
                const datePart = formatDateTime(
                  visitor.visit_datetime,
                  "yyyy.MM.dd"
                );
                const timePart = formatDateTime(
                  visitor.visit_datetime,
                  "HH:mm"
                );
                const fullDateTime = formatDateTime(
                  visitor.visit_datetime,
                  "yyyy.MM.dd HH:mm:ss"
                );
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="font-medium text-gray-700 dark:text-slate-100 leading-tight">
                          {datePart}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-tight">
                          {timePart}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fullDateTime}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })()}
            </div>
          </div>

          {showFarmColumn && visitor.farms && (
            <div className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 bg-purple-50/90 dark:bg-purple-800/40 rounded-lg backdrop-blur-sm">
              {(() => {
                const { Icon } = getFarmTypeInfo(
                  visitor.farms?.farm_type ?? null
                );
                return (
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                );
              })()}
              <div className="min-w-0 flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm sm:text-base text-gray-700 dark:text-slate-100 font-medium truncate cursor-help">
                      {visitor.farms?.farm_name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{visitor.farms?.farm_name}</p>
                  </TooltipContent>
                </Tooltip>
                {visitor.farms?.farm_type && (
                  <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-medium">
                    {getFarmTypeInfo(visitor.farms.farm_type ?? null).label}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 bg-emerald-50/90 dark:bg-emerald-800/40 rounded-lg w-full backdrop-blur-sm">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className="font-medium text-gray-700 dark:text-slate-100 truncate flex-1 cursor-help touch-manipulation">
                  {visitor.visitor_purpose ||
                    LABELS.VISITOR_TABLE_DEFAULT_PURPOSE}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="max-w-[200px] z-[9999]"
                sideOffset={8}
              >
                <p>
                  {visitor.visitor_purpose ||
                    LABELS.VISITOR_TABLE_DEFAULT_PURPOSE}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {visitor.vehicle_number && (
            <div className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 bg-amber-50/90 dark:bg-amber-800/40 rounded-lg w-full backdrop-blur-sm">
              <Car className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="font-medium text-gray-700 dark:text-slate-100 truncate flex-1 cursor-help touch-manipulation">
                    {visitor.vehicle_number}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-[200px] z-[9999]"
                  sideOffset={8}
                >
                  <p>{visitor.vehicle_number}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-slate-600">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
              {visitor.disinfection_check && (
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-300 truncate">
                {LABELS.VISITOR_TABLE_DISINFECTION_STATUS}{" "}
                {visitor.disinfection_check
                  ? LABELS.VISITOR_TABLE_DISINFECTION_COMPLETE
                  : LABELS.VISITOR_TABLE_DISINFECTION_INCOMPLETE}
              </span>
            </div>
            <button
              onClick={() => onViewDetails(visitor)}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex-shrink-0 ml-2"
            >
              {BUTTONS.VISITOR_TABLE_DETAILS_BUTTON}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VisitorTableSheet({
  visitors,
  showFarmColumn = true,
  loading = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: VisitorTableSheetProps) {
  const [selectedVisitor, setSelectedVisitor] =
    useState<VisitorWithFarm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (visitor: VisitorWithFarm) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVisitor(null);
  };

  // 로딩 상태
  if (loading) {
    return <VisitorTableLoading />;
  }

  // 데이터가 없는 경우
  if (!visitors || visitors.length === 0) {
    return <VisitorTableEmpty />;
  }

  return (
    <>
      {/* 데스크탑 테이블 */}
      <div className="hidden xl:block">
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm">
          <Table className="table-fixed min-w-[900px]">
            <VisitorTableHeader showFarmColumn={showFarmColumn} />
            <TableBody>
              {(visitors || []).map((visitor, index) => (
                <VisitorTableRow
                  key={visitor.id}
                  visitor={visitor}
                  index={index}
                  showFarmColumn={showFarmColumn}
                  onViewDetails={handleViewDetails}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 모바일 카드 목록 */}
      <div className="xl:hidden space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
        {(visitors || []).map((visitor, index) => (
          <MobileVisitorCard
            key={visitor.id}
            visitor={visitor}
            index={index}
            showFarmColumn={showFarmColumn}
            onViewDetails={handleViewDetails}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* 방문 상세 모달 */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <CommonSheetContent
          side="bottom"
          enableDragToResize={true}
          onClose={handleCloseModal}
          open={isModalOpen}
        >
          <CommonSheetHeader
            title={LABELS.VISITOR_TABLE_DETAILS_TITLE}
            description={LABELS.VISITOR_TABLE_DETAILS_DESC}
          />
          <ScrollArea className="flex-1">
            <VisitorDetailSheet
              visitor={selectedVisitor}
              onClose={handleCloseModal}
            />
          </ScrollArea>
        </CommonSheetContent>
      </Sheet>
    </>
  );
}
