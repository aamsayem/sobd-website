import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { upsertCampaign, deleteCampaign } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, Loader2, X, Star } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/campaigns")({
  component: CampaignsPage,
});

type Campaign = {
  id?: string;
  title: string;
  title_bn?: string | null;
  description?: string | null;
  target_amount: number;
  raised_amount: number;
  status: "active" | "completed" | "paused";
  banner_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  featured: boolean;
  sort_order: number;
};

const empty: Campaign = {
  title: "",
  title_bn: "",
  description: "",
  target_amount: 0,
  raised_amount: 0,
  status: "active",
  banner_url: "",
  start_date: null,
  end_date: null,
  featured: false,
  sort_order: 0,
};

function CampaignsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Campaign | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const res = await api.get<any>("content/campaigns/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
      return items as Campaign[];
    },
  });

  const upsertFn = upsertCampaign;
  const delFn = deleteCampaign;

  const save = async (c: Campaign) => {
    try {
      await upsertFn({
        data: {
          ...c,
          target_amount: Number(c.target_amount),
          raised_amount: Number(c.raised_amount),
          sort_order: Number(c.sort_order),
        },
      });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      qc.invalidateQueries({ queryKey: ["public-campaigns"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save campaign"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete campaign"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Urgent Campaigns</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Manage fundraising campaigns shown on the public website.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {data.map((c) => (
            <div
              key={c.id}
              className="glass-strong rounded-2xl overflow-hidden border border-emerald-100"
            >
              {c.banner_url && (
                <img src={c.banner_url} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : c.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {c.status}
                      </span>
                      {c.featured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-emerald-950 truncate">{c.title}</h3>
                    {c.title_bn && (
                      <p className="text-sm font-bn text-emerald-700 truncate">{c.title_bn}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditing(c)}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c.id!)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-emerald-700 mb-1">
                    <span>৳{Number(c.raised_amount).toLocaleString()} raised</span>
                    <span>of ৳{Number(c.target_amount).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-gradient"
                      style={{
                        width: `${Math.min(100, (Number(c.raised_amount) / Math.max(1, Number(c.target_amount))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">
            No campaigns yet. Click "New Campaign" to create your first one.
          </p>
        </div>
      )}

      {editing && <CampaignForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function CampaignForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Campaign;
  onClose: () => void;
  onSave: (c: Campaign) => void;
}) {
  const [c, setC] = useState<Campaign>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setC((s) => ({ ...s, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(c);
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-950">
            {c.id ? "Edit Campaign" : "New Campaign"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Title *">
            <input
              required
              value={c.title}
              onChange={(e) => set("title", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Title (Bangla)">
            <input
              value={c.title_bn ?? ""}
              onChange={(e) => set("title_bn", e.target.value)}
              className="input font-bn"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={c.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Target Amount (৳) *">
              <input
                type="number"
                min={0}
                required
                value={c.target_amount}
                onChange={(e) => set("target_amount", +e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Raised Amount (৳)">
              <input
                type="number"
                min={0}
                value={c.raised_amount}
                onChange={(e) => set("raised_amount", +e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <ImageUploader
            label="Banner Image"
            folder="campaigns"
            aspect="wide"
            value={c.banner_url}
            onChange={(url) => set("banner_url", url)}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                type="date"
                value={c.start_date ?? ""}
                onChange={(e) => set("start_date", e.target.value || null)}
                className="input"
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                value={c.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value || null)}
                className="input"
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={c.status}
                onChange={(e) => set("status", e.target.value as Campaign["status"])}
                className="input"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                value={c.sort_order}
                onChange={(e) => set("sort_order", +e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-emerald-900">
            <input
              type="checkbox"
              checked={c.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4"
            />
            Feature on homepage
          </label>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-emerald-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </div>
      </form>
      <style>{`.input{width:100%;padding:.625rem .875rem;border-radius:.75rem;border:1px solid #d1fae5;background:white;outline:none}.input:focus{box-shadow:0 0 0 2px #10b98140}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
