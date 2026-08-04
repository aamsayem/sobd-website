import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getApiBaseUrl } from "@/lib/api-base-url";

export const requireApiAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  if (!request?.headers) {
    throw new Error("Unauthorized: No request headers available");
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Unauthorized: No authorization header provided");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Only Bearer tokens are supported");
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  // Use the backend API base URL (not the frontend's origin)
  const apiBase = `${getApiBaseUrl().replace(/\/+$/, "")}/api/v1`;
  const validateUrl = `${apiBase}/accounts/me/`;

  const response = await fetch(validateUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized: Invalid token");
  }

  const user = await response.json();
  if (!user?.id) {
    throw new Error("Unauthorized: Invalid user payload");
  }

  const apiFetch = async (input: string, init: RequestInit = {}) => {
    const url = /^https?:\/\//i.test(input)
      ? input
      : new URL(input.replace(/^\/+/, ""), `${apiBase}/`).toString();
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    return fetch(url, { ...init, headers });
  };

  return next({
    context: {
      apiFetch,
      userId: user.id,
      currentUser: user,
    },
  });
});

export default requireApiAuth;
