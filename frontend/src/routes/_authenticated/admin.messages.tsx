import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { setMessageRead, deleteSubmission } from "@/lib/submissions.functions";
import { Search, Trash2, Loader2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesPage,
});

type Msg = {
  id: string;
  sender_name: string;
  email: string | null;
  mobile: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

function MessagesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const res = await api.get<any>("submissions/contact-messages/?page_size=1000");
      const items = Array.isArray(res) ? res : (res.results ?? []);
      items.sort((a: any, b: any) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
      return items as Msg[];
    },
  });

  useEffect(() => {
    // Realtime not migrated; rely on serverFn invalidation and polling.
    return () => {};
  }, [qc]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter === "unread") list = list.filter((m) => !m.is_read);
    if (filter === "read") list = list.filter((m) => m.is_read);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((m) =>
        [m.sender_name, m.email, m.mobile, m.subject, m.message].some(
          (v) => v && v.toLowerCase().includes(s),
        ),
      );
    }
    return list;
  }, [data, filter, q]);

  const readFn = setMessageRead;
  const delFn = deleteSubmission;

  const toggleRead = async (m: Msg) => {
    try {
      await readFn({ data: { id: m.id, is_read: !m.is_read } });
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update message"));
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await delFn({ data: { table: "contact_messages", id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete message"));
    }
  };

  const unread = (data ?? []).filter((m) => !m.is_read).length;

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-950">Contact Messages</h1>
        <p className="text-sm text-emerald-700 mt-1">
          {unread} unread message{unread === 1 ? "" : "s"}.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-emerald-600 text-white" : "bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <p className="text-sm text-emerald-700">No messages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 transition-colors ${m.is_read ? "bg-white border-emerald-100" : "bg-emerald-50/70 border-emerald-300"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-emerald-950">{m.sender_name}</h3>
                    {!m.is_read && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    {m.email && <span>{m.email}</span>}
                    {m.email && m.mobile && " · "}
                    {m.mobile && <span>{m.mobile}</span>}
                    <span className="ml-2">· {new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  {m.subject && (
                    <div className="mt-2 font-semibold text-emerald-900 text-sm">{m.subject}</div>
                  )}
                  <p className="mt-2 text-sm text-emerald-900 whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleRead(m)}
                    title={m.is_read ? "Mark unread" : "Mark read"}
                    className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700"
                  >
                    {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    title="Delete"
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
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
