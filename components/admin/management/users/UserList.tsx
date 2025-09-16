import { CommonListItem } from "../shared/CommonListItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils/datetime/date";
import { useState } from "react";
import { UserDetailSheet } from "./UserDetailSheet";
import { CommonListWrapper } from "../shared/CommonListWrapper";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import {
  generateInitials,
  getAvatarUrl,
  getAvatarColor,
} from "@/lib/utils/media/avatar";
import { LABELS } from "@/lib/constants/management";
import { type UserProfileWithFarmMembers } from "@/lib/hooks/query/use-admin-users-query";

interface UserListProps {
  users: UserProfileWithFarmMembers[];
}

export function UserList({ users }: UserListProps) {
  const [selectedUser, setSelectedUser] =
    useState<UserProfileWithFarmMembers | null>(null);

  const getRoleColor = (accountType: string) => {
    switch (accountType) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <>
      <CommonListWrapper>
        {(users || []).map((user) => (
          <CommonListItem
            key={user.id}
            avatar={
              user.profile_image_url ? (
                <ZoomableImage
                  src={getAvatarUrl(user, { size: 128 })}
                  alt={user.name || "User"}
                  title={`${user.name} 프로필`}
                  className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center"
                  shape="circle"
                  size="md"
                />
              ) : (
                <Avatar className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center">
                  <AvatarImage
                    src={getAvatarUrl(user, { size: 128 })}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback
                    className={`${getAvatarColor(user.name)} text-white`}
                  >
                    {generateInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              )
            }
            primary={<span>{user.name}</span>}
            secondary={<span>{user.email}</span>}
            meta={
              <span>
                {user.last_login_at
                  ? `${LABELS.LAST_ACCESS} ${formatDateTime(
                      user.last_login_at
                    )}`
                  : LABELS.NO_LOGIN_RECORD}
              </span>
            }
            badges={
              <div className="flex items-center gap-3 sm:gap-4">
                <Badge
                  className={`${getRoleColor(
                    user.account_type === "admin" ? "admin" : "user"
                  )} text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5`}
                >
                  {user.account_type === "admin"
                    ? LABELS.SYSTEM_ADMIN_USER
                    : LABELS.GENERAL_USER_DETAIL}
                </Badge>
                <Badge
                  className={`${getStatusColor(
                    user.is_active
                  )} text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5`}
                >
                  {user.is_active ? LABELS.ACTIVE_CSV : LABELS.INACTIVE_CSV}
                </Badge>
              </div>
            }
            actions={
              <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                        onClick={() => setSelectedUser(user)}
                        aria-label={`${user.name} 상세보기`}
                      >
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{LABELS.VIEW_DETAILS}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            }
          />
        ))}
        {users.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            {LABELS.NO_USERS}
          </div>
        )}
      </CommonListWrapper>

      <UserDetailSheet
        user={selectedUser}
        open={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}
