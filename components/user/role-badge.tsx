"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABELS } from "@/lib/constants/common";

export type UserRole = "owner" | "manager" | "viewer";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
}

const roleConfig = {
  owner: {
    label: LABELS.ROLE_BADGE_OWNER_LABEL,
    shortLabel: LABELS.ROLE_BADGE_OWNER_SHORT,
    mobileLabel: LABELS.ROLE_BADGE_OWNER_MOBILE,
    icon: Shield,
    colors: {
      default:
        "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
      outline:
        "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400",
      solid: "bg-purple-600 text-white hover:bg-purple-700",
    },
  },
  manager: {
    label: LABELS.ROLE_BADGE_MANAGER_LABEL,
    shortLabel: LABELS.ROLE_BADGE_MANAGER_SHORT,
    mobileLabel: LABELS.ROLE_BADGE_MANAGER_MOBILE,
    icon: UserCheck,
    colors: {
      default: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      outline:
        "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400",
      solid: "bg-blue-600 text-white hover:bg-blue-700",
    },
  },
  viewer: {
    label: LABELS.ROLE_BADGE_VIEWER_LABEL,
    shortLabel: LABELS.ROLE_BADGE_VIEWER_SHORT,
    mobileLabel: LABELS.ROLE_BADGE_VIEWER_MOBILE,
    icon: Eye,
    colors: {
      default:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      outline:
        "border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400",
      solid: "bg-green-600 text-white hover:bg-green-700",
    },
  },
};

export function RoleBadge({
  role,
  size = "md",
  variant = "default",
  className,
}: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border transition-colors",
        config.colors[variant],
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span className="inline">
        {size === "sm" ? config.shortLabel : config.label}
      </span>
    </Badge>
  );
}

// 권한 선택용 드롭다운에서 사용할 옵션 컴포넌트
interface RoleOptionProps {
  role: UserRole;
  selected?: boolean;
  onClick?: () => void;
}

export function RoleOption({ role, selected, onClick }: RoleOptionProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors",
        selected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={onClick}
    >
      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="font-medium text-xs sm:text-sm">{config.label}</span>
    </div>
  );
}

// 권한 정보를 가져오는 유틸리티 함수
export function getRoleInfo(role: UserRole) {
  return roleConfig[role];
}

// 권한 레벨을 숫자로 반환 (높을수록 더 높은 권한)
export function getRoleLevel(role: UserRole): number {
  const levels = {
    viewer: 1,
    manager: 2,
    owner: 3,
  };
  return levels[role];
}

// 권한 비교 함수
export function canManageRole(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
}
