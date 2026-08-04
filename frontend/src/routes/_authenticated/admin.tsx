import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyRoles } from "@/lib/admin.functions";
import { getSubmissionCounts } from "@/lib/submissions.functions";
import { logout as djangoLogout, getStoredAuthToken } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  LogOut,
  Loader2,
  Shield,
  Menu,
  X,
  Image,
  Newspaper,
  FileText,
  UserCheck,
  HeartHandshake,
  DollarSign,
  Mail,
  Trophy,
  HardDrive,
} from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — SELFLESS ORGANIZATION BD" }] }),
  component: AdminLayout,
});

const NAV: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badgeKey?: "pendingVolunteers" | "pendingSokkhom" | "pendingDonations" | "unreadMessages";
}[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/admin/volunteers",
    label: "Volunteer Applications",
    icon: UserCheck,
    badgeKey: "pendingVolunteers",
  },
  {
    to: "/admin/sokkhom",
    label: "Shokkhom Foundation",
    icon: HeartHandshake,
    badgeKey: "pendingSokkhom",
  },
  { to: "/admin/donations", label: "Donations", icon: DollarSign, badgeKey: "pendingDonations" },
  { to: "/admin/messages", label: "Contact Messages", icon: Mail, badgeKey: "unreadMessages" },
  { to: "/admin/campaigns", label: "Urgent Campaigns", icon: Megaphone },
  { to: "/admin/committee", label: "Committee Members", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/news", label: "News & Blog", icon: Newspaper },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/achievements", label: "Achievements", icon: Trophy },
  { to: "/admin/media", label: "Media Library", icon: HardDrive },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const fn = getMyRoles;
  const countsFn = getSubmissionCounts;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["my-roles"], queryFn: () => fn() });
  const { data: counts } = useQuery({
    queryKey: ["submission-counts"],
    queryFn: () => countsFn(),
    refetchInterval: 60_000,
  });

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    // Realtime updates not migrated yet; rely on periodic refetch.
    return () => {};
  }, [qc]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const roles = data?.roles ?? [];
  const isAdmin = roles.includes("super_admin") || roles.includes("admin");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl p-10 max-w-md text-center">
          <Shield className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access denied</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Signed in as <strong>{data?.profile?.email}</strong>, but this account doesn't have
            admin privileges.
          </p>
          <button
            onClick={async () => {
              await djangoLogout(getStoredAuthToken());
              navigate({ to: "/auth" });
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const logout = async () => {
    await djangoLogout(getStoredAuthToken());
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex bg-emerald-50/40 -mt-24 pt-24">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-24 inset-x-0 z-30 bg-white border-b border-emerald-100 px-4 py-2 flex items-center justify-between">
        <span className="font-bold text-emerald-900">Admin</span>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg bg-emerald-50">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 lg:top-24 h-screen lg:h-[calc(100vh-6rem)] w-72 bg-white border-r border-emerald-100 z-40 transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-5 border-b border-emerald-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} className="h-9 w-9 object-contain" alt="" />
            <div>
              <div className="font-bold text-sm text-emerald-900">SOBD Admin</div>
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider">
                {roles[0]?.replace("_", " ")}
              </div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {NAV.map((item) => {
            const badge = item.badgeKey ? (counts?.[item.badgeKey] ?? 0) : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-emerald-100 text-emerald-900" }}
                activeOptions={{ exact: item.exact }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-800 hover:bg-emerald-50 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-emerald-100 bg-white">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-muted-foreground truncate">{data?.profile?.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/40" />
      )}

      <main className="flex-1 min-w-0 pt-12 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
