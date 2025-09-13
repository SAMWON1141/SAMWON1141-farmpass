import { CommonListItem } from "../../management/shared/CommonListItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge, UserRole } from "@/components/user/role-badge";
import { QuickActionButtons } from "@/components/user/quick-action-buttons";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import {
  generateInitials,
  getAvatarUrl,
  getAvatarColor,
} from "@/lib/utils/media/avatar";
import type { MemberWithProfile } from "@/lib/types/farm";

interface MemberCardProps {
  member: MemberWithProfile;
  canManageMembers: boolean;
  onDelete: (id: string) => void;
  onRoleChange: (memberId: string, newRole: "manager" | "viewer") => void;
}

export function MemberCard({
  member,
  canManageMembers,
  onDelete,
  onRoleChange,
}: MemberCardProps) {
  return (
    <CommonListItem
      avatar={
        member.profile_image_url ? (
          <ZoomableImage
            src={getAvatarUrl(
              {
                ...member,
                name: member.representative_name,
              },
              { size: 128 }
            )}
            alt={member.representative_name}
            title={`${member.representative_name} 프로필`}
            className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center"
            shape="circle"
            size="md"
          />
        ) : (
          <Avatar className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center">
            <AvatarImage
              src={getAvatarUrl(
                {
                  name: member.representative_name,
                  profile_image_url: member.profile_image_url,
                  avatar_seed: member.avatar_seed,
                },
                { size: 128 }
              )}
              alt={member.representative_name || "User"}
            />
            <AvatarFallback
              className={`${getAvatarColor(
                member.representative_name
              )} text-white`}
            >
              {generateInitials(member.representative_name)}
            </AvatarFallback>
          </Avatar>
        )
      }
      primary={<span>{member.representative_name}</span>}
      secondary={<span>{member.email}</span>}
      badges={
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <RoleBadge role={member.role as UserRole} />
        </div>
      }
      actions={
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <QuickActionButtons
            memberRole={member.role as UserRole}
            memberId={member.id}
            memberName={member.representative_name}
            onDelete={onDelete}
            onRoleChange={onRoleChange}
            canManageMembers={canManageMembers}
          />
        </div>
      }
    />
  );
}
