"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Calendar,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react";

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
import { LanguageSwitcher } from "@/components/language-switcher";
import { useRealtime } from "@/hooks/use-realtime";
import { useTranslation } from "@/i18n/use-translation";
import { handleUnauthorizedRedirect } from "@/lib/client/auth";
import type { AppLayoutProps } from "@/types/layout";
import type { AuthUser } from "@/types/user";

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const { enabled: realtimeEnabled, notifications } = useRealtime();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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

  const displayName = authUser?.name?.trim() || t("layout.defaultUserName");
  const displayEmail = authUser?.email || t("layout.noEmail");
  const avatarFallback = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
              aria-label={t("layout.toggleMenu")}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2"
              aria-label={t("common.appName")}
            >
              <div className="rounded-lg bg-primary p-2">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="hidden text-xl font-bold text-foreground sm:inline">
                {t("common.appName")}
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              className="relative"
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
                  className="relative h-8 w-8 rounded-full"
                  aria-label={t("layout.userMenu")}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt={displayName}
                    />
                    <AvatarFallback>{avatarFallback || "U"}</AvatarFallback>
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
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed z-40 min-h-screen w-64 border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-2 p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                {t("layout.nav.bookings")}
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              {t("layout.nav.customers")}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              {t("layout.nav.services")}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t("layout.nav.reports")}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              {t("layout.nav.settings")}
            </Button>
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** getLayout for pages under /dashboard. */
export function getAppLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
}
