import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, StubBody } from "@/components/page-hero";
import { getPublicNews } from "@/lib/public-content.functions";
import { Loader2, Calendar } from "lucide-react";

type NewsPost = {
  id: string;
  title: string;
  excerpt?: string | null;
  cover_url?: string | null;
  published_at?: string | null;
};

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & Blog — SELFLESS ORGANIZATION BD" }] }),
  component: News,
});

function News() {
  const fn = getPublicNews;
  const { data, isLoading } = useQuery({ queryKey: ["public-news"], queryFn: () => fn() });
  const posts = (data ?? []) as NewsPost[];

  return (
    <>
      <PageHero kicker="LATEST" title="News & Blog" bn="খবর ও আপডেট" />
      {isLoading ? (
        <StubBody>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        </StubBody>
      ) : posts.length === 0 ? (
        <StubBody>
          <p className="text-lg text-muted-foreground">Stories from the field coming soon.</p>
        </StubBody>
      ) : (
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <article
                key={p.id}
                className="glass-strong rounded-2xl overflow-hidden border border-emerald-900/10 hover:-translate-y-1 transition-transform"
              >
                {p.cover_url && (
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    className="w-full aspect-video object-cover"
                  />
                )}
                <div className="p-5">
                  {p.published_at && (
                    <div className="text-xs text-emerald-700 inline-flex items-center gap-1.5 mb-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.published_at).toLocaleDateString()}
                    </div>
                  )}
                  <h3 className="font-bold text-emerald-950 text-lg leading-snug">{p.title}</h3>
                  {p.excerpt && (
                    <p className="text-sm text-emerald-800/80 mt-2 line-clamp-3">{p.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
