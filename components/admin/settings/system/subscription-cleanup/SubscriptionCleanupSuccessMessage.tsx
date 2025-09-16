import type { SubscriptionCleanupResult } from "@/lib/types/notification";
import { LABELS } from "@/lib/constants/settings";

interface SubscriptionCleanupSuccessMessageProps {
  lastCleanupResult: SubscriptionCleanupResult | null;
}

export function SubscriptionCleanupSuccessMessage({
  lastCleanupResult,
}: SubscriptionCleanupSuccessMessageProps) {
  if (!lastCleanupResult) {
    return null;
  }

  const {
    cleanedCount = 0,
    validCount = 0,
    totalChecked = 0,
    stats = {},
  } = lastCleanupResult;

  // stats 객체가 undefined일 경우를 대비한 안전한 처리
  const safeStats = (stats || {}) as {
    failCountCleaned?: number;
    inactiveCleaned?: number;
    expiredCleaned?: number;
    forceDeleted?: number;
    oldSoftDeletedCleaned?: number;
  };

  if (cleanedCount === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <p className="text-sm sm:text-base text-green-700 font-medium">
            {LABELS.SUBSCRIPTION_CLEANUP_ALL_VALID_TITLE}
          </p>
        </div>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-1">
          {LABELS.SUBSCRIPTION_CLEANUP_ALL_VALID_DESC.replace(
            "{count}",
            (totalChecked || 0).toString()
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-sm sm:text-base text-green-700 font-medium">
          {LABELS.SUBSCRIPTION_CLEANUP_SUCCESS_TITLE}
        </p>
      </div>
      <div className="text-sm sm:text-base text-green-700 dark:text-green-200 mt-2 space-y-1">
        <p>
          {LABELS.SUBSCRIPTION_CLEANUP_SUCCESS_DESC.replace(
            "{count}",
            (cleanedCount || 0).toString()
          )}
        </p>
        <div className="bg-green-100 rounded p-2 mt-2">
          <p className="font-medium mb-1 text-sm sm:text-base">
            {LABELS.SUBSCRIPTION_CLEANUP_DETAILS_TITLE}
          </p>
          <ul className="space-y-0.5 text-sm sm:text-base">
            {(safeStats.failCountCleaned || 0) > 0 && (
              <li>
                {LABELS.SUBSCRIPTION_CLEANUP_FAIL_COUNT_CLEANED.replace(
                  "{count}",
                  (safeStats.failCountCleaned || 0).toString()
                )}
              </li>
            )}
            {(safeStats.inactiveCleaned || 0) > 0 && (
              <li>
                {LABELS.SUBSCRIPTION_CLEANUP_INACTIVE_CLEANED.replace(
                  "{count}",
                  (safeStats.inactiveCleaned || 0).toString()
                )}
              </li>
            )}
            {(safeStats.expiredCleaned || 0) > 0 && (
              <li>
                {LABELS.SUBSCRIPTION_CLEANUP_EXPIRED_CLEANED.replace(
                  "{count}",
                  (safeStats.expiredCleaned || 0).toString()
                )}
              </li>
            )}
            {(safeStats.forceDeleted || 0) > 0 && (
              <li>
                {LABELS.SUBSCRIPTION_CLEANUP_FORCE_DELETED.replace(
                  "{count}",
                  (safeStats.forceDeleted || 0).toString()
                )}
              </li>
            )}
            {(safeStats.oldSoftDeletedCleaned || 0) > 0 && (
              <li>
                {LABELS.SUBSCRIPTION_CLEANUP_OLD_SOFT_DELETED.replace(
                  "{count}",
                  (safeStats.oldSoftDeletedCleaned || 0).toString()
                )}
              </li>
            )}
          </ul>
          <p className="mt-1 text-sm sm:text-base opacity-75">
            {LABELS.SUBSCRIPTION_CLEANUP_SUMMARY.replace(
              "{valid}",
              (validCount || 0).toString()
            ).replace("{total}", (totalChecked || 0).toString())}
          </p>
        </div>
      </div>
    </div>
  );
}
