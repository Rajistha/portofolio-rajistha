"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import type { PortfolioStat } from "@/types/database";

function CountingNumber({ target, suffix = "" }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1600; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (target - start) * ease);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function StatsCounter({ stats }: { stats?: PortfolioStat[] }) {
  const { language } = useLanguage();
  const isId = language === "id";

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section className="relative border-y border-border/60 bg-surface/40 backdrop-blur-xs py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id || idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-1.5 border-l-2 border-accent/40 pl-4 sm:pl-5"
            >
              <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                <CountingNumber target={Number(stat.value)} suffix={stat.suffix || ""} />
              </div>
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {isId ? stat.label : stat.label_en || stat.label}
              </div>
              {(stat.description || stat.description_en) && (
                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {isId ? stat.description : stat.description_en || stat.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
