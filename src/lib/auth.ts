import { api, clearStoredAuthTokens, getStoredAuthToken } from "@/lib/api";

export type CurrentUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  role: string | null;
};

export function setStoredAuthToken(token: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("django_access_token", token);
    if (refreshToken) {
      window.localStorage.setItem("django_refresh_token", refreshToken);
    }
  } catch {
    // ignore
  }
}

export async function login(email: string, password: string) {
  return api.post<{ access: string; refresh: string; user: CurrentUser }>(
    "accounts/login/",
    { email, password },
  );
}

export async function signup(email: string, password: string, fullName: string) {
  return api.post<{ access: string; refresh: string; user: CurrentUser }>(
    "accounts/signup/",
    { email, password, full_name: fullName },
  );
}

export async function logout(accessToken: string | null) {
  if (!accessToken) {
    clearStoredAuthTokens();
    return;
  }

  try {
    await api.post("accounts/logout/", undefined, accessToken);
  } finally {
    clearStoredAuthTokens();
  }
}

export async function getCurrentUser(accessToken: string | null) {
  if (!accessToken) return null;
  return api.get<CurrentUser>("accounts/me/", undefined, accessToken);
}

export { getStoredAuthToken } from "@/lib/api";
