"use client";

import React, { useState } from "react";

import { useFarmMutations } from "@/lib/hooks/query/use-farm-mutations";
import { useAuth } from "@/components/providers/auth-provider";
import { useCommonToast } from "@/lib/utils/notification/toast-messages";
import { Farm } from "@/lib/types/common";
import { FarmsList } from "@/components/admin/farms/FarmsList";
import { FarmsPageHeader } from "@/components/admin/farms/FarmsPageHeader";
import { EmptyFarmsState } from "@/components/admin/farms/EmptyFarmsState";
import { DeleteConfirmSheet } from "@/components/ui/confirm-sheet";
import { Input } from "@/components/ui/input";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import { LABELS, PLACEHOLDERS } from "@/lib/constants/farms";
import { ResponsivePagination } from "@/components/ui/responsive-pagination";
import type { FarmFormValues } from "@/lib/utils/validation";
import { useProfileQuery } from "@/lib/hooks/query/use-profile-query";
import { useFarmsQuery } from "@/lib/hooks/query/use-farms-query";

export default function FarmsPage() {
  const { showInfo, showSuccess, showError } = useCommonToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { state } = useAuth();
  const userId = state.status === "authenticated" ? state.user.id : undefined;
  const { data: profile } = useProfileQuery(userId);

  const { farms, isLoading, error } = useFarmsQuery(profile?.id, true);

  const {
    createFarmAsync,
    updateFarmAsync,
    deleteFarmAsync,
    isDeleting,
    isCreating,
    isUpdating,
  } = useFarmMutations();

  // 검색 필터링 (메모이제이션 추가)
  const filteredFarms = React.useMemo(
    () =>
      farms.filter(
        (farm: Farm) =>
          farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farm.farm_address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [farms, searchTerm]
  );

  const handleAddClick = () => {
    setEditingFarm(null);
    setSheetOpen(true);
  };

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setSheetOpen(true);
  };

  const handleDelete = (farmId: string) => {
    setFarmToDelete(farmId);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: FarmFormValues) => {
    try {
      if (editingFarm) {
        showInfo("농장 수정 중", "농장 정보를 수정하는 중입니다...");
        const result = await updateFarmAsync({
          ...values,
          id: editingFarm.id,
        });
        showSuccess("농장 수정 완료", result.message);
      } else {
        showInfo("농장 등록 중", "새 농장을 등록하는 중입니다...");
        const result = await createFarmAsync(values);
        showSuccess("농장 등록 완료", result.message);
      }
      setSheetOpen(false);
      setEditingFarm(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      showError(
        editingFarm ? "농장 수정 실패" : "농장 등록 실패",
        errorMessage
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!farmToDelete) return;

    try {
      showInfo("농장 삭제 중", "농장을 삭제하는 중입니다...");
      const result = await deleteFarmAsync(farmToDelete);
      showSuccess("농장 삭제 완료", result.message);
      setDeleteDialogOpen(false);
      setFarmToDelete(null);
    } catch (error) {
      // 404 에러인 경우 (이미 삭제된 경우)
      if (
        error &&
        typeof error === "object" &&
        "error" in error &&
        (error as any).error === "FARM_NOT_FOUND"
      ) {
        showSuccess(
          "농장 삭제 완료",
          (error as any).message || "농장을 찾을 수 없습니다."
        );
        setDeleteDialogOpen(false);
        setFarmToDelete(null);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        showError("농장 삭제 실패", errorMessage);
      }
    }
  };

  const isOwner = React.useCallback(
    (farm: Farm) => {
      if (!profile) return false;
      // 관리자이거나 농장 소유자인 경우
      return profile.account_type === "admin" || farm.owner_id === profile.id;
    },
    [profile]
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <FarmsPageHeader
          sheetOpen={false}
          onSheetOpenChange={() => {}}
          editingFarm={null}
          onSubmit={async () => {}}
          onAddClick={() => {}}
        />
        <StatsSkeleton columns={4} />
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  // 에러 상태는 ErrorBoundary에서 처리

  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <div className="flex-1 space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-3 pb-4 md:pb-6 lg:pb-8">
        <FarmsPageHeader
          sheetOpen={sheetOpen}
          onSheetOpenChange={setSheetOpen}
          editingFarm={editingFarm}
          onSubmit={handleSubmit}
          onAddClick={handleAddClick}
          isLoading={isCreating || isUpdating}
        />

        {/* 검색 기능 */}
        <div className="mb-6">
          <div className="relative flex-1">
            <Input
              id="farm-search"
              placeholder={PLACEHOLDERS.SEARCH}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 sm:h-10 lg:h-11 xl:h-12 w-full text-xs sm:text-sm placeholder:text-sm sm:placeholder:text-base"
            />
          </div>
        </div>

        {filteredFarms.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 text-gray-400">🔍</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {LABELS.NO_SEARCH_RESULTS_TITLE}
            </h3>
            <p className="text-gray-600 mb-4">
              {LABELS.NO_SEARCH_RESULTS_DESCRIPTION.replace(
                "{searchTerm}",
                searchTerm
              )}
            </p>
          </div>
        ) : farms.length === 0 ? (
          <EmptyFarmsState onAddClick={handleAddClick} />
        ) : (
          <ResponsivePagination<Farm> data={filteredFarms} itemsPerPage={12}>
            {({ paginatedData, isLoadingMore, hasMore }) => (
              <div className="space-y-4">
                <FarmsList
                  farms={paginatedData}
                  isOwner={isOwner}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {/* 모바일 무한 스크롤 로딩 상태는 ResponsivePagination에서 처리 */}
              </div>
            )}
          </ResponsivePagination>
        )}

        <DeleteConfirmSheet
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title={LABELS.DELETE_FARM_CONFIRM_TITLE}
          description={LABELS.DELETE_FARM_CONFIRM_DESCRIPTION}
          itemName={
            farmToDelete
              ? farms.find((f) => f.id === farmToDelete)?.farm_name
              : LABELS.FARM_NAME
          }
        />
      </div>
    </ErrorBoundary>
  );
}
