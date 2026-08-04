import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MediaGrid, useMediaLibrary, humanSize } from "@/components/admin/MediaPicker";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { deleteMedia, migrateExternalMedia } from "@/lib/media.functions";
import { Loader2, Search, Copy, Trash2, RefreshCw, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaLibraryPage,
});

const MIGRATIONS = [
  {
    label: "Committee photos",
    table: "committee_members",
    column: "photo_url",
    folder: "committee",
  },
  { label: "Campaign banners", table: "campaigns", column: "banner_url", folder: "campaigns" },
  { label: "Gallery images", table: "gallery_items", column: "image_url", folder: "gallery" },
  { label: "News covers", table: "news_posts", column: "cover_url", folder: "news" },
  { label: "Report covers", table: "reports", column: "cover_url", folder: "reports" },
  {
    label: "Achievement images",
    table: "achievements",
    column: "image_url",
    folder: "achievements",
  },
] as const;

function MediaLibraryPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useMediaLibrary();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("all");
  const [uploadFolder, setUploadFolder] = useState("general");
  const [migrating, setMigrating] = useState<string | null>(null);

  const delFn = deleteMedia;
  const migrateFn = migrateExternalMedia;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  };

  const files = useMemo(() => {
    const all = data?.files ?? [];
    return all.filter(
      (f) =>
        (folder === "all" || f.folder === folder) &&
        (!q || f.name.toLowerCase().includes(q.toLowerCase())),
    );
  }, [data, folder, q]);

  const totalSize = (data?.files ?? []).reduce((a, f) => a + f.size, 0);

  const remove = async (path: string) => {
    if (!confirm("Delete this file permanently? Pages still using it will show a broken image."))
      return;
    try {
      await delFn({ data: { path } });
      toast.success("File deleted");
      refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete media"));
    }
  };

  const runMigration = async (m: (typeof MIGRATIONS)[number]) => {
    setMigrating(m.table + m.column);
    try {
      const res = await migrateFn({
        data: { table: m.table, column: m.column, folder: m.folder },
      });
      if (res.migrated === 0 && res.failures.length === 0)
        toast.info(`${m.label}: nothing external to migrate`);
      else
        toast.success(
          `${m.label}: ${res.migrated} migrated${res.failures.length ? `, ${res.failures.length} failed` : ""}`,
        );
      refresh();
      qc.invalidateQueries();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to migrate media"));
    } finally {
      setMigrating(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Media Library</h1>
          <p className="text-sm text-emerald-700 mt-1">
            All files stored permanently in project storage · {data?.files.length ?? 0} files ·{" "}
            {humanSize(totalSize)}
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="glass-strong rounded-2xl p-5 border border-emerald-100 lg:col-span-2">
          <h2 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Upload new file
          </h2>
          <div className="mb-3">
            <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider block mb-1.5">
              Folder
            </label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm bg-white outline-none"
            >
              {[
                "general",
                "committee",
                "campaigns",
                "gallery",
                "news",
                "reports",
                "achievements",
                "activities",
              ].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <ImageUploader
            label="File"
            folder={uploadFolder}
            aspect="free"
            accept="image/*,application/pdf"
            hint="Original ratio kept · images and PDFs"
            value=""
            onChange={() => refresh()}
          />
        </div>

        <div className="glass-strong rounded-2xl p-5 border border-emerald-100">
          <h2 className="text-sm font-bold text-emerald-950 mb-1">Migrate external links</h2>
          <p className="text-[11px] text-emerald-700 mb-3">
            Downloads images still hosted elsewhere into project storage and updates the records.
          </p>
          <div className="space-y-1.5">
            {MIGRATIONS.map((m) => (
              <button
                key={m.table + m.column}
                onClick={() => runMigration(m)}
                disabled={migrating !== null}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
              >
                {m.label}
                {migrating === m.table + m.column && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["all", ...(data?.folders ?? [])].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold ${
                folder === f
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : files.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No files match your search.</p>
        </div>
      ) : (
        <MediaGrid
          files={files}
          renderActions={(f) => (
            <div className="flex gap-1 mt-1.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(f.url);
                  toast.success("URL copied");
                }}
                className="p-1 rounded-md hover:bg-emerald-50 text-emerald-700"
                title="Copy URL"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={() => remove(f.path)}
                className="p-1 rounded-md hover:bg-red-50 text-red-600"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
