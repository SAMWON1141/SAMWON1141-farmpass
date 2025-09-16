"use client";

import { Button } from "@/components/ui/button";
import { UserMinus, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "./role-badge";
import { BUTTONS } from "@/lib/constants/common";

interface QuickActionButtonsProps {
  memberRole: UserRole;
  memberId: string;
  memberName: string;
  onDelete?: (memberId: string) => void;
  onRoleChange?: (memberId: string, newRole: "manager" | "viewer") => void;
  canManageMembers?: boolean;
}

export function QuickActionButtons({
  memberRole,
  memberId,
  memberName,
  onDelete,
  onRoleChange,
  canManageMembers = false,
}: QuickActionButtonsProps) {
  // 소유자는 삭제/변경 불가
  if (memberRole === "owner") {
    return null;
  }

  // 구성원 관리 권한이 없으면 버튼 표시하지 않음
  if (!canManageMembers) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* 권한 변경 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <Shield className="h-4 w-4" />
            {BUTTONS.QUICK_ACTION_CHANGE_PERMISSION}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onRoleChange?.(memberId, "manager")}
            disabled={memberRole === "manager"}
          >
            {BUTTONS.QUICK_ACTION_CHANGE_TO_MANAGER}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRoleChange?.(memberId, "viewer")}
            disabled={memberRole === "viewer"}
          >
            {BUTTONS.QUICK_ACTION_CHANGE_TO_VIEWER}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 삭제 버튼 */}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete?.(memberId)}
        className="h-8 px-2"
      >
        <UserMinus className="h-4 w-4" />
        {BUTTONS.QUICK_ACTION_DELETE}
      </Button>
    </div>
  );
}
