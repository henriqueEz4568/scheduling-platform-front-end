import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Calendar, LogOut, Settings, User } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useRealtime } from "@/hooks/use-realtime";
import { useTranslation } from "@/i18n/use-translation";
import { handleUnauthorizedRedirect } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/user";

const headerButtonClass =
  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

/** Top bar of the dashboard, in the same color as the sidebar. */
export function AppHeader() {
  const { t } = useTranslation();
  const { isMobile, open, openMobile } = useSidebar();
  const { enabled: realtimeEnabled, notifications } = useRealtime();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const persistedUser = localStorage.getItem("auth_user");
    if (!persistedUser) {
      setAuthUser(null);
      return;
    }

    try {
      setAuthUser(JSON.parse(persistedUser) as AuthUser);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const sidebarExpanded = isMobile ? openMobile : open;
  const displayName = authUser?.name?.trim() || t("layout.defaultUserName");
  const displayEmail = authUser?.email || t("layout.noEmail");
  const avatarFallback = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full items-center justify-between border-b border-sidebar-border bg-sidebar pr-4 pl-2 text-sidebar-foreground">
      <div className="flex items-center gap-3">
        {/* pl-2 + size-8 match the sidebar items, so this icon lines up with theirs. */}
        <SidebarTrigger
          className={cn("size-8", headerButtonClass)}
          aria-expanded={sidebarExpanded}
          aria-label={
            sidebarExpanded ? t("layout.closeMenu") : t("layout.openMenu")
          }
        />

        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label={t("common.appName")}
        >
          <div className="rounded-lg bg-sidebar-primary p-2">
            <Calendar className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold text-sidebar-foreground sm:inline">
            {t("common.appName")}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher variant="sidebar" />
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", headerButtonClass)}
          aria-label={t("layout.notifications")}
        >
          <Bell className="h-5 w-5" />
          {realtimeEnabled ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {notifications.length}
            </span>
          ) : null}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("relative h-8 w-8 rounded-full", headerButtonClass)}
              aria-label={t("layout.userMenu")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt={displayName}
                />
                <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                  {avatarFallback || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{t("layout.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("layout.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUnauthorizedRedirect("/")}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("layout.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
