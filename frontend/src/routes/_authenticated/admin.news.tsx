import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { upsertNews, deleteNews } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, Loader2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: NewsPage,
});

type Post = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_url?: string | null;
  published: boolean;
  published_at?: string | null;
};
const empty: Post = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_url: "",
  published: false,
  published_at: null,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

function NewsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Post | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const res = await api.get<any>("content/news/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
      return items as Post[];
    },
  });
  const upsertFn = upsertNews;
  const delFn = deleteNews;

  const save = async (p: Post) => {
    try {
      await upsertFn({ data: p });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      qc.invalidateQueries({ queryKey: ["public-news"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save post"));
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-news"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete post"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">News & Blog</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Write stories that appear on the public News page.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((p) => (
            <div
              key={p.id}
              className="glass-strong rounded-2xl p-4 border border-emerald-100 flex items-center gap-4"
            >
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt=""
                  className="h-16 w-24 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-16 w-24 rounded-lg bg-emerald-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1 ${p.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {p.published ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </>
                    )}
                  </span>
                  <span className="text-xs text-emerald-700">/{p.slug}</span>
                </div>
                <h3 className="font-bold text-emerald-950 truncate">{p.title}</h3>
                {p.excerpt && <p className="text-sm text-emerald-700 truncate">{p.excerpt}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setEditing(p)}
                  className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(p.id!)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No posts yet.</p>
        </div>
      )}
      {editing && <PostForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function PostForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Post;
  onClose: () => void;
  onSave: (p: Post) => void;
}) {
  const [c, setC] = useState<Post>(initial);
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(c);
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-3xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-950">{c.id ? "Edit Post" : "New Post"}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Title *">
            <input
              required
              value={c.title}
              onChange={(e) => {
                const t = e.target.value;
                setC({ ...c, title: t, slug: c.id ? c.slug : slugify(t) });
              }}
              className="ninput"
            />
          </Field>
          <Field label="Slug *">
            <input
              required
              value={c.slug}
              onChange={(e) => setC({ ...c, slug: slugify(e.target.value) })}
              placeholder="my-post-title"
              className="ninput"
            />
          </Field>
          <ImageUploader
            label="Cover Image"
            folder="news"
            aspect="wide"
            value={c.cover_url}
            onChange={(url) => setC({ ...c, cover_url: url })}
          />
          <Field label="Excerpt">
            <textarea
              rows={2}
              value={c.excerpt ?? ""}
              onChange={(e) => setC({ ...c, excerpt: e.target.value })}
              className="ninput"
            />
          </Field>
          <Field label="Content (Markdown)">
            <textarea
              rows={10}
              value={c.content ?? ""}
              onChange={(e) => setC({ ...c, content: e.target.value })}
              className="ninput font-mono text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-emerald-900">
            <input
              type="checkbox"
              checked={c.published}
              onChange={(e) => setC({ ...c, published: e.target.checked })}
              className="h-4 w-4"
            />
            Publish (visible on public site)
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
        <style>{`.ninput{width:100%;padding:.625rem .875rem;border-radius:.75rem;border:1px solid #d1fae5;background:white;outline:none}.ninput:focus{box-shadow:0 0 0 2px #10b98140}`}</style>
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
