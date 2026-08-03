import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function PageHero({ title, bn, kicker }: { title: string; bn?: string; kicker?: string }) {
  return (
    <section className="relative -mt-24 pt-32 pb-16 bg-hero text-white overflow-hidden">
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_70%_30%,white,transparent_50%)]" />
      <div className="container mx-auto px-4 relative">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {kicker && (
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-4">
              {kicker}
            </div>
          )}
          <h1 className="font-display text-5xl lg:text-6xl font-bold tracking-tight">{title}</h1>
          {bn && <p className="font-bn text-xl opacity-90 mt-3">{bn}</p>}
        </motion.div>
      </div>
    </section>
  );
}

export function StubBody({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-4 py-16 max-w-3xl">{children}</div>;
}
