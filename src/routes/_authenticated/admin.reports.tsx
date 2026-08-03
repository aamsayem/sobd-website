import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { api } from "@/lib/api";
import { upsertReport, deleteReport, toggleReportPublished } from "@/lib/admin.functions";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  FileText,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsPage,
});

type Report = {
  id?: string;
  title: string;
  bn_title?: string | null;
  year?: number | null;
  summary?: string | null;
  description?: string | null;
  category?: string | null;
  publish_date?: string | null;
  file_url?: string | null;
  cover_url?: string | null;
  sort_order: number;
  published?: boolean;
};

const empty: Report = {
  title: "",
  bn_title: "",
  year: new Date().getFullYear(),
  summary: "",
  description: "",
  category: "Annual Report",
  publish_date: new Date().toISOString().slice(0, 10),
  file_url: "",
  cover_url: "",
  sort_order: 0,
  published: true,
};

function ReportsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Report | null>(null);
  const [viewing, setViewing] = useState<Report | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const res = await api.get<any>("content/reports/?page_size=1000");
      const items = Array.isArray(res) ? res : res.results ?? [];
      items.sort((a: any, b: any) => {
        const sA = Number(a.sort_order ?? 0);
        const sB = Number(b.sort_order ?? 0);
        if (sA !== sB) return sA - sB;
        const pa = new Date(a.publish_date || 0).getTime();
        const pb = new Date(b.publish_date || 0).getTime();
        if (pb !== pa) return pb - pa;
        const ya = Number(a.year ?? 0);
        const yb = Number(b.year ?? 0);
        return yb - ya;
      });
      return items as Report[];
    },
  });

  const upsertFn = useServerFn(upsertReport);
  const delFn = useServerFn(deleteReport);
  const toggleFn = useServerFn(toggleReportPublished);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    qc.invalidateQueries({ queryKey: ["public-reports"] });
  };

  const save = async (r: Report) => {
    try {
      await upsertFn({
        data: {
          ...r,
          bn_title: r.bn_title || null,
          summary: r.summary || null,
          description: r.description || null,
          category: r.category || null,
          publish_date: r.publish_date || null,
          year: r.year ? Number(r.year) : null,
          sort_order: Number(r.sort_order),
          published: r.published ?? true,
        },
      });
      toast.success("Saved");
      setEditing(null);
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save report"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete report"));
    }
  };

  const togglePublish = async (r: Report) => {
    try {
      await toggleFn({ data: { id: r.id!, published: !(r.published ?? true) } });
      toast.success(!(r.published ?? true) ? "Published" : "Unpublished");
      invalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update report visibility"));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Reports</h1>
          <p className="text-sm text-emerald-700 mt-1">
            Annual reports and transparency documents.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> New Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.map((r) => {
            const published = r.published ?? true;
            return (
              <div
                key={r.id}
                className="glass-strong rounded-2xl overflow-hidden border border-emerald-100 flex flex-col"
              >
                <div className="relative aspect-[16/9] w-full bg-emerald-100 overflow-hidden">
                  {r.cover_url ? (
                    <img src={r.cover_url} alt={r.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-emerald-500">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${published ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}
                  >
                    {published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-emerald-950 line-clamp-2">{r.title}</h3>
                  <div className="text-xs text-emerald-700 mt-1 flex flex-wrap gap-2">
                    {r.year && <span>{r.year}</span>}
                    {r.category && <span>· {r.category}</span>}
                    {r.publish_date && (
                      <span>· {new Date(r.publish_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {r.summary && (
                    <p className="text-sm text-emerald-800 mt-2 line-clamp-2">{r.summary}</p>
                  )}
                  <div className="mt-auto pt-4 flex flex-wrap gap-1.5 border-t border-emerald-100 mt-4">
                    <button
                      onClick={() => setViewing(r)}
                      title="View"
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditing(r)}
                      title="Edit"
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => togglePublish(r)}
                      title={published ? "Unpublish" : "Publish"}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                    >
                      {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open PDF"
                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => remove(r.id!)}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center border border-emerald-100">
          <p className="text-emerald-700">No reports yet.</p>
        </div>
      )}

      {editing && <Form initial={editing} onClose={() => setEditing(null)} onSave={save} />}
      {viewing && <ViewModal report={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function Form({
  initial,
  onClose,
  onSave,
}: {
  initial: Report;
  onClose: () => void;
  onSave: (r: Report) => void;
}) {
  const [c, setC] = useState<Report>(initial);
  const [saving, setSaving] = useState(false);
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
            {c.id ? "Edit Report" : "New Report"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Report Title *">
              <input
                required
                value={c.title}
                onChange={(e) => setC({ ...c, title: e.target.value })}
                className="rinput"
              />
            </Field>
            <Field label="Bengali Title">
              <input
                value={c.bn_title ?? ""}
                onChange={(e) => setC({ ...c, bn_title: e.target.value })}
                className="rinput font-bn"
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Category">
              <input
                value={c.category ?? ""}
                onChange={(e) => setC({ ...c, category: e.target.value })}
                placeholder="Annual Report"
                className="rinput"
              />
            </Field>
            <Field label="Financial Year">
              <input
                type="number"
                min={2000}
                max={2100}
                value={c.year ?? ""}
                onChange={(e) => setC({ ...c, year: e.target.value ? +e.target.value : null })}
                className="rinput"
              />
            </Field>
            <Field label="Publish Date">
              <input
                type="date"
                value={c.publish_date ?? ""}
                onChange={(e) => setC({ ...c, publish_date: e.target.value })}
                className="rinput"
              />
            </Field>
          </div>
          <Field label="Short Summary">
            <textarea
              rows={2}
              maxLength={500}
              value={c.summary ?? ""}
              onChange={(e) => setC({ ...c, summary: e.target.value })}
              className="rinput"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={5}
              value={c.description ?? ""}
              onChange={(e) => setC({ ...c, description: e.target.value })}
              className="rinput"
            />
          </Field>
          <ImageUploader
            label="Report PDF"
            folder="reports"
            aspect="free"
            accept="application/pdf"
            hint="PDF document"
            value={c.file_url}
            onChange={(url) => setC({ ...c, file_url: url })}
          />
          <ImageUploader
            label="Cover Image"
            folder="reports"
            aspect="wide"
            value={c.cover_url}
            onChange={(url) => setC({ ...c, cover_url: url })}
          />
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <Field label="Sort Order">
              <input
                type="number"
                value={c.sort_order}
                onChange={(e) => setC({ ...c, sort_order: +e.target.value })}
                className="rinput"
              />
            </Field>
            <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 cursor-pointer">
              <input
                type="checkbox"
                checked={c.published ?? true}
                onChange={(e) => setC({ ...c, published: e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm font-semibold text-emerald-900">
                Published (visible on public site)
              </span>
            </label>
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
        <style>{`.rinput{width:100%;padding:.625rem .875rem;border-radius:.75rem;border:1px solid #d1fae5;background:white;outline:none}.rinput:focus{box-shadow:0 0 0 2px #10b98140}`}</style>
      </form>
    </div>
  );
}

function ViewModal({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden"
      >
        {report.cover_url && (
          <img
            src={report.cover_url}
            alt={report.title}
            className="w-full aspect-[16/9] object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">{report.title}</h2>
              {report.bn_title && (
                <p className="font-bn text-lg text-emerald-800 mt-1">{report.bn_title}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-emerald-50">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 text-xs text-emerald-700">
            {report.category && (
              <span className="bg-emerald-100 px-2.5 py-1 rounded-full">{report.category}</span>
            )}
            {report.year && (
              <span className="bg-emerald-100 px-2.5 py-1 rounded-full">{report.year}</span>
            )}
            {report.publish_date && (
              <span className="bg-emerald-100 px-2.5 py-1 rounded-full">
                {new Date(report.publish_date).toLocaleDateString()}
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-full ${(report.published ?? true) ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}
            >
              {(report.published ?? true) ? "Published" : "Draft"}
            </span>
          </div>
          {report.summary && <p className="text-emerald-900 mt-4 font-medium">{report.summary}</p>}
          {report.description && (
            <p className="text-emerald-900/90 mt-3 whitespace-pre-wrap leading-relaxed">
              {report.description}
            </p>
          )}
          {report.file_url && (
            <a
              href={report.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <ExternalLink className="h-4 w-4" /> Open PDF
            </a>
          )}
        </div>
      </div>
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
