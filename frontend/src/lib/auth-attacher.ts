import { createMiddleware } from "@tanstack/react-start";
import { getStoredAuthToken } from "@/lib/api";

export const attachAuthToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = getStoredAuthToken();
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
