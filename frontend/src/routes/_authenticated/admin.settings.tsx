import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

type SettingItem = {
  id: string;
  key: string;
  value: string;
};

function SettingsAdmin() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>({
    home_hero_text: "",
    home_hero_image: "",
    home_hero_image_mobile: "",
    home_sokkhom_featured_image: "",
    home_sokkhom_featured_image_mobile: "",
    sokkhom_hero_image: "",
    sokkhom_hero_image_mobile: "",
    sokkhom_bottom_img_1: "",
    sokkhom_bottom_img_2: "",
    sokkhom_bottom_img_3: "",
    sokkhom_bottom_img_4: "",
  });

  const { data: dbItems, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get<any>("content/site-settings/?page_size=1000");
      return (Array.isArray(res) ? res : (res.results ?? [])) as SettingItem[];
    },
  });

  // Sync loaded settings into form state
  useEffect(() => {
    if (dbItems) {
      const state: Record<string, string> = {
        home_hero_text: "",
        home_hero_image: "",
        home_hero_image_mobile: "",
        home_sokkhom_featured_image: "",
        home_sokkhom_featured_image_mobile: "",
        sokkhom_hero_image: "",
        sokkhom_hero_image_mobile: "",
        sokkhom_bottom_img_1: "",
        sokkhom_bottom_img_2: "",
        sokkhom_bottom_img_3: "",
        sokkhom_bottom_img_4: "",
      };
      dbItems.forEach((item) => {
        state[item.key] = item.value;
      });
      setFormData(state);
      setInitialData(state);
    }
  }, [dbItems]);

  const hasUnsavedChanges = () => {
    return Object.entries(formData).some(([key, value]) => {
      const initialVal = initialData[key] ?? "";
      return value !== initialVal;
    });
  };

  useBlocker({
    shouldBlockFn: () => {
      if (hasUnsavedChanges()) {
        const leave = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
        return !leave;
      }
      return false;
    },
    enableBeforeUnload: true,
  });

  const SETTING_LABELS: Record<string, string> = {
    home_hero_text: "Home Hero Subtitle Text",
    home_hero_image: "Home Hero Background (Desktop)",
    home_hero_image_mobile: "Home Hero Background (Mobile)",
    home_sokkhom_featured_image: "Sokkhom Featured Image (Desktop)",
    home_sokkhom_featured_image_mobile: "Sokkhom Featured Image (Mobile)",
    sokkhom_hero_image: "Shokkhom Hero Picture (Desktop)",
    sokkhom_hero_image_mobile: "Shokkhom Hero Picture (Mobile)",
    sokkhom_bottom_img_1: "Bottom Gallery Photo 1",
    sokkhom_bottom_img_2: "Bottom Gallery Photo 2",
    sokkhom_bottom_img_3: "Bottom Gallery Photo 3",
    sokkhom_bottom_img_4: "Bottom Gallery Photo 4",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const changedFields: Array<{ key: string; value: string; label: string }> = [];
    for (const [key, value] of Object.entries(formData)) {
      const initialVal = initialData[key] ?? "";
      if (value !== initialVal) {
        changedFields.push({
          key,
          value,
          label: SETTING_LABELS[key] || key,
        });
      }
    }

    if (changedFields.length === 0) {
      toast.info("No changes detected to save.");
      return;
    }

    setSaving(true);
    try {
      for (const { key, value } of changedFields) {
        const existing = dbItems?.find((item) => item.key === key);
        if (existing) {
          await api.patch(`content/site-settings/${existing.id}/`, { value });
        } else {
          await api.post("content/site-settings/", { key, value });
        }
      }

      toast.success("Settings saved successfully!", {
        description: `Updated: ${changedFields.map((f) => f.label).join(", ")}`,
      });

      setInitialData(formData);

      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-950">Website Settings</h1>
        <p className="text-sm text-emerald-700 mt-1">
          Manage landing page copy, hero pictures, and Shokkhom Foundation gallery images.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-emerald-950 border-b border-emerald-50 pb-2">
              Home Page Hero Section
            </h2>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Hero Subtitle Text
              </label>
              <textarea
                rows={4}
                required
                value={formData.home_hero_text}
                onChange={(e) => setFormData({ ...formData, home_hero_text: e.target.value })}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Hero Background Picture (Desktop)
                </label>
                <ImageUploader
                  value={formData.home_hero_image}
                  onChange={(url) => setFormData({ ...formData, home_hero_image: url })}
                  folder="settings"
                  aspect="wide"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Hero Background Picture (Mobile)
                </label>
                <ImageUploader
                  value={formData.home_hero_image_mobile}
                  onChange={(url) => setFormData({ ...formData, home_hero_image_mobile: url })}
                  folder="settings"
                  aspect="square"
                />
              </div>
            </div>

            <div className="border-t border-emerald-50 pt-4">
              <h3 className="text-sm font-bold text-emerald-800 mb-2">
                Home Page Shokkhom Section Image
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    Featured Image (Desktop)
                  </label>
                  <ImageUploader
                    value={formData.home_sokkhom_featured_image}
                    onChange={(url) =>
                      setFormData({ ...formData, home_sokkhom_featured_image: url })
                    }
                    folder="settings"
                    aspect="wide"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    Featured Image (Mobile)
                  </label>
                  <ImageUploader
                    value={formData.home_sokkhom_featured_image_mobile}
                    onChange={(url) =>
                      setFormData({ ...formData, home_sokkhom_featured_image_mobile: url })
                    }
                    folder="settings"
                    aspect="square"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-emerald-950 border-b border-emerald-50 pb-2">
              Shokkhom Foundation Page
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Shokkhom Hero Picture (Desktop)
                </label>
                <ImageUploader
                  value={formData.sokkhom_hero_image}
                  onChange={(url) => setFormData({ ...formData, sokkhom_hero_image: url })}
                  folder="settings"
                  aspect="wide"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Shokkhom Hero Picture (Mobile)
                </label>
                <ImageUploader
                  value={formData.sokkhom_hero_image_mobile}
                  onChange={(url) => setFormData({ ...formData, sokkhom_hero_image_mobile: url })}
                  folder="settings"
                  aspect="square"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                Bottom Gallery Pictures (4 Photos)
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => {
                  const key = `sokkhom_bottom_img_${num}`;
                  return (
                    <div
                      key={key}
                      className="border border-emerald-50 rounded-xl p-3 bg-emerald-50/5"
                    >
                      <span className="block text-xs font-medium text-emerald-800 mb-1">
                        Photo {num}
                      </span>
                      <ImageUploader
                        value={formData[key] || ""}
                        onChange={(url) => setFormData({ ...formData, [key]: url })}
                        folder="settings"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
