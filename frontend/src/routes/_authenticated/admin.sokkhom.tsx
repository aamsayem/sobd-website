import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { updateSubmissionStatus, deleteSubmission } from "@/lib/submissions.functions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Search, CheckCircle2, XCircle, Trash2, Loader2, X, Eye, Clock, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/sokkhom")({
  component: SokkhomPage,
});

type App = {
  id: string;
  application_code: string;
  applicant_name: string;
  father_name: string | null;
  mother_name: string | null;
  occupation: string | null;
  income: number | null;
  family_information: string | null;
  reason: string | null;
  status: string;
  created_at: string;
  [k: string]: string | number | boolean | null | undefined;
};

const STATUSES = ["all", "pending", "under_review", "approved", "rejected", "completed"] as const;

type Story = {
  id?: string;
  name: string;
  title?: string | null;
  description?: string | null;
  before?: string | null;
  after?: string | null;
  image_url?: string | null;
  image?: any | null;
  display_order: number;
  is_active: boolean;
};

const emptyStory: Story = {
  name: "",
  title: "",
  description: "",
  before: "",
  after: "",
  image_url: "",
  image: null,
  display_order: 0,
  is_active: true,
};

function SokkhomPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "stories">("applications");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<App | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

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

  const { data: storiesData, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: async () => {
      const res = await api.get<any>("content/stories/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0));
      return items as Story[];
    },
  });

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((a) => status === "all" || a.status === status);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((a) =>
      [a.applicant_name, a.occupation, a.application_code].some(
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
      qc.invalidateQueries({ queryKey: ["admin-sokkhom"] });
      qc.invalidateQueries({ queryKey: ["submission-counts"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update application status"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      await delFn({ data: { table: "sokkhom_applications", id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-sokkhom"] });
      qc.invalidateQueries({ queryKey: ["submission-counts"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete application"));
    }
  };

  const saveStory = async (s: Story) => {
    try {
      const payload = {
        ...s,
        display_order: Number(s.display_order),
      };
      if (s.id) {
        await api.patch(`content/stories/${s.id}/`, payload);
      } else {
        await api.post("content/stories/", payload);
      }
      toast.success("Saved successfully");
      setEditingStory(null);
      qc.invalidateQueries({ queryKey: ["admin-stories"] });
      qc.invalidateQueries({ queryKey: ["public-stories"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save story"));
    }
  };

  const removeStory = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    try {
      await api.delete(`content/stories/${id}/`);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-stories"] });
      qc.invalidateQueries({ queryKey: ["public-stories"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete story"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-950">Shokkhom Foundation</h1>
        <p className="text-sm text-emerald-700 mt-1">Manage livelihood requests and success stories.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-emerald-100 mb-6">
        <button
          onClick={() => setTab("applications")}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            tab === "applications" ? "text-emerald-950" : "text-emerald-600/70 hover:text-emerald-600"
          }`}
        >
          Livelihood Applications
          {tab === "applications" && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("stories")}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            tab === "stories" ? "text-emerald-950" : "text-emerald-600/70 hover:text-emerald-600"
          }`}
        >
          Success Stories
          {tab === "stories" && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {tab === "applications" ? (
        <>
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
                    <th className="text-left px-4 py-3">Occupation</th>
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
                      <td className="px-4 py-3 font-semibold text-emerald-950">{a.applicant_name}</td>
                      <td className="px-4 py-3">{a.occupation}</td>
                      <td className="px-4 py-3">
                        {a.income ? Number(a.income).toLocaleString() : "—"}
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
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-emerald-900">Success Stories</h2>
            <button
              onClick={() => setEditingStory(emptyStory)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Story
            </button>
          </div>

          {isStoriesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : !storiesData || storiesData.length === 0 ? (
            <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
              <p className="text-sm text-emerald-700">No stories created yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storiesData.map((s) => {
                const imgPath = s.image_url || (s.image?.file_path || s.image?.url);
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-emerald-50 relative">
                      {imgPath ? (
                        <img src={imgPath} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-300 font-bold text-lg">
                          No Photo
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-emerald-800/90 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        Order: {s.display_order}
                      </div>
                      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white ${s.is_active ? "bg-emerald-600" : "bg-zinc-500"}`}>
                        {s.is_active ? "Published" : "Draft"}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-emerald-950">{s.name}</h3>
                        {s.title && <p className="text-xs font-medium text-emerald-700 mt-0.5">{s.title}</p>}
                        {s.before && (
                          <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                            <strong>Before:</strong> {s.before}
                          </p>
                        )}
                        {s.after && (
                          <p className="text-xs text-emerald-800 font-medium mt-1 line-clamp-2">
                            <strong>After:</strong> {s.after}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-emerald-50">
                        <button
                          onClick={() => setEditingStory(s)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-950 font-semibold rounded-xl text-xs transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => removeStory(s.id!)}
                          className="flex items-center justify-center p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-900 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view && <DetailModal app={view} onClose={() => setView(null)} />}
      {editingStory && (
        <StoryEditModal
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onSave={saveStory}
        />
      )}
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
    ["Full name", app.applicant_name],
    ["Father's name", app.father_name],
    ["Mother's name", app.mother_name],
    ["Occupation", app.occupation],
    ["Monthly income", app.income],
    ["Family condition", app.family_information],
    ["Support needed", app.reason],
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
            <div key={k} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 text-sm border-b border-emerald-50 pb-2">
              <div className="text-emerald-700 font-medium">{k}</div>
              <div className="sm:col-span-2 text-emerald-950 break-words whitespace-pre-wrap">
                {v || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StoryEditModalProps {
  story: Story;
  onClose: () => void;
  onSave: (story: Story) => void;
}

function StoryEditModal({ story, onClose, onSave }: StoryEditModalProps) {
  const [form, setForm] = useState<Story>({ ...story });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Person Name is required");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-emerald-950 text-lg">
            {story.id ? "Edit Success Story" : "Add Success Story"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Person Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Title / Role
              </label>
              <input
                type="text"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Sewing machine support · Jessore"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Before Support
              </label>
              <textarea
                rows={3}
                value={form.before || ""}
                onChange={(e) => setForm({ ...form, before: e.target.value })}
                placeholder="Describe life conditions before support..."
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                After Support
              </label>
              <textarea
                rows={3}
                value={form.after || ""}
                onChange={(e) => setForm({ ...form, after: e.target.value })}
                placeholder="Describe outcome and improvements after support..."
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              General Description / Summary
            </label>
            <textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-emerald-800 cursor-pointer">
                Publish immediately (Visible on website)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Story Cover Photo
            </label>
            <ImageUploader
              value={form.image_url || ""}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="stories"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
            >
              Save Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
