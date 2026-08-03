import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMedia } from "@/lib/media.functions";
import { Loader2, Search, X, FileText } from "lucide-react";

export function humanSize(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function useMediaLibrary() {
  const fn = useServerFn(listMedia);
  return useQuery({ queryKey: ["admin-media"], queryFn: () => fn() });
}

export function MediaGrid({
  files,
  onSelect,
  renderActions,
}: {
  files: {
    path: string;
    url: string;
    name: string;
    folder: string;
    size: number;
    contentType: string | null;
  }[];
  onSelect?: (url: string) => void;
  renderActions?: (file: { path: string; url: string; name: string }) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {files.map((f) => {
        const isPdf = f.contentType === "application/pdf" || /\.pdf$/i.test(f.name);
        return (
          <div
            key={f.path}
            className="rounded-xl overflow-hidden border border-emerald-100 bg-white group"
          >
            <button
              type="button"
              onClick={() => onSelect?.(f.url)}
              disabled={!onSelect}
              className="block w-full aspect-square bg-emerald-50 overflow-hidden disabled:cursor-default"
            >
              {isPdf ? (
                <div className="h-full w-full flex items-center justify-center text-emerald-600">
                  <FileText className="h-8 w-8" />
                </div>
              ) : (
                <img
                  src={f.url}
                  alt={f.name}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </button>
            <div className="p-2">
              <p className="text-[10px] font-semibold text-emerald-900 truncate" title={f.name}>
                {f.name}
              </p>
              <p className="text-[10px] text-emerald-600">
                {f.folder} · {humanSize(f.size)}
              </p>
              {renderActions?.(f)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MediaPicker({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const { data, isLoading } = useMediaLibrary();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("all");

  const files = useMemo(() => {
    const all = data?.files ?? [];
    return all.filter(
      (f) =>
        (folder === "all" || f.folder === folder) &&
        (!q || f.name.toLowerCase().includes(q.toLowerCase())),
    );
  }, [data, folder, q]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-950">Media Library</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-emerald-100 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search files…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["all", ...(data?.folders ?? [])].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                  folder === f
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-sm text-emerald-700 py-16">
              No files yet — upload one to get started.
            </p>
          ) : (
            <MediaGrid files={files} onSelect={onSelect} />
          )}
        </div>
      </div>
    </div>
  );
}
