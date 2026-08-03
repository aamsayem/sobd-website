import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  upsertAchievement,
  deleteAchievement,
  toggleAchievementPublished,
} from "@/lib/admin.functions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Pencil, Trash2, Loader2, X, Trophy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/achievements")({
  component: AchievementsAdmin,
});

type Achievement = {
  id?: string;
  title: string;
  description?: string | null;
  year?: number | null;
  image_url?: string | null;
  sort_order: number;
  published: boolean;
};

const empty: Achievement = {
  title: "",
  description: "",
  year: new Date().getFullYear(),
  image_url: "",
  sort_order: 0,
  published: true,
};

function AchievementsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Achievement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-achievements"],
    queryFn: async () => {
      const res = await api.get<any>("content/achievements/?page_size=1000");
      const items = Array.isArray(res) ? res : res.results ?? [];
      // sort by sort_order asc, then year desc
      items.sort((a: any, b: any) => {
        const sA = Number(a.sort_order ?? 0);
        const sB = Number(b.sort_order ?? 0);
        if (sA !== sB) return sA - sB;
        const yA = Number(a.year ?? 0);
        const yB = Number(b.year ?? 0);
        return yB - yA;
      });
      return items as Achievement[];
    },
  });

  const upsertFn = useServerFn(upsertAchievement);
  const delFn = useServerFn(deleteAchievement);
  const toggleFn = useServerFn(toggleAchievementPublished);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-achievements"] });
    qc.invalidateQueries({ queryKey: ["public-achievements"] });
  };

  const save = async (a: Achievement) => {
    try {
      await upsertFn({
        data: {
          ...a,
          sort_order: Number(a.sort_order),
          year: a.year ? Number(a.year) : null,
        },
      });
      toast.success("Saved");
      setEditing(null);
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save achievement"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete achievement"));
    }
  };

  const togglePublish = async (a: Achievement) => {
    try {
      await toggleFn({ data: { id: a.id!, published: !a.published } });
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update achievement visibility"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Achievements</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Milestones shown on the public Achievements page.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> New Achievement
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (data ?? []).length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((a) => (
            <div
              key={a.id}
              className="glass-strong rounded-2xl overflow-hidden border border-emerald-100"
            >
              <div className="aspect-video bg-emerald-100/60 overflow-hidden">
                {a.image_url ? (
                  <img
                    src={a.image_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-emerald-500">
                    <Trophy className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {a.year && (
                    <span className="text-[10px] font-semibold text-emerald-700">{a.year}</span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      a.published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="font-bold text-emerald-950 leading-tight">{a.title}</h3>
                {a.description && (
                  <p className="text-xs text-emerald-700 mt-1 line-clamp-2">{a.description}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-emerald-100">
                  <button
                    onClick={() => togglePublish(a)}
                    title={a.published ? "Unpublish" : "Publish"}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
                  >
                    {a.published ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditing(a)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(a.id!)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No achievements yet.</p>
        </div>
      )}

      {editing && (
        <AchievementForm initial={editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function AchievementForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Achievement;
  onClose: () => void;
  onSave: (a: Achievement) => void;
}) {
  const [a, setA] = useState<Achievement>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Achievement>(k: K, v: Achievement[K]) =>
    setA((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(a);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-950">
            {a.id ? "Edit Achievement" : "New Achievement"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Title *">
            <input
              required
              value={a.title}
              onChange={(e) => set("title", e.target.value)}
              className="ainput"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={a.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              className="ainput"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year">
              <input
                type="number"
                value={a.year ?? ""}
                onChange={(e) => set("year", e.target.value ? +e.target.value : null)}
                className="ainput"
              />
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                value={a.sort_order}
                onChange={(e) => set("sort_order", +e.target.value)}
                className="ainput"
              />
            </Field>
          </div>
          <ImageUploader
            label="Achievement Image"
            folder="achievements"
            aspect="wide"
            value={a.image_url}
            onChange={(url) => set("image_url", url)}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <input
              type="checkbox"
              checked={a.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published
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
        <style>{`.ainput{width:100%;padding:.625rem .875rem;border-radius:.75rem;border:1px solid #d1fae5;background:white;outline:none}.ainput:focus{box-shadow:0 0 0 2px #10b98140}`}</style>
      </form>
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
