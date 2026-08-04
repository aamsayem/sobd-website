export type ApiFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type ApiAuthContext = {
  apiFetch: ApiFetch;
  userId?: string;
  currentUser?: unknown;
};

export function getApiFetch(context: unknown): ApiFetch {
  const ctx = context as { apiFetch?: unknown };
  if (typeof ctx?.apiFetch !== "function") {
    throw new Error("Missing apiFetch in context");
  }
  return ctx.apiFetch as ApiFetch;
}

export function getUserId(context: unknown): string {
  const ctx = context as { userId?: unknown };
  if (typeof ctx?.userId !== "string") {
    throw new Error("Missing userId in context");
  }
  return ctx.userId;
}
