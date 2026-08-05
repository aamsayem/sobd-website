import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Pencil, Trash2, Loader2, X, Sprout } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/activities")({
  component: ActivitiesAdmin,
});

type Activity = {
  id?: string;
  title: string;
  title_bn?: string | null;
  description?: string | null;
  image_url?: string | null;
  icon_name: string;
  sort_order: number;
};

const empty: Activity = {
  title: "",
  title_bn: "",
  description: "",
  image_url: "",
  icon_name: "HandHeart",
  sort_order: 0,
};

const AVAILABLE_ICONS = [
  "GraduationCap",
  "HandHeart",
  "Stethoscope",
  "ShieldCheck",
  "Snowflake",
  "Home",
  "Users",
  "Heart",
  "Briefcase",
];

function ActivitiesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Activity | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const res = await api.get<any>("content/activities/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
      return items as Activity[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-activities"] });
    qc.invalidateQueries({ queryKey: ["public-activities"] });
  };

  const save = async (a: Activity) => {
    try {
      const payload = {
        ...a,
        sort_order: Number(a.sort_order),
      };
      if (a.id) {
        await api.patch(`content/activities/${a.id}/`, payload);
      } else {
        await api.post("content/activities/", payload);
      }
      toast.success("Saved successfully");
      setEditing(null);
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save activity"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    try {
      await api.delete(`content/activities/${id}/`);
      toast.success("Deleted");
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete activity"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Activities & Projects</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Manage the humanitarian programs and activities shown on the website.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(empty)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Activity
          </button>
        )}
      </header>

      {editing ? (
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm max-w-2xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-emerald-950">
              {editing.id ? "Edit Activity" : "Create New Activity"}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(editing);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Title (English) *
              </label>
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Title (Bangla)
              </label>
              <input
                value={editing.title_bn || ""}
                onChange={(e) => setEditing({ ...editing, title_bn: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Icon
                </label>
                <select
                  value={editing.icon_name}
                  onChange={(e) => setEditing({ ...editing, icon_name: e.target.value })}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {AVAILABLE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  required
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Activity Image
              </label>
              <ImageUploader
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="activities"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-50">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data ?? []).map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-40 bg-emerald-50 relative">
                {a.image_url ? (
                  <img src={a.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-300">
                    <Sprout className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-emerald-600/90 text-white px-2 py-0.5 rounded-md text-xs font-semibold font-mono">
                  Order: {a.sort_order}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    {a.icon_name}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-emerald-950 line-clamp-1">{a.title}</h3>
                {a.title_bn && <p className="text-xs text-emerald-700 font-bn mt-0.5">{a.title_bn}</p>}
                <p className="text-sm text-emerald-800/80 mt-2 line-clamp-3 flex-1">{a.description}</p>
                <div className="flex gap-2 mt-5 pt-4 border-t border-emerald-50">
                  <button
                    onClick={() => setEditing(a)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-950 font-semibold rounded-xl text-xs transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => remove(a.id!)}
                    className="flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-900 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
