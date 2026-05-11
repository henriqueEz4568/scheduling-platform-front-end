import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/app-layout";
import {
  getUnauthorizedEventName,
  handleUnauthorizedRedirect,
} from "@/lib/client/auth";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const shouldShowLayout = router.pathname !== "/";

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

  if (!shouldShowLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}
