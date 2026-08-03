import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHero, StubBody } from "@/components/page-hero";
import { getPublicReports } from "@/lib/public-content.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, FileText, Download, X, Calendar, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/reports")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reports & Transparency — SELFLESS ORGANIZATION BD" }] }),
  component: Reports,
});

type Report = {
  id: string;
  title: string;
  bn_title: string | null;
  year: number | null;
  summary: string | null;
  description: string | null;
  category: string | null;
  publish_date: string | null;
  file_url: string | null;
  cover_url: string | null;
  sort_order: number;
  published: boolean;
};

function Reports() {
  const [detail, setDetail] = useState<Report | null>(null);
  const fn = useServerFn(getPublicReports);
  const { data, isLoading } = useQuery({ queryKey: ["public-reports"], queryFn: () => fn() });

  return (
    <>
      <PageHero kicker="TRANSPARENCY" title="Reports" bn="আয়-ব্যয় ও বার্ষিক প্রতিবেদন" />
      {isLoading ? (
        <StubBody>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        </StubBody>
      ) : !data || data.length === 0 ? (
        <StubBody>
          <p className="text-lg text-muted-foreground">
            Annual reports and downloadable PDFs will appear here.
          </p>
        </StubBody>
      ) : (
        <section className="container mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {data.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-strong rounded-2xl overflow-hidden border border-emerald-900/10 flex flex-col hover:-translate-y-1 hover:shadow-elevated transition-all"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-gradient">
                  {r.cover_url ? (
                    <img
                      src={r.cover_url}
                      alt={r.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/90">
                      <FileText className="h-14 w-14" />
                    </div>
                  )}
                  {r.category && (
                    <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wider bg-white/90 text-emerald-800 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {r.category}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 mb-1.5">
                    {r.year && <span>{r.year}</span>}
                    {r.publish_date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{" "}
                        {new Date(r.publish_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-emerald-950 text-lg leading-snug">{r.title}</h3>
                  {r.bn_title && <p className="font-bn text-emerald-800 mt-0.5">{r.bn_title}</p>}
                  {r.summary && (
                    <p className="text-sm text-emerald-800/80 mt-2 line-clamp-3">{r.summary}</p>
                  )}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-emerald-100">
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl"
                      >
                        <Download className="h-4 w-4" /> Download
                      </a>
                    )}
                    <button
                      onClick={() => setDetail(r)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 px-3.5 py-2 rounded-xl hover:bg-emerald-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden"
            >
              {detail.cover_url && (
                <img
                  src={detail.cover_url}
                  alt={detail.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-950">{detail.title}</h2>
                    {detail.bn_title && (
                      <p className="font-bn text-lg text-emerald-800 mt-1">{detail.bn_title}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="p-2 rounded-lg hover:bg-emerald-50 shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-700 mb-4">
                  {detail.category && (
                    <span className="bg-emerald-100 px-2.5 py-1 rounded-full">
                      {detail.category}
                    </span>
                  )}
                  {detail.year && (
                    <span className="bg-emerald-100 px-2.5 py-1 rounded-full">{detail.year}</span>
                  )}
                  {detail.publish_date && (
                    <span className="bg-emerald-100 px-2.5 py-1 rounded-full">
                      {new Date(detail.publish_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {detail.description ? (
                  <p className="text-emerald-900/90 whitespace-pre-wrap leading-relaxed">
                    {detail.description}
                  </p>
                ) : detail.summary ? (
                  <p className="text-emerald-900/90 leading-relaxed">{detail.summary}</p>
                ) : null}
                {detail.file_url && (
                  <a
                    href={detail.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
