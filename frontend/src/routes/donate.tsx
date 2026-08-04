import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  Copy,
  Check,
  Smartphone,
  Landmark,
  Shield,
  Users,
  HandHeart,
  MapPin,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { uploadDonationScreenshot } from "@/lib/media.functions";
import { getPublicCampaigns } from "@/lib/public-content.functions";
import { getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content: "আপনার অনুদান বদলে দিতে পারে একটি জীবন — bKash, Nagad, Rocket, Bank Transfer.",
      },
    ],
  }),
  component: DonatePage,
});

const mobileChannels = [
  {
    name: "বিকাশ",
    english: "bKash",
    number: "+880 1856 510245",
    accent: "from-pink-500 to-rose-500",
    short: "bKash",
  },
  {
    name: "নগদ",
    english: "Nagad",
    number: "+880 1856 510245",
    accent: "from-orange-500 to-amber-500",
    short: "Nagad",
  },
  {
    name: "রকেট",
    english: "Rocket",
    number: "+880 1856 510245",
    accent: "from-violet-500 to-purple-600",
    short: "Rocket",
  },
];

const bankDetails = [
  { label: "A/C Name", value: "SELFLESS ORGANIZATION BD" },
  { label: "A/C No", value: "20507770230836450", highlight: true },
  { label: "Branch", value: "156 - Lohagara Branch, Chattogram" },
  { label: "Routing No", value: "125270607" },
  { label: "Swift Code", value: "IBBLBDDHXXX", highlight: true },
];

const transparencyStats = [
  { icon: HandHeart, value: "৳ 1.2Cr+", label: "Total Raised" },
  { icon: Sparkles, value: "12", label: "Ongoing Campaigns" },
  { icon: Users, value: "52,000+", label: "Beneficiaries Supported" },
  { icon: MapPin, value: "38", label: "Upazilas Covered" },
];

const faqs = [
  {
    q: "How do I donate?",
    a: "You can donate via bKash, Nagad, Rocket (Send Money to the numbers above) or through a direct bank transfer to our Islami Bank account. After sending, please fill out the confirmation form so we can issue a receipt.",
  },
  {
    q: "How is my donation used?",
    a: "100% of your contribution goes to our active campaigns — relief, food, medical, education, winter aid and the Shokkhom Foundation self-reliance project. Operational costs are covered separately by our volunteer team.",
  },
  {
    q: "Can I donate for a specific project?",
    a: "Yes. Mention the project name (e.g. Shokkhom Foundation, Winter Aid, Sylhet Flood Relief) in the additional note field of the confirmation form and we will allocate the funds accordingly.",
  },
  {
    q: "How do I verify my donation?",
    a: "Every donation is logged and published in our public reports. After we receive your transaction, you will get a confirmation message and a receipt against your transaction ID.",
  },
];

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Copy failed");
        }
      }}
      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-white/80 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function DonationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState("general-donation");
  const campaignsFn = getPublicCampaigns;
  const { data: campaignsData } = useQuery({
    queryKey: ["public-campaigns", "donation-form"],
    queryFn: () => campaignsFn(),
  });
  const campaigns = Array.isArray(campaignsData)
    ? campaignsData.filter((campaign) => campaign?.status === "active")
    : [];
  const uploadScreenshot = uploadDonationScreenshot;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const amount = String(fd.get("amount") || "").trim();
    const method = String(fd.get("method") || "").trim();
    const trx = String(fd.get("trx") || "").trim();
    const campaign = String(fd.get("campaign") || campaignId || "").trim();
    const file = fd.get("screenshot") as File | null;

    if (!name || !phone || !amount || !method || !trx || !campaign) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!(Number(amount) > 0)) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    const acceptedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    if (file && file.size > 0) {
      if (!acceptedTypes.includes(file.type.toLowerCase())) {
        toast.error("Only image files are allowed for screenshot uploads.");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error("Screenshot must be 12 MB or smaller.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let proofScreenshotId: number | null = null;
      if (file && file.size > 0) {
        try {
          const fileReader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = () => reject(new Error("Could not read screenshot"));
            fileReader.readAsDataURL(file);
          });
          const base64 = dataUrl.split(",")[1];
          const res = await uploadScreenshot({
            data: {
              folder: "donations/screenshots",
              filename: file.name,
              contentType: file.type || "image/jpeg",
              base64,
            },
          });
          proofScreenshotId = Number(res.id);
        } catch (uploadError: unknown) {
          console.error("Screenshot upload failed:", uploadError);
          toast.error(
            getErrorMessage(uploadError, "Screenshot upload failed — submitting without image."),
          );
        }
      }

      try {
        await api.post("submissions/donation-requests/", {
          donor_name: name,
          phone,
          amount: Number(amount),
          payment_method: method,
          transaction_id: trx,
          campaign,
          proof_screenshot: proofScreenshotId,
        });
      } catch (error: unknown) {
        console.error("Donation submit error:", error);
        const msg =
          error instanceof Error ? error.message : "Could not submit donation. Please try again.";
        toast.error(msg);
        return;
      }

      form.reset();
      setFileName(null);
      setDone(true);
      toast.success("Donation information submitted. Thank you!");
    } catch (error: unknown) {
      console.error("Donation submit exception:", error);
      toast.error(getErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="glass-strong rounded-3xl p-8 lg:p-10 shadow-elevated text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-gradient text-primary-foreground grid place-items-center shadow-glow">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">Thank you, truly.</h3>
        <p className="text-muted-foreground mt-2">
          Your donation will change a life. We will get in touch shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setFileName(null);
          }}
          className="mt-6 inline-flex items-center gap-2 text-primary font-semibold"
        >
          Submit another <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-strong rounded-3xl p-7 lg:p-9 shadow-elevated space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Donor Name *" name="name" placeholder="Full name" required />
        <Field label="Phone Number *" name="phone" placeholder="01XXXXXXXXX" required type="tel" />
        <Field
          label="Donation Amount (৳) *"
          name="amount"
          placeholder="500"
          required
          type="number"
          min={1}
        />
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
            Campaign *
          </label>
          <select
            name="campaign"
            required
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full rounded-xl border border-primary/20 bg-white/80 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="general-donation">General Donation · সাধারণ অনুদান</option>
            {campaigns.map((campaign: { id?: string; title: string; title_bn?: string | null }) => (
              <option key={campaign.id ?? campaign.title} value={campaign.id ?? ""}>
                {campaign.title_bn ? `${campaign.title} · ${campaign.title_bn}` : campaign.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
            Payment Method *
          </label>
          <select
            name="method"
            required
            defaultValue=""
            className="w-full rounded-xl border border-primary/20 bg-white/80 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="" disabled>
              Select method
            </option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <Field label="Transaction ID *" name="trx" placeholder="e.g. 8N7A2X9K1Z" required />

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
          Donation Screenshot{" "}
          <span className="text-muted-foreground/70 normal-case tracking-normal">(Optional)</span>
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer rounded-xl border border-dashed border-primary/30 bg-white/60 px-4 py-3 text-sm hover:bg-white/80 transition-colors">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            {fileName || "Upload screenshot (optional)"}
          </span>
          <span className="text-xs font-semibold text-primary">Choose</span>
          <input
            type="file"
            name="screenshot"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-warm-gradient text-accent-foreground py-4 rounded-2xl font-bold inline-flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-60"
      >
        <Heart className="h-5 w-5 fill-current" />
        {submitting ? "Submitting..." : "Submit Donation Information"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
        {label}
      </label>
      <input
        name={name}
        {...rest}
        className="w-full rounded-xl border border-primary/20 bg-white/80 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-primary/15 bg-white/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

function DonatePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-50 via-white to-emerald-100/60" />
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ backgroundImage: "var(--gradient-radial)" }}
        />
        <div className="container mx-auto px-4 py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 glass-clear rounded-full px-4 py-2 text-xs font-semibold text-primary mb-5">
              <Shield className="h-3.5 w-3.5" /> 100% Transparent · Receipts Issued
            </div>
            <h1 className="font-bn font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-foreground">
              আপনার অনুদান বদলে দিতে পারে <span className="text-gradient">একটি জীবন</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every taka you send fuels meals, medicine, education and dignity for someone who needs
              it most. Choose any payment method below — it takes less than a minute.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#methods"
                className="inline-flex items-center gap-2 bg-warm-gradient text-accent-foreground px-6 py-3.5 rounded-2xl font-semibold shadow-glow hover:scale-[1.03] transition-transform"
              >
                <Heart className="h-4 w-4 fill-current" /> Proceed to Donate
              </a>
              <a
                href="#confirm"
                className="inline-flex items-center gap-2 glass-strong px-6 py-3.5 rounded-2xl font-semibold text-foreground hover:bg-white/60 transition-colors"
              >
                Confirm a Donation
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK METHODS */}
      <section id="methods" className="container mx-auto px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold">Quick Donation Methods</h2>
            <p className="font-bn text-muted-foreground mt-2">
              যেকোনো একটি মাধ্যমে সহজেই অনুদান পাঠান
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileChannels.map((m) => (
              <div
                key={m.english}
                className="glass-strong rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-shadow"
              >
                <div
                  className={`h-11 w-11 rounded-xl bg-linear-to-br ${m.accent} text-white grid place-items-center shadow-glow`}
                >
                  <Smartphone className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <span className="font-bn">{m.name}</span> · {m.english}
                </p>
                <p className="mt-1 font-bold text-lg tracking-wide break-all">{m.number}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">Send Money</span>
                  <CopyButton value={m.number.replace(/\s/g, "")} />
                </div>
              </div>
            ))}
            <div className="glass-strong rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-shadow">
              <div className="h-11 w-11 rounded-xl bg-emerald-gradient text-primary-foreground grid place-items-center shadow-glow">
                <Landmark className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Bank Transfer
              </p>
              <p className="mt-1 font-bold text-lg">Islami Bank BD</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">See full details ↓</span>
                <a
                  href="#bank"
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1"
                >
                  View <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* How to pay */}
          <div className="mt-6 rounded-2xl bg-emerald-50/70 border border-primary/15 p-5 text-sm">
            <p className="font-semibold mb-2">How to make a mobile payment:</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Open your bKash / Nagad / Rocket app.</li>
              <li>
                Choose <span className="font-semibold text-foreground">Send Money</span>.
              </li>
              <li>Enter our number above and the amount.</li>
              <li>
                Complete the transaction and keep your{" "}
                <span className="font-semibold text-foreground">Transaction ID</span>.
              </li>
              <li>Submit it through the confirmation form below.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* BANK DETAILS */}
      <section id="bank" className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto glass-strong rounded-3xl p-7 lg:p-9 shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-gradient text-primary-foreground grid place-items-center shadow-glow">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Bank Transfer
              </p>
              <h3 className="font-display font-bold text-xl sm:text-2xl">Direct Bank Donation</h3>
            </div>
          </div>

          <div className="mt-6 divide-y divide-primary/10 rounded-2xl border border-primary/15 bg-white/70 overflow-hidden">
            {bankDetails.map((b) => (
              <div
                key={b.label}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {b.label}
                  </p>
                  <p
                    className={`mt-0.5 font-semibold wrap-break-word ${b.highlight ? "text-primary text-lg tracking-wide" : "text-foreground"}`}
                  >
                    {b.value}
                  </p>
                </div>
                {(b.label === "A/C No" || b.label === "Swift Code") && (
                  <CopyButton value={b.value} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIRMATION FORM */}
      <section id="confirm" className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl lg:text-4xl font-bold">Donation Confirmation</h2>
            <p className="font-bn text-muted-foreground mt-2">
              অনুদান পাঠানোর পর নিচের ফর্মটি পূরণ করুন
            </p>
          </div>
          <DonationForm />
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-3">
              <Shield className="h-3.5 w-3.5" /> TRANSPARENCY
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold">
              Your trust, accounted for.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 glass-strong rounded-3xl p-6 lg:p-8 shadow-elevated">
            {transparencyStats.map((s, i) => (
              <div key={i} className="text-center px-4 py-3">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-gradient text-primary-foreground items-center justify-center mb-3 shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-display font-bold text-gradient">
                  {s.value}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 text-primary font-semibold"
            >
              See full financial reports <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* THANK YOU */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto glass-strong rounded-3xl p-10 text-center shadow-elevated">
          <Heart className="mx-auto h-10 w-10 text-primary fill-primary" />
          <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold">
            Thank you for standing with us.
          </h2>
          <p className="font-bn text-muted-foreground mt-3 leading-relaxed">
            আপনার মতো মানুষেরাই আমাদের শক্তি। প্রতিটি অনুদান, প্রতিটি দোয়া আমাদের চলার পথ আলোকিত
            করে। ধন্যবাদ — মানবতার পাশে থাকার জন্য।
          </p>
        </div>
      </section>
    </>
  );
}
