import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { upsertGalleryItem, deleteGalleryItem } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: GalleryPage,
});

type Item = {
  id?: string;
  title?: string | null;
  caption?: string | null;
  image_url: string;
  category?: string | null;
  sort_order: number;
};
const empty: Item = { title: "", caption: "", image_url: "", category: "", sort_order: 0 };

function GalleryPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Item | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const res = await api.get<any>("content/galleries/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => {
        const sA = Number(a.sort_order ?? 0);
        const sB = Number(b.sort_order ?? 0);
        if (sA !== sB) return sA - sB;
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
      return items as Item[];
    },
  });
  const upsertFn = upsertGalleryItem;
  const delFn = deleteGalleryItem;

  const save = async (it: Item) => {
    try {
      await upsertFn({ data: { ...it, sort_order: Number(it.sort_order) } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save gallery item"));
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete gallery item"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Gallery</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Add photos that appear on the public Gallery page.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> Add Photo
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((it) => (
            <div
              key={it.id}
              className="glass-strong rounded-2xl overflow-hidden border border-emerald-100 group relative"
            >
              <img
                src={it.image_url}
                alt={it.title ?? ""}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(it)}
                  className="p-2 rounded-lg bg-white/90 text-emerald-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(it.id!)}
                  className="p-2 rounded-lg bg-white/90 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {(it.title || it.category) && (
                <div className="p-3">
                  {it.title && (
                    <div className="font-semibold text-emerald-950 text-sm truncate">
                      {it.title}
                    </div>
                  )}
                  {it.category && <div className="text-xs text-emerald-700">{it.category}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No photos yet.</p>
        </div>
      )}
      {editing && <ItemForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function ItemForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Item;
  onClose: () => void;
  onSave: (it: Item) => void;
}) {
  const [c, setC] = useState<Item>(initial);
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(c);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-950">
            {c.id ? "Edit Photo" : "Add Photo"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <ImageUploader
            label="Image *"
            folder="gallery"
            aspect="free"
            value={c.image_url}
            onChange={(url) => setC({ ...c, image_url: url })}
          />
          <Field label="Title">
            <input
              value={c.title ?? ""}
              onChange={(e) => setC({ ...c, title: e.target.value })}
              className="ginput"
            />
          </Field>
          <Field label="Caption">
            <textarea
              rows={2}
              value={c.caption ?? ""}
              onChange={(e) => setC({ ...c, caption: e.target.value })}
              className="ginput"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <input
                value={c.category ?? ""}
                onChange={(e) => setC({ ...c, category: e.target.value })}
                placeholder="Relief, Education..."
                className="ginput"
              />
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                value={c.sort_order}
                onChange={(e) => setC({ ...c, sort_order: +e.target.value })}
                className="ginput"
              />
            </Field>
          </div>
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
        <style>{`.ginput{width:100%;padding:.625rem .875rem;border-radius:.75rem;border:1px solid #d1fae5;background:white;outline:none}.ginput:focus{box-shadow:0 0 0 2px #10b98140}`}</style>
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
