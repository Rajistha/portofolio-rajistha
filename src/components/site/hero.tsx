"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";
import { StaticBadge } from "@/components/site/static-badge";
import { useLanguage } from "@/components/language-provider";
import { trackEvent } from "@/lib/track";
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

type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** The 3D card is skipped for visitors who asked for less motion or are on a constrained device. */
function prefersLightweightHero() {
  const nav = navigator as NavigatorHints;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    nav.connection?.saveData === true ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2)
  );
}

export function Hero({ profile, lanyardEnabled = true }: { profile: Profile | null; lanyardEnabled?: boolean }) {
  const { t } = useLanguage();
  const [isDesktop, setIsDesktop] = useState(false);
  const [lightweight, setLightweight] = useState(false);

  useEffect(() => {
    // Browser capability hints are only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLightweight(prefersLightweightHero());
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const name = profile?.name ?? "Your Name";
  const role = profile?.role ?? "Front-End Developer";
  const tagline = profile?.tagline ?? "I build fast, accessible, beautiful interfaces.";

  return (
    <section className="relative flex min-h-svh items-center px-4 sm:px-6 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-grid" />

      <div className="mx-auto grid w-full max-w-5xl items-center gap-8">
        <div className="relative z-10 grid gap-8 lg:max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-muted"
          >
            {role}
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.15, staggerChildren: 0.035 }}
            className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
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
                download
                onClick={() => trackEvent("cv_download")}
                className="group inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm text-foreground/90 transition-colors hover:border-accent/60 hover:text-accent"
              >
                <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                {t.hero.downloadCv}
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {isDesktop && (!lanyardEnabled || lightweight) && <StaticBadge profile={profile} />}

      {isDesktop && lanyardEnabled && !lightweight && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute inset-x-0 top-0 hidden h-[160vh] touch-none select-none lg:block"
          aria-hidden
        >
          <Lanyard photoUrl={profile?.avatar_url} />
        </motion.div>
      )}
    </section>
  );
}
