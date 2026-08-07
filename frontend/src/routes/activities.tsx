import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Loader2 } from "lucide-react";
import { PageHero, StubBody } from "@/components/page-hero";
import { getPublicActivities } from "@/lib/public-content.functions";
import educationImage from "@/assets/Activities — Education.png";
import foodImage from "@/assets/Activities — Food.png";
import medicalImage from "@/assets/Activities — Medical.png";
import reliefImage from "@/assets/Activities — Relief.png";
import winterImage from "@/assets/Activities — Winter.png";
import orphanageMealImage from "@/assets/Activities — Food Distribution.png";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content:
          "Explore the key humanitarian activities of SELFLESS ORGANIZATION BD, including relief, food, education, and medical support.",
      },
      { property: "og:title", content: "Activities — SELFLESS ORGANIZATION BD" },
      {
        property: "og:description",
        content:
          "Relief campaigns, food support, quality education, and free medical initiatives by SELFLESS ORGANIZATION BD.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const fallbacks: Record<string, string> = {
  "Quality Education": educationImage,
  "Food Campaign": foodImage,
  "Free Medical Camp": medicalImage,
  "Relief Campaign": reliefImage,
  "Winter Aid": winterImage,
  "Monthly Orphanage & Hifzkhana Meal Program": orphanageMealImage,
};

interface ActivityItem {
  id?: string;
  title: string;
  title_bn?: string | null;
  bn?: string | null;
  description?: string | null;
  image_url?: string | null;
  icon_name?: string;
  sort_order?: number;
  published?: boolean;
  is_active?: boolean;
}

function getActivityIcon(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName];
  if (iconName === "Home" || iconName === "HomeIcon") {
    return LucideIcons.HomeIcon || LucideIcons.Home || LucideIcons.HandHeart;
  }
  return IconComponent || LucideIcons.HandHeart;
}

function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-activities"],
    queryFn: () => getPublicActivities(),
  });

  const list = ((data ?? []) as ActivityItem[]).filter(
    (activity) => activity.published !== false && activity.is_active !== false,
  );

  return (
    <>
      <PageHero kicker="WHAT WE DO" title="Activities & Projects" bn="আমাদের কার্যক্রম" />
      <StubBody>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {list.map((activity, index) => {
              const Icon = getActivityIcon(activity.icon_name || "");
              const displayImage = activity.image_url || fallbacks[activity.title] || foodImage;
              return (
                <motion.article
                  key={activity.id || activity.title}
                  {...fade}
                  transition={{ ...fade.transition, delay: index * 0.08 }}
                  className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft"
                >
                  <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="group relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-full lg:min-h-[320px] overflow-hidden bg-muted">
                      <img
                        src={displayImage}
                        alt={activity.title}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-bn text-sm font-semibold text-primary">
                        {activity.title_bn || activity.bn}
                      </p>
                      <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                        {activity.title}
                      </h2>
                      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </StubBody>
    </>
  );
}
