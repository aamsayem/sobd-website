import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Landmark, Target, Eye } from "lucide-react";
import { PageHero, StubBody } from "@/components/page-hero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content:
          "A youth-led humanitarian organization transforming compassion into meaningful action across Bangladesh through education, healthcare, livelihood support, and disaster response.",
      },
      { property: "og:title", content: "About — SELFLESS ORGANIZATION BD" },
      {
        property: "og:description",
        content:
          "Learn about the bio, mission, vision, and journey of SELFLESS ORGANIZATION BD — a humanitarian organization.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const sections = [
  {
    icon: HeartHandshake,
    title: "Bio",
    body: "A youth-led humanitarian organization dedicated to transforming compassion into meaningful action across Bangladesh. Through free education, healthcare, livelihood development, sustainable employment, disaster response, and emergency relief, SELFLESS ORGANIZATION BD works to improve the lives of vulnerable communities and promote long-term social development.",
  },
  {
    icon: Landmark,
    title: "Who We Are",
    body: "Founded in 2020, SELFLESS ORGANIZATION BD began as a small volunteer initiative driven by one simple belief: organized compassion can change lives.\n\nThe journey started with a group of young volunteers serving meals at orphanages and supporting underprivileged children. Today, the organization works in multiple sectors including poverty alleviation, education, healthcare, educational material distribution, winter clothing distribution, disaster response, sustainable employment, human rights, environmental sustainability, and youth empowerment.\n\nThrough integrated community development programs, we help individuals overcome social and economic challenges while building a stronger, more self-reliant Bangladesh.",
  },
  {
    icon: Target,
    title: "Mission",
    body: "To stand beside people in times of need by promoting humanity, compassion, transparency, accountability, and volunteerism.\n\nWe are committed to creating sustainable change through education, healthcare, food assistance, disaster response, rehabilitation, and employment-based initiatives that empower disadvantaged communities to live with dignity.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "To build a compassionate, inclusive, and self-reliant Bangladesh where every individual receives support in times of need and has equal opportunities to realize their potential.\n\nWe aspire to establish volunteerism as a driving force for positive social transformation and contribute to a future free from poverty and discrimination.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero kicker="A HUMANITARIAN ORGANIZATION" title="SELFLESS ORGANIZATION BD" />
      <StubBody>
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-soft sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {section.title}
                  </h2>
                  {section.body.split("\n\n").map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-muted-foreground">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </StubBody>
    </>
  );
}
