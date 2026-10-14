import { createProxyHandler } from "@/lib/server/proxy-handler";

export default createProxyHandler({
  GET: {
    path: "/services",
    errorMessage: "Unable to load services.",
  },
  POST: {
    path: "/services",
    errorMessage: "Unable to create service.",
  },
});
