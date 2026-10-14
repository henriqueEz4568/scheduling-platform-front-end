import { createProxyHandler } from "@/lib/server/proxy-handler";

export default createProxyHandler({
  GET: {
    path: "/bookings",
    forwardQuery: true,
    errorMessage: "Unable to load bookings.",
  },
  POST: {
    path: "/bookings",
    errorMessage: "Unable to create schedule.",
  },
});
