import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, Heart, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { api } from "@/lib/api";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Registration — SELFLESS ORGANIZATION BD" },
      {
        name: "description",
        content:
          "Join SELFLESS ORGANIZATION BD as a volunteer. Register online and become part of our humanitarian mission.",
      },
    ],
  }),
  component: VolunteerPage,
});

const DRAFT_KEY = "sobd_volunteer_draft";

type Form = {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  nid: string;
  bloodGroup: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  presentAddress: string;
  permanentAddress: string;
  district: string;
  upazilla: string;
  education: string;
  institution: string;
  profession: string;
  skills: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability: string;
  interestAreas: string[];
  motivation: string;
  reference: string;
  agree: boolean;
};

const empty: Form = {
  fullName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "",
  nid: "",
  bloodGroup: "",
  email: "",
  phone: "",
  whatsapp: "",
  facebook: "",
  presentAddress: "",
  permanentAddress: "",
  district: "",
  upazilla: "",
  education: "",
  institution: "",
  profession: "",
  skills: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  availability: "",
  interestAreas: [],
  motivation: "",
  reference: "",
  agree: false,
};

const interestOptions = [
  "Relief Campaign",
  "Food Distribution",
  "Education Support",
  "Medical Support",
  "Winter Aid",
  "Shokkhom Foundation",
  "Fundraising",
  "Event Management",
  "Social Media",
];

const steps = [
  { title: "Personal Information", bn: "ব্যক্তিগত তথ্য" },
  { title: "Contact & Address", bn: "যোগাযোগ ও ঠিকানা" },
  { title: "Education & Profession", bn: "শিক্ষা ও পেশা" },
  { title: "Interest & Commitment", bn: "আগ্রহ ও অঙ্গীকার" },
];

function VolunteerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...empty, ...JSON.parse(saved) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (val: string) => {
    setForm((f) => ({
      ...f,
      interestAreas: f.interestAreas.includes(val)
        ? f.interestAreas.filter((i) => i !== val)
        : [...f.interestAreas, val],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.fullName || !form.dob || !form.gender) {
        toast.error("Please fill name, date of birth and gender.");
        return false;
      }
    } else if (step === 1) {
      if (!form.phone || !form.presentAddress || !form.emergencyContactName || !form.emergencyContactPhone) {
        toast.error("Phone, present address and emergency contact are required.");
        return false;
      }
    } else if (step === 3) {
      if (form.interestAreas.length === 0 || !form.agree) {
        toast.error("Select at least one interest area and accept the commitment.");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await api.post("submissions/volunteer-applications/", {
        full_name: form.fullName,
        blood_group: form.bloodGroup || null,
        present_address: form.presentAddress || null,
        permanent_address: form.permanentAddress || null,
        education: form.education || null,
        occupation: form.profession || null,
        skills: form.skills || null,
        nid_or_birth_certificate: form.nid || null,
        emergency_contact_name: form.emergencyContactName || null,
        emergency_contact_phone: form.emergencyContactPhone || null,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Submission failed";
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    setSubmitted("Submitted");
    setForm(empty);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    toast.success("Application submitted successfully!");
  };

  if (submitted) {
    return (
      <>
        <PageHero kicker="JOIN US" title="Become a Volunteer" bn="স্বেচ্ছাসেবক হিসেবে যুক্ত হোন" />
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto glass-strong rounded-3xl p-10 text-center shadow-elevated"
          >
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-6">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold">Thank you for joining us!</h2>
            <p className="font-bn text-muted-foreground mt-2">
              ধন্যবাদ! আপনার নিবন্ধন গ্রহণ করা হয়েছে।
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
              Registration received
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Our team will review your application and reach out within 5–7 working days.
            </p>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero kicker="JOIN US" title="Become a Volunteer" bn="স্বেচ্ছাসেবক হিসেবে যুক্ত হোন" />
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex-1 flex items-center">
                <div
                  className={`h-9 w-9 rounded-full grid place-items-center text-sm font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${i < step ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Step {step + 1} of {steps.length}
            </div>
            <h2 className="font-display text-2xl font-bold mt-1">{steps[step].title}</h2>
            <p className="font-bn text-sm text-muted-foreground">{steps[step].bn}</p>
          </div>

          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={submit}
            className="glass-strong rounded-3xl p-6 sm:p-8 shadow-elevated space-y-5"
          >
            {step === 0 && (
              <>
                <Field
                  label="Full Name *"
                  value={form.fullName}
                  onChange={(v) => update("fullName", v)}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Father's Name"
                    value={form.fatherName}
                    onChange={(v) => update("fatherName", v)}
                  />
                  <Field
                    label="Mother's Name"
                    value={form.motherName}
                    onChange={(v) => update("motherName", v)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Date of Birth *"
                    type="date"
                    value={form.dob}
                    onChange={(v) => update("dob", v)}
                  />
                  <SelectField
                    label="Gender *"
                    value={form.gender}
                    onChange={(v) => update("gender", v)}
                    options={["Male", "Female", "Other"]}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="NID / Birth Cert."
                    value={form.nid}
                    onChange={(v) => update("nid", v)}
                  />
                  <SelectField
                    label="Blood Group"
                    value={form.bloodGroup}
                    onChange={(v) => update("bloodGroup", v)}
                    options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                  />
                  <Field label="Phone *" value={form.phone} onChange={(v) => update("phone", v)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="WhatsApp Number"
                    value={form.whatsapp}
                    onChange={(v) => update("whatsapp", v)}
                  />
                  <Field
                    label="Facebook Profile"
                    value={form.facebook}
                    onChange={(v) => update("facebook", v)}
                  />
                </div>
                <Field
                  label="Present Address *"
                  value={form.presentAddress}
                  onChange={(v) => update("presentAddress", v)}
                />
                <Field
                  label="Permanent Address"
                  value={form.permanentAddress}
                  onChange={(v) => update("permanentAddress", v)}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Emergency Contact Name *"
                    value={form.emergencyContactName}
                    onChange={(v) => update("emergencyContactName", v)}
                  />
                  <Field
                    label="Emergency Contact Phone *"
                    value={form.emergencyContactPhone}
                    onChange={(v) => update("emergencyContactPhone", v)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="District *"
                    value={form.district}
                    onChange={(v) => update("district", v)}
                  />
                  <Field
                    label="Upazilla / Thana"
                    value={form.upazilla}
                    onChange={(v) => update("upazilla", v)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Highest Education"
                    value={form.education}
                    onChange={(v) => update("education", v)}
                    options={["SSC", "HSC", "Diploma", "Bachelor's", "Master's", "PhD", "Other"]}
                  />
                  <Field
                    label="Institution"
                    value={form.institution}
                    onChange={(v) => update("institution", v)}
                  />
                </div>
                <Field
                  label="Profession / Occupation"
                  value={form.profession}
                  onChange={(v) => update("profession", v)}
                />
                <TextArea
                  label="Skills (e.g., Photography, Design, Teaching)"
                  value={form.skills}
                  onChange={(v) => update("skills", v)}
                />
                <SelectField
                  label="Availability"
                  value={form.availability}
                  onChange={(v) => update("availability", v)}
                  options={[
                    "Weekends only",
                    "Weekdays evening",
                    "Full-time",
                    "Flexible",
                    "On-call for emergencies",
                  ]}
                />
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interest Areas *
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {interestOptions.map((opt) => {
                      const active = form.interestAreas.includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => toggleInterest(opt)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <TextArea
                  label="Why do you want to volunteer with us?"
                  value={form.motivation}
                  onChange={(v) => update("motivation", v)}
                  rows={4}
                />
                <Field
                  label="Reference (Name & contact, if any)"
                  value={form.reference}
                  onChange={(v) => update("reference", v)}
                />
                <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => update("agree", e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    I confirm the information is accurate and I commit to upholding the values of
                    SELFLESS ORGANIZATION BD.
                  </span>
                </label>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Draft auto-saved
              </span>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-transform"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-emerald-gradient text-primary-foreground px-7 py-3 rounded-xl text-sm font-bold shadow-glow hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              )}
            </div>
          </motion.form>

          <p className="mt-6 text-center text-sm text-muted-foreground inline-flex items-center gap-2 justify-center w-full">
            <Heart className="h-4 w-4 text-accent" />
            Your registration helps us reach more people in need.
          </p>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder={label.replace(" *", "")}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        placeholder={label}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-transparent"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
