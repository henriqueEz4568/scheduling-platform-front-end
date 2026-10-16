import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { LucideIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type AppLayoutProps = {
  children: ReactNode;
};

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type MobileRailProps = {
  items: AppNavItem[];
};
