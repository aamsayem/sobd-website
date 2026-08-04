import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { MapPin, Phone, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — SELFLESS ORGANIZATION BD" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("mobile") || "").trim();
    const subject = String(fd.get("subject") || "").trim();
    const message = String(fd.get("message") || "").trim();
    if (!name || !message) {
      toast.error("Name and message are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("submissions/contact-messages/", {
        name,
        email: email || null,
        phone: phone || null,
        subject: subject || null,
        message,
      });
      setDone(true);
      toast.success("Message sent. We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not submit message. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero kicker="GET IN TOUCH" title="Contact us" bn="আমাদের সাথে যোগাযোগ করুন" />
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="glass-strong rounded-3xl p-8 shadow-soft">
            <h3 className="font-display text-2xl font-bold">Reach out</h3>
            <div className="mt-6 space-y-4">
              {[
                { i: MapPin, l: "Address", v: "Chattogram, Bangladesh" },
                { i: Phone, l: "Phone", v: "01886-339475" },
                { i: Mail, l: "Email", v: "sobd.official@gmail.com" },
              ].map(({ i: Icon, l, v }) => (
                <div key={l} className="flex gap-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-gradient text-primary-foreground flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {l}
                    </div>
                    <div className="font-semibold">{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {done ? (
            <div className="glass-strong rounded-3xl p-10 shadow-soft text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-display text-2xl font-bold">Message sent</h3>
              <p className="font-bn text-muted-foreground mt-2">
                আপনার বার্তা পাওয়া গেছে। শীঘ্রই যোগাযোগ করব।
              </p>
              <button
                onClick={() => setDone(false)}
                className="mt-6 text-primary font-semibold text-sm"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="glass-strong rounded-3xl p-8 shadow-soft space-y-4"
            >
              <input
                name="name"
                required
                placeholder="Your name *"
                className="w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  name="mobile"
                  placeholder="Mobile"
                  className="w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <input
                name="subject"
                placeholder="Subject"
                className="w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                name="message"
                required
                placeholder="Message *"
                rows={5}
                className="w-full glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-gradient text-primary-foreground py-3.5 rounded-xl font-bold shadow-glow hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
