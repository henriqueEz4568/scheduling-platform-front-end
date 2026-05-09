import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import {
  getUnauthorizedEventName,
  handleUnauthorizedRedirect,
} from "@/lib/client/auth";

export default function App({ Component, pageProps }: AppProps) {
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

  return <Component {...pageProps} />;
}
