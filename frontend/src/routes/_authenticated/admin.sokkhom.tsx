import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { updateSubmissionStatus, deleteSubmission } from "@/lib/submissions.functions";
import { Search, CheckCircle2, XCircle, Trash2, Loader2, X, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/sokkhom")({
  component: SokkhomPage,
});

type App = {
  id: string;
  application_code: string;
  full_name: string;
  phone: string;
  address: string | null;
  occupation: string | null;
  monthly_income: number | null;
  family_condition: string | null;
  support_needed: string | null;
  status: string;
  created_at: string;
  [k: string]: string | number | boolean | null | undefined;
};

const STATUSES = ["all", "pending", "under_review", "approved", "rejected", "completed"] as const;

function SokkhomPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<App | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sokkhom"],
    queryFn: async () => {
      const res = await api.get<any>("submissions/sokkhom-applications/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
      return items as App[];
    },
  });

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((a) => status === "all" || a.status === status);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((a) =>
      [a.full_name, a.phone, a.address, a.application_code].some(
        (v) => v && v.toString().toLowerCase().includes(s),
      ),
    );
  }, [data, status, q]);

  const updFn = updateSubmissionStatus;
  const delFn = deleteSubmission;

  const setSt = async (a: App, s: string) => {
    try {
      await updFn({ data: { table: "sokkhom_applications", id: a.id, status: s } });
      toast.success(`Marked ${s.replace("_", " ")}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update application status"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      await delFn({ data: { table: "sokkhom_applications", id } });
      toast.success("Deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete application"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-950">Shokkhom Foundation Applications</h1>
        <p className="text-sm text-emerald-700 mt-1">Support requests from families in need.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone, address, code…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${status === s ? "bg-emerald-600 text-white" : "bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}
            >
              {s.replace("_", " ")}
              {s !== "all" && data ? ` (${data.filter((a) => a.status === s).length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-sm text-emerald-700">No applications yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto glass-strong rounded-2xl border border-emerald-100">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50/50 text-xs uppercase tracking-wider text-emerald-900">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Income (৳)</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-emerald-100 hover:bg-emerald-50/30">
                  <td className="px-4 py-3 font-mono text-xs">{a.application_code}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-950">{a.full_name}</td>
                  <td className="px-4 py-3">{a.phone}</td>
                  <td className="px-4 py-3">
                    {a.monthly_income ? Number(a.monthly_income).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-700">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconBtn onClick={() => setView(a)} title="View">
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      {a.status === "pending" && (
                        <IconBtn onClick={() => setSt(a, "under_review")} title="Under review">
                          <Clock className="h-4 w-4" />
                        </IconBtn>
                      )}
                      {a.status !== "approved" && (
                        <IconBtn onClick={() => setSt(a, "approved")} title="Approve" tone="green">
                          <CheckCircle2 className="h-4 w-4" />
                        </IconBtn>
                      )}
                      {a.status !== "rejected" && (
                        <IconBtn onClick={() => setSt(a, "rejected")} title="Reject" tone="red">
                          <XCircle className="h-4 w-4" />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => remove(a.id)} title="Delete" tone="red">
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view && <DetailModal app={view} onClose={() => setView(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    under_review: "bg-blue-100 text-blue-800",
    completed: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${c[status] || "bg-gray-100"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
function IconBtn({
  children,
  onClick,
  title,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  tone?: "red" | "green";
}) {
  const c =
    tone === "red"
      ? "hover:bg-red-50 text-red-600"
      : tone === "green"
        ? "hover:bg-emerald-50 text-emerald-600"
        : "hover:bg-emerald-50 text-emerald-700";
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-colors ${c}`}>
      {children}
    </button>
  );
}

function DetailModal({ app, onClose }: { app: App; onClose: () => void }) {
  const fields: [string, string | number | null | undefined][] = [
    ["Application code", app.application_code],
    ["Status", app.status],
    ["Full name", app.full_name],
    ["Phone", app.phone],
    ["Address", app.address],
    ["Occupation", app.occupation],
    ["Monthly income", app.monthly_income],
    ["Family condition", app.family_condition],
    ["Support needed", app.support_needed],
    ["Submitted", new Date(app.created_at).toLocaleString()],
  ];
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-emerald-950">Shokkhom Foundation Application</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {fields.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-3 text-sm border-b border-emerald-50 pb-2">
              <div className="text-emerald-700 font-medium">{k}</div>
              <div className="col-span-2 text-emerald-950 break-words whitespace-pre-wrap">
                {v || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
