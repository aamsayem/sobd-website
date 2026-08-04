import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Users,
  HandHeart,
  MapPin,
  ArrowRight,
  Home as HomeIcon,
  GraduationCap,
  Snowflake,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Target,
  Eye,
  Quote,
  Sprout,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { getPublicCampaigns } from "@/lib/public-content.functions";
import heroImage from "@/assets/Hero.png";
import reliefImage from "@/assets/Activities — Relief.png";
import educationImage from "@/assets/Activities — Education.png";
import medicalImage from "@/assets/Activities — Medical.png";
import foodImage from "@/assets/Activities — Food.png";
import sokkhomImage from "@/assets/sokkhom-hero.png";
import winterImage from "@/assets/Activities — Winter.png";
import orphanageMealImage from "@/assets/Activities — Food Distribution.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SELFLESS ORGANIZATION BD — Standing with humanity, for the people" },
      {
        name: "description",
        content:
          "Join SELFLESS ORGANIZATION BD in serving humanity across Bangladesh — donate, volunteer, and create lasting impact.",
      },
      { property: "og:title", content: "SELFLESS ORGANIZATION BD" },
      { property: "og:description", content: "Standing with humanity, for the people." },
    ],
  }),
  component: Home,
});

const stats = [
  { icon: Users, value: 65, suffix: "+", label: "Active Volunteers" },
  { icon: HandHeart, value: 86, suffix: "+", label: "Campaigns" },
  { icon: Heart, value: 52000, suffix: "+", label: "People Helped" },
  { icon: MapPin, value: 38, suffix: "", label: "Upazilla Covered" },
];

const activities = [
  {
    img: reliefImage,
    icon: ShieldCheck,
    title: "Relief Campaign",
    desc: "Rapid response during floods, cyclones and humanitarian crises.",
  },
  {
    img: educationImage,
    icon: GraduationCap,
    title: "Education Support",
    desc: "Scholarships, books and learning centers for underprivileged children.",
  },
  {
    img: winterImage,
    icon: Snowflake,
    title: "Winter Aid",
    desc: "Distributing blankets and warm clothes to families every winter.",
  },
  {
    img: medicalImage,
    icon: Stethoscope,
    title: "Medical Support",
    desc: "Free medical camps and emergency healthcare for vulnerable groups.",
  },
  {
    img: foodImage,
    icon: HandHeart,
    title: "Food Distribution",
    desc: "Meal programs reaching families during Ramadan and crisis moments.",
  },
  {
    img: orphanageMealImage,
    icon: HomeIcon,
    title: "Monthly Orphanage & Hifzkhana Meal Program",
    desc: "Providing daily nutritious meals to orphanages and Quran memorization centers every month.",
  },
];

const testimonials = [
  {
    name: "Sadia Rahman",
    role: "Volunteer · Dhaka",
    quote: "Joining this family changed how I see purpose. Every weekend feels meaningful now.",
  },
  {
    name: "Md. Anwar Hossain",
    role: "Beneficiary · Sylhet",
    quote:
      "When the flood took everything, they came with food and hope. I cannot forget that night.",
  },
  {
    name: "Dr. Fariha Islam",
    role: "Medical Partner",
    quote:
      "The most disciplined volunteer team I've worked with. Transparency and heart in equal measure.",
  },
];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

type CampaignSummary = {
  id?: string;
  title: string;
  title_bn?: string | null;
  target_amount?: number | string | null;
  raised_amount?: number | string | null;
  status?: string | null;
  featured?: boolean | null;
  banner_url?: string | null;
};

function Home() {
  const campaignsFn = getPublicCampaigns;
  const { data: dbCampaigns } = useQuery({
    queryKey: ["public-campaigns"],
    queryFn: () => campaignsFn(),
  });
  const campaigns = ((dbCampaigns ?? []) as CampaignSummary[])
    .filter((c) => c.status === "active")
    .slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden pt-24 -mt-24">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="SELFLESS ORGANIZATION BD volunteers serving people in the community"
            className="h-full w-full object-cover object-[65%_center] sm:object-center"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-linear-to-r from-emerald-950/45 via-emerald-900/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-left"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white hero-badge-glass">
              <Sparkles className="h-3.5 w-3.5 text-accent" />A HUMANITARIAN ORGANIZATION
            </div>
            <h1 className="font-bn font-bold text-white text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-[-0.01em]">
              Beside the suffering people,
              <br />
              <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                with the conviction of fulfilling dreams.
              </span>
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-white/95 max-w-2xl leading-relaxed text-left">
              We are a community of volunteers serving the most vulnerable across Bangladesh — one
              meal, one classroom, one heartbeat at a time. Your hand makes the next story possible.
            </p>

            <div className="mt-10 flex flex-wrap justify-start gap-3">
              <Link
                to="/donate"
                className="group inline-flex items-center gap-2 bg-warm-gradient text-accent-foreground px-6 py-3.5 rounded-2xl font-semibold shadow-glow ring-1 ring-white/25 hover:scale-[1.03] active:scale-95 transition-transform"
              >
                <Heart className="h-4 w-4 fill-current" /> Donate Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center gap-2 hero-badge-glass text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Users className="h-4 w-4" /> Join as Volunteer
              </Link>
              <Link
                to="/activities"
                className="inline-flex items-center gap-2 text-white px-4 py-3.5 font-semibold hover:text-accent transition-colors text-shadow-hero-soft"
              >
                Explore Activities <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 mt-2 relative z-10">
        <motion.div
          {...fade}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 glass-strong rounded-3xl p-6 lg:p-8 shadow-elevated"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center px-4 py-3">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-gradient text-primary-foreground items-center justify-center mb-3 shadow-glow">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-3xl lg:text-4xl font-display font-bold text-gradient">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* URGENT CAMPAIGNS */}
      <section className="container mx-auto px-4 mt-32">
        <motion.div {...fade} className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" /> EMERGENCY
              APPEALS
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold">Urgent Campaigns</h2>
            <p className="text-muted-foreground mt-2">Causes that need your support right now.</p>
          </div>
          <Link
            to="/activities"
            className="text-sm font-semibold text-primary hover:gap-3 inline-flex items-center gap-2 transition-all"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {campaigns.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <HandHeart className="h-10 w-10 mx-auto text-primary/60 mb-3" />
            <h3 className="font-display font-bold text-xl">No Active Campaigns</h3>
            <p className="text-sm text-muted-foreground mt-2">
              New emergency appeals will appear here as soon as they launch.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c, i: number) => {
              const target = Number(c.target_amount) || 0;
              const raised = Number(c.raised_amount) || 0;
              const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
              const urgent = c.featured === true;
              return (
                <motion.article
                  key={c.id ?? i}
                  {...fade}
                  transition={{ ...fade.transition, delay: i * 0.1 }}
                  className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1"
                >
                  <div className="relative h-45 sm:h-50 md:h-55 lg:h-60 overflow-hidden rounded-t-3xl bg-muted">
                    {c.banner_url ? (
                      <img
                        src={c.banner_url}
                        alt={c.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-emerald-gradient" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span
                      className={`absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${urgent ? "bg-destructive text-destructive-foreground" : "glass-strong text-white"}`}
                    >
                      {urgent ? "Urgent" : "Active"}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg leading-snug">{c.title}</h3>
                    {c.title_bn && (
                      <p className="font-bn text-sm text-muted-foreground mt-1">{c.title_bn}</p>
                    )}

                    <div className="mt-5">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-emerald-gradient"
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="font-semibold">৳ {raised.toLocaleString()} raised</span>
                        <span className="text-muted-foreground">
                          of ৳ {target.toLocaleString()} · {pct}%
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/donate"
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-emerald-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition-shadow"
                    >
                      <Heart className="h-4 w-4 fill-current" /> Donate to this cause
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* SHOKKOM FOUNDATION FEATURED */}
      <section className="container mx-auto px-4 mt-32">
        <motion.div {...fade} className="relative overflow-hidden rounded-[2rem] shadow-elevated">
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-4/3 lg:aspect-auto min-h-90">
              <img
                src={sokkhomImage}
                alt="Shokkhom Foundation"
                loading="lazy"
                width={1600}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 glass-strong text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                <Sprout className="h-3.5 w-3.5" /> FEATURED PROJECT
              </div>
            </div>
            <div className="bg-card p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="font-display font-bold text-4xl lg:text-5xl leading-tight">
                SHOKKOM FOUNDATION
              </h2>
              <p className="text-sm font-semibold text-primary mt-2 tracking-wide">
                A PATH TO SELF-RELIANCE
              </p>
              <p className="text-muted-foreground mt-5 leading-relaxed">
                A long-term initiative to make financially struggling people self-reliant with
                one-time support — small businesses, rickshaws/vans, sewing machines, or grocery
                shops that build a permanent livelihood.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-7">
                {[
                  { n: 42, l: "Families empowered" },
                  { n: 18, l: "Active beneficiaries" },
                  { n: 96, suffix: "%", l: "Still self-reliant" },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gradient">
                      <AnimatedCounter value={s.n} suffix={s.suffix ?? "+"} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/sokkhom"
                  className="inline-flex items-center gap-2 bg-emerald-gradient text-primary-foreground px-5 py-3 rounded-xl font-semibold shadow-glow hover:scale-[1.03] transition-transform"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/sokkhom"
                  className="inline-flex items-center gap-2 glass-strong px-5 py-3 rounded-xl font-semibold hover:bg-primary/5 transition-colors"
                >
                  Apply for Support
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ABOUT / MISSION */}
      <section className="container mx-auto px-4 mt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5" /> ABOUT US
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold leading-[1.1]">
              A movement of <span className="text-gradient">selfless hands</span> across Bangladesh.
            </h2>
            <p className="font-bn text-lg text-muted-foreground mt-5 leading-relaxed">
              নিঃস্বার্থ সংগঠন বাংলাদেশ — একটি অরাজনৈতিক, অলাভজনক স্বেচ্ছাসেবী সংগঠন। ২০২০ সাল থেকে
              আমরা মানুষের দুর্যোগে, শিক্ষায়, চিকিৎসায় এবং প্রতিদিনের সংগ্রামে পাশে আছি।
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Target,
                  t: "Our Mission",
                  bn: "আমাদের লক্ষ্য",
                  d: "To stand beside every Bangladeshi in their hardest moments — with dignity, transparency, and unwavering presence.",
                },
                {
                  icon: Eye,
                  t: "Our Vision",
                  bn: "আমাদের স্বপ্ন",
                  d: "A Bangladesh where no one fights crisis, hunger, or illness alone.",
                },
                {
                  icon: ShieldCheck,
                  t: "Our Values",
                  bn: "আমাদের মূল্যবোধ",
                  d: "Transparency · Empathy · Accountability · Service before self.",
                },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-emerald-gradient group-hover:text-primary-foreground transition-all">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {v.t}{" "}
                      <span className="font-bn text-muted-foreground text-sm font-normal">
                        · {v.bn}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{v.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fade}
            transition={{ ...fade.transition, delay: 0.15 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <img
                src={foodImage}
                alt="Food support activity"
                loading="lazy"
                width={1024}
                height={768}
                className="rounded-3xl object-cover aspect-[3/4] shadow-soft"
              />
              <div className="space-y-4 pt-10">
                <img
                  src={educationImage}
                  alt="Education support activity"
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="rounded-3xl object-cover aspect-square shadow-soft"
                />
                <img
                  src={medicalImage}
                  alt="Medical support activity"
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="rounded-3xl object-cover aspect-[4/3] shadow-soft"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 glass-strong rounded-2xl p-5 max-w-55 shadow-elevated">
              <div className="text-3xl font-bold text-gradient">Since 2020</div>
              <div className="text-xs text-muted-foreground mt-1">
                years of unbroken service to communities
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="container mx-auto px-4 mt-32">
        <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold">What we do</h2>
          <p className="font-bn text-muted-foreground mt-3">
            আমাদের নিয়মিত কার্যক্রম — প্রতিটি কাজ একটি জীবনের গল্প
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((a, i) => (
            <motion.div
              key={i}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.08 }}
              className="group relative rounded-3xl overflow-hidden aspect-4/3 shadow-soft hover:shadow-elevated transition-all"
            >
              <img
                src={a.img}
                alt={a.title}
                loading="lazy"
                width={1024}
                height={768}
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="h-11 w-11 rounded-xl bg-warm-gradient text-accent-foreground flex items-center justify-center mb-3 shadow-glow">
                  <a.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-xl">{a.title}</h3>

                <p className="text-sm opacity-80 mt-2 max-h-0 group-hover:max-h-32 overflow-hidden transition-all duration-500">
                  {a.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 mt-32">
        <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold">Voices of impact</h2>
          <p className="font-bn text-muted-foreground mt-3">যাদের সাথে আমরা পথ চলেছি</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.1 }}
              className="glass-strong rounded-3xl p-7 relative"
            >
              <Quote className="h-8 w-8 text-primary/30 absolute top-5 right-5" />
              <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
              <footer className="mt-5 flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="h-11 w-11 rounded-full bg-emerald-gradient text-primary-foreground flex items-center justify-center font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 mt-32">
        <motion.div
          {...fade}
          className="relative overflow-hidden rounded-4xl bg-hero text-white p-10 lg:p-16 shadow-elevated"
        >
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow opacity-30 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Your kindness, <br />
                someone's tomorrow.
              </h2>
              <p className="font-bn text-lg opacity-90 mt-4 max-w-lg">
                আপনার একটি ছোট অনুদান একটি পরিবারের একদিনের ভাত হতে পারে, একটি শিশুর বইয়ের পাতা হতে
                পারে।
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/donate"
                className="bg-warm-gradient text-accent-foreground px-7 py-4 rounded-2xl font-semibold shadow-glow hover:scale-[1.03] transition-transform inline-flex items-center gap-2"
              >
                <Heart className="h-4 w-4 fill-current" /> Donate Now
              </Link>
              <Link
                to="/volunteer"
                className="glass-strong text-white px-7 py-4 rounded-2xl font-semibold hover:bg-white/15 transition-colors inline-flex items-center gap-2"
              >
                <Users className="h-4 w-4" /> Become Volunteer
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
