import { MemberCard } from "./MemberCard";
import { LABELS } from "@/lib/constants/farms";
import type { MemberWithProfile } from "@/lib/types/farm";
import { CommonListWrapper } from "../../management/shared/CommonListWrapper";

interface MembersListProps {
  members: MemberWithProfile[];
  canManageMembers: boolean;
  onDelete: (id: string) => void;
  onRoleChange: (memberId: string, newRole: "manager" | "viewer") => void;
}

export function MembersList({
  members,
  canManageMembers,
  onDelete,
  onRoleChange,
}: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {LABELS.NO_REGISTERED_MEMBERS}
          </h3>
          {canManageMembers && (
            <p className="text-sm sm:text-base text-gray-500">
              {LABELS.NO_MEMBERS_DESCRIPTION}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <CommonListWrapper>
      {(members || []).map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          canManageMembers={canManageMembers}
          onDelete={onDelete}
          onRoleChange={onRoleChange}
        />
      ))}
    </CommonListWrapper>
  );
}
