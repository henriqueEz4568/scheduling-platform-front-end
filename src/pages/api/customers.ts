import { createProxyHandler } from "@/lib/server/proxy-handler";

export default createProxyHandler({
  GET: {
    path: "/customers",
    errorMessage: "Unable to load customers.",
  },
});
