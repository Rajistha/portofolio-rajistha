"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";
import { useLanguage } from "@/components/language-provider";
import type { Profile } from "@/types/database";

const Lanyard = dynamic(() => import("@/components/site/lanyard").then((mod) => mod.Lanyard), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="lanyard-skeleton absolute top-[31%] right-16 h-56 w-40 -translate-y-1/2 rounded-2xl border border-border bg-surface-2"
    />
  ),
});

export function Hero({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage();
  const name = profile?.name ?? "Your Name";
  const role = profile?.role ?? "Front-End Developer";
  const tagline = profile?.tagline ?? "I build fast, accessible, beautiful interfaces.";

  return (
    <section className="relative flex min-h-screen items-center px-6 pt-28 pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-grid" />

      <div className="mx-auto grid w-full max-w-5xl items-center gap-8">
        <div className="relative z-10 grid gap-8 lg:max-w-xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex items-center gap-2 text-sm text-muted">
            {role}
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.15, staggerChildren: 0.035 }}
            className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            aria-label={name}
          >
            {name.split("").map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="inline-block"
                aria-hidden
              >
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.55 }} className="max-w-xl text-lg text-muted">
            <Typewriter text={tagline} startDelay={0.7} />
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.55 }} className="flex flex-wrap items-center gap-3">
            <a href="#work" className="group inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-background">
              {t.hero.viewWork}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            {profile?.cv_url && (
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm text-foreground/90 transition-colors hover:border-accent/60 hover:text-accent"
              >
                {t.hero.downloadCv}
              </a>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute inset-x-0 top-0 hidden h-[160vh] touch-none select-none lg:block"
        aria-hidden
      >
        <Lanyard photoUrl={profile?.avatar_url} />
      </motion.div>
    </section>
  );
}
