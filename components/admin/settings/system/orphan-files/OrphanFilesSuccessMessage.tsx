import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileX } from "lucide-react";
import type { OrphanFilesStatus } from "@/lib/types/settings";
import { LABELS } from "@/lib/constants/settings";

interface OrphanFilesSuccessMessageProps {
  lastCleanupSuccess: string | null;
  orphanFilesStatus: OrphanFilesStatus;
}

export function OrphanFilesSuccessMessage({
  lastCleanupSuccess,
  orphanFilesStatus,
}: OrphanFilesSuccessMessageProps) {
  if (lastCleanupSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in duration-500">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm sm:text-base text-green-700 font-medium">
            {LABELS.ORPHAN_FILES_SUCCESS_TITLE.replace(
              "{type}",
              lastCleanupSuccess
            )}
          </p>
        </div>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-1">
          {LABELS.ORPHAN_FILES_SUCCESS_DESC}
        </p>
      </div>
    );
  }

  if (
    !lastCleanupSuccess &&
    orphanFilesStatus.visitorOrphanCount === 0 &&
    orphanFilesStatus.profileOrphanCount === 0
  ) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <p className="text-sm sm:text-base text-green-700 font-medium">
            {LABELS.ORPHAN_FILES_ALL_CLEANED_TITLE}
          </p>
        </div>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-1">
          {LABELS.ORPHAN_FILES_ALL_CLEANED_DESC}
        </p>
      </div>
    );
  }

  return null;
}
