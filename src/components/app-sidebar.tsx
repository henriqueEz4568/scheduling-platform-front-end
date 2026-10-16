import Link from "next/link";
import { useRouter } from "next/router";
import { Calendar, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/i18n/use-translation";
import { cn } from "@/lib/utils";
import type { AppNavItem, MobileRailProps } from "@/types/layout";

// The current page uses the brand color instead of the library's accent.
const activeItemClass =
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground";

function useNavItems(): AppNavItem[] {
  const { t } = useTranslation();

  return [
    { href: "/dashboard", label: t("common.dashboard"), icon: LayoutDashboard },
    {
      href: "/dashboard/bookings",
      label: t("layout.nav.bookings"),
      icon: Calendar,
    },
  ];
}

/**
 * Below md the library sidebar turns into a drawer that disappears when
 * closed; this rail keeps the icons on screen there.
 */
function MobileRail({ items }: MobileRailProps) {
  const { pathname } = useRouter();

  return (
    <nav className="sticky top-(--header-height) z-10 flex h-[calc(100svh-var(--header-height))] w-12 shrink-0 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-3 text-sidebar-foreground md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            )}
          >
            <Icon className="size-4" />
          </Link>
        );
      })}
    </nav>
  );
}

/** Dashboard navigation built on the shadcn/ui Sidebar. */
export function AppSidebar() {
  const { pathname } = useRouter();
  const { setOpenMobile } = useSidebar();
  const items = useNavItems();

  return (
    <>
      <MobileRail items={items} />
      <Sidebar
        collapsible="icon"
        // Starts below the header instead of covering the whole height.
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={label}
                        className={activeItemClass}
                      >
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
