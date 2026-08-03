import axios from "axios";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ApiErrorDetails {
  status: number;
  message: string;
  payload?: unknown;
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "ApiError";
    this.status = details.status;
    this.payload = details.payload;
  }
}

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: ApiMethod;
  body?: JsonValue | FormData;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  authToken?: string;
  credentials?: RequestCredentials;
}

const DEFAULT_API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL ?? "/api/v1";

const axiosClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

function normalizePath(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return path.replace(/^\/+/, "");
}

function getDefaultHeaders(body?: JsonValue | FormData) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("django_access_token");
  } catch {
    return null;
  }
}

export function clearStoredAuthTokens() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("django_access_token");
    window.localStorage.removeItem("django_refresh_token");
  } catch {
    // ignore
  }
}

function isApiErrorPayload(value: unknown): value is { detail: string } {
  if (typeof value !== "object" || value === null) return false;
  const detail = (value as { detail?: unknown }).detail;
  return typeof detail === "string";
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}) {
  const method = options.method ?? "GET";
  const authToken = options.authToken ?? getStoredAuthToken();
  const headers = {
    ...getDefaultHeaders(options.body),
    ...options.headers,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  try {
    const response = await axiosClient.request<T>({
      url: normalizePath(path),
      method,
      headers,
      params: options.query,
      data: options.body,
      withCredentials: options.credentials === "include",
    });
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data;
      const message = isApiErrorPayload(payload)
        ? payload.detail
        : error.message || "Request failed";

      if (status === 401) {
        clearStoredAuthTokens();
      }

      throw new ApiError({ status, message, payload });
    }

    throw error;
  }
}

export type ApiClient = {
  get: <T = unknown>(path: string, query?: ApiRequestOptions["query"], authToken?: string) => Promise<T>;
  post: <T = unknown>(path: string, body?: JsonValue | FormData, authToken?: string) => Promise<T>;
  put: <T = unknown>(path: string, body?: JsonValue | FormData, authToken?: string) => Promise<T>;
  patch: <T = unknown>(path: string, body?: JsonValue | FormData, authToken?: string) => Promise<T>;
  delete: <T = unknown>(path: string, body?: JsonValue, authToken?: string) => Promise<T>;
  withAuthToken: (authToken: string) => ApiClient;
};

export const api: ApiClient = {
  get: <T>(path: string, query?: ApiRequestOptions["query"], authToken?: string) =>
    apiFetch<T>(path, { method: "GET", query, authToken }),
  post: <T>(path: string, body?: JsonValue | FormData, authToken?: string) =>
    apiFetch<T>(path, { method: "POST", body, authToken }),
  put: <T>(path: string, body?: JsonValue | FormData, authToken?: string) =>
    apiFetch<T>(path, { method: "PUT", body, authToken }),
  patch: <T>(path: string, body?: JsonValue | FormData, authToken?: string) =>
    apiFetch<T>(path, { method: "PATCH", body, authToken }),
  delete: <T>(path: string, body?: JsonValue, authToken?: string) =>
    apiFetch<T>(path, { method: "DELETE", body, authToken }),
  withAuthToken(authToken: string) {
    return {
      get: <T>(path: string, query?: ApiRequestOptions["query"]) =>
        apiFetch<T>(path, { method: "GET", query, authToken }),
      post: <T>(path: string, body?: JsonValue | FormData) =>
        apiFetch<T>(path, { method: "POST", body, authToken }),
      put: <T>(path: string, body?: JsonValue | FormData) =>
        apiFetch<T>(path, { method: "PUT", body, authToken }),
      patch: <T>(path: string, body?: JsonValue | FormData) =>
        apiFetch<T>(path, { method: "PATCH", body, authToken }),
      delete: <T>(path: string, body?: JsonValue) =>
        apiFetch<T>(path, { method: "DELETE", body, authToken }),
      withAuthToken: (nextToken: string) => api.withAuthToken(nextToken),
    };
  },
};

export function buildApiPath(resource: string, id?: string | number) {
  const normalizedResource = resource.replace(/^\/+|\/+$/g, "");
  return id !== undefined ? `${normalizedResource}/${id}/` : `${normalizedResource}/`;
}
