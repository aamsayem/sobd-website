import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { PageHero, StubBody } from "@/components/page-hero";
import { getPublicAchievements } from "@/lib/public-content.functions";
import { getErrorMessage } from "@/lib/utils";
import { Loader2, Trophy } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content:
          "Milestones and recognitions earned by SELFLESS ORGANIZATION BD through years of volunteer-led humanitarian work in Bangladesh.",
      },
      { property: "og:title", content: "Achievements — SELFLESS ORGANIZATION BD" },
      {
        property: "og:description",
        content:
          "Milestones and recognitions earned through years of volunteer-led humanitarian work in Bangladesh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Achievements,
});

type AchievementItem = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  year?: number | null;
};

function Achievements() {
  const fn = useServerFn(getPublicAchievements);
  const { data, isLoading } = useQuery({ queryKey: ["public-achievements"], queryFn: () => fn() });
  const [year, setYear] = useState<string>("all");

  const achievements = useMemo(() => (data ?? []) as AchievementItem[], [data]);

  const years = useMemo(() => {
    const set = new Set<number>();
    achievements.forEach((a) => a.year && set.add(a.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [achievements]);

  const filtered = achievements.filter((a) => year === "all" || String(a.year) === year);

  return (
    <>
      <PageHero kicker="OUR MILESTONES" title="Achievements" />

      {isLoading ? (
        <StubBody>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        </StubBody>
      ) : !data || data.length === 0 ? (
        <StubBody>
          <p className="text-lg text-muted-foreground">
            Our milestones will be published here soon.
          </p>
        </StubBody>
      ) : (
        <section className="container mx-auto px-4 py-16">
          {years.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
              {["all", ...years.map(String)].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    year === y
                      ? "bg-emerald-600 text-white"
                      : "glass border border-emerald-900/10 text-emerald-900 hover:bg-emerald-50"
                  }`}
                >
                  {y === "all" ? "All Years" : y}
                </button>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <article
                key={a.id}
                className="glass-strong rounded-2xl overflow-hidden border border-emerald-900/10 hover:-translate-y-1 transition-transform"
              >
                <div className="h-[200px] sm:h-[220px] bg-emerald-100/60 overflow-hidden">
                  {a.image_url ? (
                    <img
                      src={a.image_url}
                      alt={a.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-emerald-600">
                      <Trophy className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {a.year && (
                    <div className="text-xs font-semibold text-emerald-700 mb-1.5 tracking-wider">
                      {a.year}
                    </div>
                  )}
                  <h3 className="font-bold text-emerald-950 text-lg leading-snug">{a.title}</h3>
                  {a.description && (
                    <p className="text-sm text-emerald-800/80 mt-2 leading-relaxed">
                      {a.description}
                    </p>
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
