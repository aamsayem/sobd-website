import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { api } from "@/lib/api";
import { upsertMember, deleteMember } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, Loader2, X, Facebook } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/committee")({
  component: CommitteePage,
});

type Member = {
  id?: string;
  full_name: string;
  designation: string;
  category: string;
  photo_url?: string | null;
  facebook_url?: string | null;
  sort_order: number;
};

export const CATEGORIES = [
  "Advisory Panel",
  "Board of Directors",
  "Executive Panel",
  "Sub-Executive Panel",
  "Expatriate Panel",
  "Chittagong Branch",
  "General Members",
];

const empty: Member = {
  full_name: "",
  designation: "",
  category: CATEGORIES[0],
  photo_url: "",
  facebook_url: "",
  sort_order: 0,
};

function CommitteePage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Member | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-committee"],
    queryFn: async () => {
      const res = await api.get<any>("content/committee-members/?page_size=1000");
      const items = Array.isArray(res) ? res : res.results ?? [];
      items.sort((a: any, b: any) => {
        if (a.category === b.category) return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        return (a.category || "").localeCompare(b.category || "");
      });
      return items as Member[];
    },
  });

  const upsertFn = useServerFn(upsertMember);
  const delFn = useServerFn(deleteMember);

  const save = async (m: Member) => {
    try {
      await upsertFn({ data: { ...m, sort_order: Number(m.sort_order) } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-committee"] });
      qc.invalidateQueries({ queryKey: ["public-committee"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save committee member"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-committee"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete committee member"));
    }
  };

  const filtered = (data ?? []).filter((m) => filter === "all" || m.category === filter);

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Committee Members</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Manage members shown on the Executive Committee page.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> New Member
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === c ? "bg-emerald-600 text-white" : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="glass-strong rounded-2xl overflow-hidden border border-emerald-100"
            >
              <div className="aspect-square bg-emerald-gradient overflow-hidden">
                {m.photo_url ? (
                  <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white text-5xl font-bold">
                    {m.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-[10px] text-emerald-700 mb-1">{m.category}</div>
                <h3 className="font-bold text-emerald-950 leading-tight">{m.full_name}</h3>
                <p className="text-xs text-emerald-700 mt-0.5">{m.designation}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100">
                  {m.facebook_url ? (
                    <a
                      href={m.facebook_url}
                      target="_blank"
                      rel="noopener"
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(m)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(m.id!)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No members in this category yet.</p>
        </div>
      )}

      {editing && <MemberForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function MemberForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Member;
  onClose: () => void;
  onSave: (m: Member) => void;
}) {
  const [m, setM] = useState<Member>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setM((s) => ({ ...s, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(m);
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-950">
            {m.id ? "Edit Member" : "New Member"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Full Name *">
            <input
              required
              value={m.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Designation *">
            <input
              required
              value={m.designation}
              onChange={(e) => set("designation", e.target.value)}
              className="input"
              placeholder="e.g. President, Convener"
            />
          </Field>
          <Field label="Category *">
            <select
              required
              value={m.category}
              onChange={(e) => set("category", e.target.value)}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <ImageUploader
            label="Member Photo"
            folder="committee"
            aspect="square"
            value={m.photo_url}
            onChange={(url) => set("photo_url", url)}
          />
          <Field label="Facebook Profile URL">
            <input
              type="url"
              value={m.facebook_url ?? ""}
              onChange={(e) => set("facebook_url", e.target.value)}
              placeholder="https://facebook.com/..."
              className="input"
            />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              value={m.sort_order}
              onChange={(e) => set("sort_order", +e.target.value)}
              className="input"
            />
          </Field>
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
