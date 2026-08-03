import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Loader2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { AnimatedCounter } from "@/components/animated-counter";
import { getPublicCommittee } from "@/lib/public-content.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/committee")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Executive Committee — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content: "Meet the council and committee members leading SELFLESS ORGANIZATION BD.",
      },
      { property: "og:title", content: "Executive Committee — SELFLESS ORGANIZATION BD" },
      { property: "og:description", content: "The panels and members behind our work." },
    ],
    links: [{ rel: "canonical", href: "/committee" }],
  }),
  component: Committee,
});

const CORE_CATEGORIES = [
  "Advisory Panel",
  "Board of Directors",
  "Executive Panel",
  "Sub-Executive Panel",
  "General Members",
];

type Member = {
  id: string;
  full_name: string;
  designation: string;
  category: string;
  photo_url: string | null;
  facebook_url: string | null;
  sort_order: number;
  is_active?: boolean;
};

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

type Filter = "all" | "core" | "ctg" | "probashi";

function Committee() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const fn = useServerFn(getPublicCommittee);
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["public-committee"],
    queryFn: () => fn(),
  });

  const grouped = useMemo(() => {
    const groups: { id: string; name: string; members: Member[] }[] = [];
    const map = new Map<string, Member[]>();
    for (const m of members as Member[]) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    const order = [...CORE_CATEGORIES, "Expatriate Panel", "Chittagong Branch"];
    for (const cat of order) {
      if (map.has(cat)) groups.push({ id: cat, name: cat, members: map.get(cat)! });
    }
    for (const [cat, list] of map.entries()) {
      if (!order.includes(cat)) groups.push({ id: cat, name: cat, members: list });
    }
    return groups;
  }, [members]);

  const visible = useMemo(() => {
    return grouped
      .filter((p) => {
        if (filter === "all") return true;
        if (filter === "core") return CORE_CATEGORIES.includes(p.name);
        if (filter === "ctg") return p.name === "Chittagong Branch";
        if (filter === "probashi") return p.name === "Expatriate Panel";
        return true;
      })
      .map((c) => ({
        ...c,
        members: c.members.filter((m) =>
          (m.full_name + m.designation).toLowerCase().includes(query.toLowerCase()),
        ),
      }))
      .filter((c) => c.members.length > 0);
  }, [grouped, query, filter]);

  const totalMembers = (members as Member[]).length;
  // Panels: every distinct category that has at least one active member
  const panelsCount = grouped.filter((g) => g.members.length > 0).length;

  const filterBtns: { id: Filter; label: string }[] = [
    { id: "all", label: "All Members" },
    { id: "core", label: "Core Panels" },
    { id: "ctg", label: "Chittagong Branch" },
    { id: "probashi", label: "Expatriate Panel" },
  ];

  return (
    <>
      <PageHero kicker="LEADERSHIP" title="Executive Committee" bn="নির্বাহী পরিষদ" />

      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <motion.div
          {...fade}
          className="glass-strong rounded-3xl p-6 lg:p-8 shadow-elevated grid sm:grid-cols-3 gap-6"
        >
          <Stat icon={Users} value={totalMembers} label="Total members" />
          <Stat icon={Users} value={panelsCount} label="Panels" />
          <Stat icon={Users} value={6} suffix="+" label="Years of leadership" />
        </motion.div>
      </section>

      <section className="container mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterBtns.map((b) => (
              <button
                key={b.id}
                onClick={() => setFilter(b.id)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${filter === b.id ? "bg-emerald-gradient text-white border-transparent shadow-glow" : "glass border-primary/15 hover:bg-primary/5 hover:border-primary/30"}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 space-y-20 mb-16">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}
        {!isLoading && totalMembers === 0 && (
          <p className="text-center text-muted-foreground py-16">
            Committee members will appear here once added from the admin panel.
          </p>
        )}
        {!isLoading && visible.length === 0 && totalMembers > 0 && (
          <p className="text-center text-muted-foreground py-16">No members match your search.</p>
        )}
        {visible.map((c) => (
          <section key={c.id}>
            <motion.div {...fade} className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold">{c.name}</h2>
            </motion.div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {c.members.map((m, i) => (
                <motion.a
                  key={m.id}
                  {...fade}
                  transition={{ ...fade.transition, delay: i * 0.03 }}
                  href={m.facebook_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${m.full_name}'s Facebook profile`}
                  className="group glass-strong rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:scale-[1.02] hover:shadow-elevated transition-all duration-300"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-emerald-gradient">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.full_name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const fb = img.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: m.photo_url ? "none" : "flex" }}
                      className="absolute inset-0 h-full w-full items-center justify-center text-white text-4xl sm:text-5xl font-display font-bold"
                    >
                      {m.full_name.charAt(0)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-2.5 sm:p-3 text-center">
                    <h3 className="font-display font-bold text-xs sm:text-sm leading-tight line-clamp-2">
                      {m.full_name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-primary font-medium mt-0.5 line-clamp-1">
                      {m.designation}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {m.category}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  value,
  suffix = "",
  label,
}: {
  icon: typeof Users;
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-gradient text-white items-center justify-center mb-3 shadow-glow">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl lg:text-4xl font-display font-bold text-gradient">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-sm font-semibold mt-1">{label}</div>
    </div>
  );
}
