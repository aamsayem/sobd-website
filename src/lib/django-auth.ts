export type DjangoFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type DjangoAuthContext = {
  djangoFetch: DjangoFetch;
  userId?: string;
  currentUser?: unknown;
};

export function getDjangoFetch(context: unknown): DjangoFetch {
  const ctx = context as { djangoFetch?: unknown };
  if (typeof ctx?.djangoFetch !== "function") {
    throw new Error("Missing djangoFetch in context");
  }
  return ctx.djangoFetch as DjangoFetch;
}

export function getUserId(context: unknown): string {
  const ctx = context as { userId?: unknown };
  if (typeof ctx?.userId !== "string") {
    throw new Error("Missing userId in context");
  }
  return ctx.userId;
}
