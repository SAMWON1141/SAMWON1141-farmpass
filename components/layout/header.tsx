"use client";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RealtimeNotificationBell } from "@/components/common/RealtimeNotificationBell";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { useProfileQuery } from "@/lib/hooks/query/use-profile-query";
import {
  generateInitials,
  getAvatarColor,
  getAvatarUrl,
} from "@/lib/utils/media/avatar";
import { User, LogOut, Lock, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HEADER_MENU, BUTTONS } from "@/lib/constants/common";

export function Header() {
  const { toggleSidebar } = useSidebar();
  const { signOut } = useAuthActions();
  const { userId, isAuthenticated } = useAuth();
  const { data: profile } = useProfileQuery(userId);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between bg-background px-2 sm:px-4">
      {/* 왼쪽: 햄버거 버튼 + 로고 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={toggleSidebar}
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-3 sm:w-4 h-0.5 bg-current rounded-full"></div>
            <div className="w-3 sm:w-4 h-0.5 bg-current rounded-full"></div>
            <div className="w-3 sm:w-4 h-0.5 bg-current rounded-full"></div>
          </div>
          <span className="text-xs sm:text-sm font-medium">
            {HEADER_MENU.MENU}
          </span>
        </Button>
      </div>

      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-2 mr-2 sm:mr-4 min-w-[120px] h-10">
        <ThemeToggle />
        <RealtimeNotificationBell />

        {/* 사용자 프로필 메뉴 */}
        {isAuthenticated && profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-0 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus:border-transparent"
                style={{ outline: "none" }}
                aria-label={BUTTONS.PROFILE_MENU_SCREEN_READER}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={getAvatarUrl(profile, { size: 128 })}
                    alt={profile.name || "User"}
                  />
                  <AvatarFallback
                    className={`${getAvatarColor(
                      profile.name
                    )} text-white text-xs font-medium`}
                  >
                    {generateInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 sm:w-56"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/account?tab=profile"
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{HEADER_MENU.MY_PROFILE}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/account?tab=company"
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{HEADER_MENU.COMPANY_INFO}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/account?tab=security"
                  className="cursor-pointer"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  <span>{HEADER_MENU.PASSWORD_CHANGE}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>
                  {isLoggingOut
                    ? BUTTONS.LAYOUT_LOGOUT_LOADING
                    : BUTTONS.LAYOUT_LOGOUT}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
