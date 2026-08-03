import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  GraduationCap,
  HandHeart,
  HomeIcon,
  ShieldCheck,
  Snowflake,
  Stethoscope,
} from "lucide-react";
import { PageHero, StubBody } from "@/components/page-hero";
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

const activities = [
  {
    title: "Quality Education",
    bn: "শিক্ষা সহায়তা",
    description:
      "Empowering minds and building a better tomorrow through inclusive learning support.",
    image: educationImage,
    icon: GraduationCap,
  },
  {
    title: "Food Campaign",
    bn: "খাদ্য সহায়তা",
    description:
      "Nutritious meals and compassionate food support for underprivileged children and vulnerable communities.",
    image: foodImage,
    icon: HandHeart,
  },
  {
    title: "Free Medical Camp",
    bn: "বিনামূল্যে চিকিৎসা সেবা",
    description:
      "Accessible healthcare, free medicine, and community medical support during emergencies.",
    image: medicalImage,
    icon: Stethoscope,
  },
  {
    title: "Relief Campaign",
    bn: "ত্রাণ কার্যক্রম",
    description:
      "Rapid disaster response with food, essentials, and on-ground volunteer support for affected families.",
    image: reliefImage,
    icon: ShieldCheck,
  },
  {
    title: "Winter Aid",
    bn: "শীতবস্ত্র বিতরণ",
    description:
      "Distributing blankets, warm clothes, and care packages to families across northern Bangladesh every winter.",
    image: winterImage,
    icon: Snowflake,
  },
  {
    title: "Monthly Orphanage & Hifzkhana Meal Program",
    bn: "মাসিক এতিমখানা ও হিফজখানা খাবার প্রকল্প",
    description:
      "Providing daily nutritious meals to orphanages and Quran memorization centers every month.",
    image: orphanageMealImage,
    icon: HomeIcon,
  },
];

function ActivitiesPage() {
  return (
    <>
      <PageHero kicker="WHAT WE DO" title="Activities & Projects" bn="আমাদের কার্যক্রম" />
      <StubBody>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <motion.article
              key={activity.title}
              {...fade}
              transition={{ ...fade.transition, delay: index * 0.08 }}
              className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft"
            >
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="group relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-full lg:min-h-[320px] overflow-hidden bg-muted">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <p className="font-bn text-sm font-semibold text-primary">{activity.bn}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                    {activity.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </StubBody>
    </>
  );
}
