import { LABELS } from "@/lib/constants/settings";

interface CleanupSuccessMessageProps {
  lastCleanupSuccess: string | null;
  cleanupStatus: {
    expiredData: {
      systemLogs: { count: number };
      visitorEntries: { count: number };
    };
  };
}

export function CleanupSuccessMessage({
  lastCleanupSuccess,
  cleanupStatus,
}: CleanupSuccessMessageProps) {
  if (lastCleanupSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in duration-500">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm sm:text-base text-green-700 font-medium">
            {LABELS.CLEANUP_SUCCESS_TITLE.replace("{type}", lastCleanupSuccess)}
          </p>
        </div>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-1">
          {LABELS.CLEANUP_SUCCESS_DESC}
        </p>
      </div>
    );
  }

  if (
    !lastCleanupSuccess &&
    cleanupStatus.expiredData.systemLogs.count === 0 &&
    cleanupStatus.expiredData.visitorEntries.count === 0
  ) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <p className="text-sm sm:text-base text-green-700 font-medium">
            {LABELS.CLEANUP_ALL_CLEANED_TITLE}
          </p>
        </div>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-1">
          {LABELS.CLEANUP_ALL_CLEANED_DESC}
        </p>
      </div>
    );
  }

  return null;
}
