import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Sprout,
  Heart,
  ArrowRight,
  Target,
  CheckCircle2,
  ShieldCheck,
  Quote,
  Upload,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { api } from "@/lib/api";
import { getPublicSettings } from "@/lib/public-content.functions";
import sokkhomImage from "@/assets/sokkhom-hero.png";
import foodImage from "@/assets/Activities — Food.png";
import educationImage from "@/assets/Activities — Education.png";
import medicalImage from "@/assets/Activities — Medical.png";

export const Route = createFileRoute("/sokkhom")({
  head: () => ({
    meta: [
      { title: "Shokkhom Foundation — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content:
          "Shokkhom Foundation is our long-term initiative empowering struggling families with sustainable livelihoods — small businesses, sewing machines, rickshaws and more.",
      },
      { property: "og:title", content: "Shokkhom Foundation — A path to self-reliance" },
      {
        property: "og:description",
        content:
          "Helping families become permanently self-reliant through sustainable livelihood support.",
      },
    ],
    links: [{ rel: "canonical", href: "/sokkhom" }],
  }),
  component: Sokkhom,
});

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const examples = [
  { t: "Small business setup", bn: "ছোট ব্যবসা" },
  { t: "Rickshaw / Van support", bn: "রিকশা / ভ্যান" },
  { t: "Sewing machine", bn: "সেলাই মেশিন" },
  { t: "Grocery shop", bn: "মুদি দোকান" },
  { t: "Educational support", bn: "শিক্ষা সহায়তা" },
  { t: "Income source creation", bn: "আয়ের উৎস" },
];

const stories = [
  {
    name: "Rahima Begum",
    role: "Sewing machine support · Jessore",
    before: "Single mother of three, no stable income, surviving on day labour.",
    after: "Now runs a small tailoring service from home, earning ৳12,000+/month.",
  },
  {
    name: "Md. Karim",
    role: "Rickshaw support · Dhaka",
    before: "Renting a rickshaw, half his earnings going to the owner every day.",
    after: "Owns his rickshaw — full earnings, saving for his daughter's school.",
  },
  {
    name: "Salma Akter",
    role: "Grocery shop · Mymensingh",
    before: "Husband ill, no income, two children out of school.",
    after: "Runs a neighbourhood grocery shop; both children back in school.",
  },
];

const expense = [
  { label: "Direct beneficiary support", pct: 78, color: "bg-emerald-gradient" },
  { label: "Field verification & training", pct: 12, color: "bg-warm-gradient" },
  { label: "Logistics & follow-up", pct: 7, color: "bg-primary/60" },
  { label: "Administration", pct: 3, color: "bg-muted-foreground/40" },
];

function Sokkhom() {
  const raised = 14.2;
  const target = 25;
  const pct = Math.round((raised / target) * 100);

  const { data: dbSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => getPublicSettings(),
  });

  const settingsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(dbSettings)) {
      dbSettings.forEach((item: any) => {
        map[item.key] = item.value;
      });
    }
    return map;
  }, [dbSettings]);

  const displayHeroImage = settingsMap.sokkhom_hero_image || sokkhomImage;
  const bottomImages = [
    settingsMap.sokkhom_bottom_img_1 || sokkhomImage,
    settingsMap.sokkhom_bottom_img_2 || foodImage,
    settingsMap.sokkhom_bottom_img_3 || educationImage,
    settingsMap.sokkhom_bottom_img_4 || medicalImage,
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-24 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={displayHeroImage}
            alt="Shokkhom Foundation"
            className="h-full w-full object-cover"
            width={1600}
            height={1000}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-emerald-900/40" />
        </div>
        <div className="container mx-auto px-4 relative">
          <Link to="/" className="text-white/80 hover:text-white text-sm">
            ← Back to home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mt-6 text-white"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold mb-5">
              <Sprout className="h-3.5 w-3.5 text-accent" /> FEATURED LONG-TERM PROJECT
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-7xl leading-[1.05]">
              SHOKKOM FOUNDATION
            </h1>
            <p className="mt-3 text-xl opacity-90">A path from dependence to dignity.</p>
            <p className="mt-5 text-lg opacity-90 max-w-2xl leading-relaxed">
              One-time support that changes a lifetime. We don't just feed families — we give them
              the tools to stand on their own feet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#donate"
                className="inline-flex items-center gap-2 bg-warm-gradient text-accent-foreground px-6 py-3.5 rounded-2xl font-semibold shadow-glow hover:scale-[1.03] transition-transform"
              >
                <Heart className="h-4 w-4 fill-current" /> Donate to Shokkhom Foundation
              </a>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 glass-strong text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/15 transition-colors"
              >
                Apply for Support <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <motion.div
          {...fade}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 glass-strong rounded-3xl p-6 lg:p-8 shadow-elevated"
        >
          {[
            { i: Users, n: 42, s: "+", l: "Families empowered" },
            { i: TrendingUp, n: 96, s: "%", l: "Still self-reliant" },
            { i: Sprout, n: 18, s: "+", l: "Active beneficiaries" },
            { i: ShieldCheck, n: 12, s: "+", l: "Districts reached" },
          ].map((s, i) => (
            <div key={i} className="text-center px-4 py-3">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-gradient text-primary-foreground items-center justify-center mb-3 shadow-glow">
                <s.i className="h-5 w-5" />
              </div>
              <div className="text-3xl lg:text-4xl font-display font-bold text-gradient">
                <AnimatedCounter value={s.n} suffix={s.s} />
              </div>
              <div className="mt-1 text-sm font-semibold">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* DETAILS */}
      <section className="container mx-auto px-4 mt-24">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div {...fade}>
            <h2 className="font-display text-3xl lg:text-4xl font-bold">
              How Shokkhom Foundation works
            </h2>
            <p className="text-muted-foreground mt-3">Our process, step by step</p>
            <ol className="mt-8 space-y-5">
              {[
                ["Application", "Anyone struggling can apply through our form or local volunteer."],
                [
                  "Field verification",
                  "Our team visits the family to verify need and feasibility.",
                ],
                ["Tailored support", "We provide the right tool — a shop, a machine, a rickshaw."],
                [
                  "Training & follow-up",
                  "We stay in touch for 12 months to ensure long-term success.",
                ],
              ].map(([t, d], i) => (
                <li key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{t}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.15 }}>
            <div className="glass-strong rounded-3xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-xl bg-emerald-gradient text-primary-foreground flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold">Eligibility</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Families below the poverty line with no stable income source.",
                  "Widows, single mothers, persons with disabilities — prioritised.",
                  "Willingness and physical ability to run the proposed livelihood.",
                  "Verified by at least one local reference or community leader.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong rounded-3xl p-7 mt-5">
              <h3 className="font-display text-2xl font-bold mb-4">Examples of support</h3>
              <div className="grid grid-cols-2 gap-3">
                {examples.map((e, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="font-semibold text-sm">{e.t}</div>
                    <div className="font-bn text-xs text-muted-foreground mt-0.5">{e.bn}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DONATION */}
      <section id="donate" className="container mx-auto px-4 mt-24">
        <motion.div
          {...fade}
          className="relative overflow-hidden rounded-[2rem] bg-hero text-white p-8 lg:p-14 shadow-elevated"
        >
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-warm-gradient opacity-25 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold">
                Fund a family's independence
              </h2>
              <p className="font-bn opacity-90 mt-3 max-w-lg">
                আপনার একটি অনুদান একটি পরিবারের সারাজীবনের জন্য আয়ের পথ তৈরি করতে পারে।
              </p>
              <div className="mt-7">
                <div className="h-3 rounded-full bg-white/15 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-warm-gradient"
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm opacity-90">
                  <span className="font-semibold">৳ {raised}L raised</span>
                  <span>
                    of ৳ {target}L · {pct}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[1000, 5000, 10000, 25000].map((a) => (
                <button
                  key={a}
                  className="glass-strong text-white py-3 rounded-xl font-semibold hover:bg-white/15 transition-colors"
                >
                  ৳ {a.toLocaleString()}
                </button>
              ))}
              <Link
                to="/donate"
                className="bg-warm-gradient text-accent-foreground py-3.5 rounded-xl font-bold shadow-glow text-center hover:scale-[1.02] transition-transform"
              >
                Donate Now
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* APPLY */}
      <section id="apply" className="container mx-auto px-4 mt-24">
        <motion.div {...fade} className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold">Apply for Support</h2>
            <p className="font-bn text-muted-foreground mt-2">সহায়তার জন্য আবেদন করুন</p>
          </div>
          <ApplyForm />
        </motion.div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="container mx-auto px-4 mt-24">
        <motion.div {...fade} className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold">Stories of self-reliance</h2>
          <p className="font-bn text-muted-foreground mt-2">যাদের জীবন বদলেছে</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <motion.article
              key={i}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.1 }}
              className="glass-strong rounded-3xl p-7 relative"
            >
              <Quote className="h-7 w-7 text-primary/30 absolute top-5 right-5" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-emerald-gradient text-primary-foreground flex items-center justify-center font-bold">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.role}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Before
                  </div>
                  <p className="text-foreground/80 mt-1">{s.before}</p>
                </div>
                <div className="pt-3 border-t border-border/60">
                  <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                    After
                  </div>
                  <p className="text-foreground/90 mt-1">{s.after}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="container mx-auto px-4 mt-24">
        <motion.div
          {...fade}
          className="grid lg:grid-cols-2 gap-10 items-center bg-card rounded-3xl p-8 lg:p-12 shadow-soft"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> TRANSPARENCY
            </div>
            <h2 className="font-display text-3xl font-bold">Where every taka goes</h2>
            <p className="text-muted-foreground mt-3 text-sm">
              Independently audited. Reported publicly every quarter.
            </p>
          </div>
          <div className="space-y-4">
            {expense.map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-medium">
                  <span>{e.label}</span>
                  <span>{e.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${e.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className={`h-full ${e.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* GALLERY */}
      <section className="container mx-auto px-4 mt-24 mb-8">
        <motion.div {...fade} className="text-center mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-bold">From the field</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {bottomImages.map((src, i) => (
            <motion.img
              key={i}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.08 }}
              src={src}
              alt="Sokkhom project field activity"
              loading="lazy"
              width={800}
              height={800}
              className="rounded-2xl object-cover aspect-square shadow-soft hover:shadow-elevated transition-shadow"
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      applicant_name: String(fd.get("name") || "").trim(),
      father_name: String(fd.get("father_name") || "").trim() || null,
      mother_name: String(fd.get("mother_name") || "").trim() || null,
      family_information: String(fd.get("family") || "").trim(),
      income: fd.get("income") ? Number(fd.get("income")) : 0,
      occupation: String(fd.get("occupation") || "").trim(),
      reason: String(fd.get("support") || "").trim(),
    };
    const { toast } = await import("sonner");

    if (
      !payload.applicant_name ||
      !payload.family_information ||
      !payload.occupation ||
      !payload.reason
    ) {
      toast.error("Please fill all required application fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("submissions/sokkhom-applications/", payload);
      toast.success("Application submitted");
      setSubmitted(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Submission failed";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-strong rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold">Application received</h3>
        <p className="text-muted-foreground mt-2">
          Our team will contact you soon. আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-6 lg:p-8 shadow-soft space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" name="name" required />
        <Field label="Father's name" name="father_name" />
        <Field label="Mother's name" name="mother_name" />
        <Field label="Occupation" name="occupation" required />
        <Field label="Monthly income (৳)" name="income" type="number" />
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Family information
          </label>
          <textarea
            name="family"
            rows={3}
            required
            className="mt-1.5 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Reason for support
          </label>
          <textarea
            name="support"
            rows={2}
            required
            className="mt-1.5 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-gradient text-primary-foreground py-3.5 rounded-xl font-bold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
        {required && " *"}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
