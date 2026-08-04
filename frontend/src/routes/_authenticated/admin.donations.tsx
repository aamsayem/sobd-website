import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { updateSubmissionStatus, deleteSubmission } from "@/lib/submissions.functions";
import { Search, CheckCircle2, XCircle, Trash2, Loader2, X, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/donations")({
  component: DonationsPage,
});

type Donation = {
  id: string | number;
  donor_name: string;
  phone: string;
  email: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string;
  proof_screenshot: number | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

const STATUSES = ["all", "pending", "confirmed", "rejected"] as const;

function DonationsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Donation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      return await api.get<Donation[]>("submissions/donation-requests/");
    },
  });

  useEffect(() => {
    // realtime not yet migrated; rely on polling/invalidations from serverFns
    return () => {};
  }, [qc]);

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((d) => status === "all" || d.verification_status === status);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((d) =>
      [d.donor_name, d.phone, d.transaction_id, d.payment_method, d.email ?? ""].some(
        (v) => v && v.toString().toLowerCase().includes(s),
      ),
    );
  }, [data, status, q]);

  const totalConfirmed = (data ?? [])
    .filter((d) => d.verification_status === "confirmed")
    .reduce((a, d) => a + Number(d.amount || 0), 0);
  const totalPending = (data ?? [])
    .filter((d) => d.verification_status === "pending")
    .reduce((a, d) => a + Number(d.amount || 0), 0);

  const updFn = updateSubmissionStatus;
  const delFn = deleteSubmission;

  const setSt = async (d: Donation, s: string) => {
    try {
      await updFn({ data: { table: "donation_requests", id: d.id, status: s } });
      toast.success(`Marked ${s}`);
      qc.invalidateQueries({ queryKey: ["admin-donations"] });
      qc.invalidateQueries({ queryKey: ["submission-counts"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update donation"));
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this donation record?")) return;
    try {
      await delFn({ data: { table: "donation_requests", id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-donations"] });
      qc.invalidateQueries({ queryKey: ["submission-counts"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete donation"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-950">Donations</h1>
        <p className="text-sm text-emerald-700 mt-1">
          Verify transactions submitted through the donation form.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="glass-strong rounded-2xl p-5 border border-emerald-100">
          <div className="text-xs uppercase tracking-wider text-emerald-700">Confirmed total</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">
            ৳ {totalConfirmed.toLocaleString()}
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-5 border border-amber-100">
          <div className="text-xs uppercase tracking-wider text-amber-700">
            Pending verification
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            ৳ {totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-55">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by donor, phone, TRX, code…"
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
              {s}
              {s !== "all" && data
                ? ` (${data.filter((d) => d.verification_status === s).length})`
                : ""}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <p className="text-sm text-emerald-700">No donations yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto glass-strong rounded-2xl border border-emerald-100">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50/50 text-xs uppercase tracking-wider text-emerald-900">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Donor</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">TRX</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-emerald-100 hover:bg-emerald-50/30">
                  <td className="px-4 py-3 font-mono text-xs">{String(d.id).slice(0, 8)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-950">
                    {d.donor_name}
                    <div className="text-xs text-emerald-700 font-normal">{d.phone}</div>
                  </td>
                  <td className="px-4 py-3">{d.payment_method}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.transaction_id}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-800">
                    ৳ {Number(d.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.verification_status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-700">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconBtn onClick={() => setView(d)} title="View">
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      {d.verification_status !== "confirmed" && (
                        <IconBtn onClick={() => setSt(d, "confirmed")} title="Confirm" tone="green">
                          <CheckCircle2 className="h-4 w-4" />
                        </IconBtn>
                      )}
                      {d.verification_status !== "rejected" && (
                        <IconBtn onClick={() => setSt(d, "rejected")} title="Reject" tone="red">
                          <XCircle className="h-4 w-4" />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => remove(String(d.id))} title="Delete" tone="red">
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

      {view && (
        <div
          onClick={() => setView(null)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-emerald-950">Donation {String(view.id).slice(0, 8)}</h3>
              <button
                onClick={() => setView(null)}
                className="p-1.5 rounded-lg hover:bg-emerald-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Donor", view.donor_name],
                ["Phone", view.phone],
                ["Email", view.email],
                ["Amount", `৳ ${Number(view.amount).toLocaleString()}`],
                ["Method", view.payment_method],
                ["Transaction ID", view.transaction_id],
                ["Status", view.verification_status],
                ["Submitted", new Date(view.created_at).toLocaleString()],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="grid grid-cols-3 gap-3 border-b border-emerald-50 pb-2"
                >
                  <div className="text-emerald-700 font-medium">{k}</div>
                  <div className="col-span-2 text-emerald-950 wrap-break-word">{v || "—"}</div>
                </div>
              ))}
              {view.proof_screenshot ? <ScreenshotPreview proof={view.proof_screenshot} /> : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScreenshotPreview({ proof }: { proof: any }) {
  const url = typeof proof === "string" ? proof : (proof?.url ?? "");
  if (!url) return null;
  return (
    <div className="space-y-2">
      <img
        src={url}
        alt="Donation screenshot"
        className="rounded-xl border border-emerald-100 max-h-80 w-full object-contain bg-white"
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
      >
        Open in new tab
      </a>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${c[status] || "bg-gray-100"}`}
    >
      {status}
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
