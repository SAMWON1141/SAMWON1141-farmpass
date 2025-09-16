import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { BUTTONS, LABELS, PAGE_HEADER } from "@/lib/constants/management";
import { WarningConfirmSheet } from "@/components/ui/confirm-sheet";

interface LogManagementButtonsProps {
  logsCount: number;
  onDeleteOldLogs: () => void;
  onDeleteAllLogs: () => void;
  isLoading?: boolean;
}

const WarningIcon = memo(() => (
  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
));
WarningIcon.displayName = "WarningIcon";

export const LogManagementButtons = memo(
  ({
    logsCount,
    onDeleteOldLogs,
    onDeleteAllLogs,
    isLoading = false,
  }: LogManagementButtonsProps) => {
    const [deleteOldLogsOpen, setDeleteOldLogsOpen] = useState(false);
    const [deleteAllLogsOpen, setDeleteAllLogsOpen] = useState(false);

    const handleDeleteOldLogs = useCallback(() => {
      onDeleteOldLogs();
      setDeleteOldLogsOpen(false);
    }, [onDeleteOldLogs]);

    const handleDeleteAllLogs = useCallback(() => {
      onDeleteAllLogs();
      setDeleteAllLogsOpen(false);
    }, [onDeleteAllLogs]);

    return (
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-200 dark:border-orange-800"
            disabled={isLoading}
            onClick={() => setDeleteOldLogsOpen(true)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">{BUTTONS.DELETING}</span>
                <span className="sm:hidden">{BUTTONS.DELETING}</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {BUTTONS.DELETE_OLD_LOGS_30_DAYS}
                </span>
                <span className="sm:hidden">
                  {BUTTONS.DELETE_OLD_LOGS_30_DAYS_MOBILE}
                </span>
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => setDeleteAllLogsOpen(true)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">{BUTTONS.DELETING}</span>
                <span className="sm:hidden">{BUTTONS.DELETING}</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {BUTTONS.DELETE_ALL_LOGS}
                </span>
                <span className="sm:hidden">
                  {BUTTONS.DELETE_ALL_LOGS_MOBILE}
                </span>
              </>
            )}
          </Button>
        </div>

        {/* 30일 이전 로그 삭제 확인 시트 */}
        <WarningConfirmSheet
          open={deleteOldLogsOpen}
          onOpenChange={setDeleteOldLogsOpen}
          onConfirm={handleDeleteOldLogs}
          isLoading={isLoading}
          title={PAGE_HEADER.DELETE_OLD_LOGS_CONFIRM_TITLE}
          description={LABELS.CONFIRM_OLD_LOGS_DELETE}
          warningMessage={`${LABELS.OLD_LOGS_WARNING}\n\n${LABELS.DELETED_CONTENT}\n• ${LABELS.OLD_LOGS_DELETED}\n• ${LABELS.DELETED_LOGS_IRRECOVERABLE}`}
        />

        {/* 전체 로그 삭제 확인 시트 */}
        <WarningConfirmSheet
          open={deleteAllLogsOpen}
          onOpenChange={setDeleteAllLogsOpen}
          onConfirm={handleDeleteAllLogs}
          isLoading={isLoading}
          title={PAGE_HEADER.DELETE_ALL_LOGS_CONFIRM_TITLE}
          description={LABELS.CONFIRM_ALL_LOGS_DELETE}
          warningMessage={`${LABELS.ALL_LOGS_WARNING}\n\n${LABELS.DELETED_CONTENT}\n• ${LABELS.ALL_SYSTEM_LOGS} (${logsCount}개)\n• ${LABELS.ALL_USER_ACTIVITY}\n• ${LABELS.ALL_FARM_MANAGEMENT}\n• ${LABELS.ALL_SYSTEM_ERRORS}\n• ${LABELS.IRRECOVERABLE_DELETE}`}
        />
      </div>
    );
  }
);
LogManagementButtons.displayName = "LogManagementButtons";
