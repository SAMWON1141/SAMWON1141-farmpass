import { FarmCard } from "./FarmCard";
import { useFarmMembersPreviewQuery } from "@/lib/hooks/query/use-farm-members-query";
import type { Farm } from "@/lib/types/farm";

interface FarmsListProps {
  farms: Farm[];
  isOwner: (farm: Farm) => boolean;
  onEdit: (farm: Farm) => void;
  onDelete: (farmId: string) => void;
}

export function FarmsList({
  farms,
  isOwner,
  onEdit,
  onDelete,
}: FarmsListProps) {
  // 모든 농장의 멤버를 한 번에 조회 (API 호출 최적화)
  const farmIds = farms.map((farm) => farm.id);
  const { farmMembers } = useFarmMembersPreviewQuery(farmIds);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(farms || []).map((farm, index) => (
        <FarmCard
          key={farm.id}
          farm={farm}
          index={index}
          isOwner={isOwner(farm)}
          onEdit={onEdit}
          onDelete={onDelete}
          membersData={farmMembers?.[farm.id]}
        />
      ))}
    </div>
  );
}
