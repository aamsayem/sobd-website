import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStoredAuthToken, getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const token = getStoredAuthToken();
    if (!token) throw redirect({ to: "/auth" });

    try {
      const user = await getCurrentUser(token);
      if (!user) throw new Error("Unauthorized");
      return { user };
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
