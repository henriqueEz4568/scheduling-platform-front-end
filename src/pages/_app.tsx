import "@/styles/globals.css";
import { useEffect, type ReactElement } from "react";
import {
  getUnauthorizedEventName,
  handleUnauthorizedRedirect,
} from "@/lib/client/auth";
import type { AppPropsWithLayout } from "@/types/layout";

const withoutLayout = (page: ReactElement) => page;

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useEffect(() => {
    const eventName = getUnauthorizedEventName();
    const onUnauthorized = () => {
      handleUnauthorizedRedirect("/");
    };

    window.addEventListener(eventName, onUnauthorized);

    return () => {
      window.removeEventListener(eventName, onUnauthorized);
    };
  }, []);

  // Pages opt into a layout (dashboard pages use AppLayout); "/" and
  // "/register" render on their own.
  const getLayout = Component.getLayout ?? withoutLayout;

  return getLayout(<Component {...pageProps} />);
}
