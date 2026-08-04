import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin.functions";
import { getSubmissionCounts } from "@/lib/submissions.functions";
import {
  Megaphone,
  Users,
  DollarSign,
  UserCog,
  Activity,
  Loader2,
  UserCheck,
  HeartHandshake,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = getDashboardStats;
  const countsFn = getSubmissionCounts;
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });
  const { data: counts } = useQuery({ queryKey: ["submission-counts"], queryFn: () => countsFn() });

  const cards = [
    {
      label: "Pending Volunteers",
      value: counts?.pendingVolunteers ?? 0,
      icon: UserCheck,
      color: "from-amber-500 to-orange-400",
    },
    {
      label: "Pending Shokkhom",
      value: counts?.pendingSokkhom ?? 0,
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-400",
    },
    {
      label: "Pending Donations",
      value: counts?.pendingDonations ?? 0,
      icon: DollarSign,
      color: "from-yellow-500 to-amber-400",
    },
    {
      label: "Unread Messages",
      value: counts?.unreadMessages ?? 0,
      icon: Mail,
      color: "from-sky-500 to-cyan-400",
    },
    {
      label: "Total Campaigns",
      value: data?.totalCampaigns ?? 0,
      icon: Megaphone,
      color: "from-emerald-500 to-green-400",
    },
    {
      label: "Active Campaigns",
      value: data?.activeCampaigns ?? 0,
      icon: Activity,
      color: "from-lime-500 to-green-400",
    },
    {
      label: "Total Raised (৳)",
      value: (data?.totalRaised ?? 0).toLocaleString(),
      icon: DollarSign,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Committee Members",
      value: data?.totalMembers ?? 0,
      icon: Users,
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Registered Users",
      value: data?.totalUsers ?? 0,
      icon: UserCog,
      color: "from-indigo-500 to-purple-400",
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-950">Dashboard</h1>
        <p className="text-sm text-emerald-700 mt-1">
          Welcome back. Here's a snapshot of your organization.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div
              key={c.label}
              className="glass-strong rounded-2xl p-6 border border-emerald-100 hover:shadow-glow transition-shadow"
            >
              <div
                className={`inline-flex h-12 w-12 rounded-xl bg-gradient-to-br ${c.color} text-white items-center justify-center mb-4 shadow-md`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold text-emerald-950">{c.value}</div>
              <div className="text-sm text-emerald-700 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10 glass-strong rounded-2xl p-6 border border-emerald-100">
        <h2 className="font-bold text-lg text-emerald-950 mb-2">Quick Tips</h2>
        <ul className="text-sm text-emerald-800 space-y-1.5 list-disc list-inside">
          <li>
            Use <strong>Urgent Campaigns</strong> to publish fundraising drives that show on the
            homepage.
          </li>
          <li>
            Use <strong>Committee Members</strong> to update the Executive Committee page in
            real-time.
          </li>
          <li>
            Photos can be hosted anywhere (Facebook CDN, Imgur, etc.) — paste the direct image URL.
          </li>
        </ul>
      </section>
    </div>
  );
}
