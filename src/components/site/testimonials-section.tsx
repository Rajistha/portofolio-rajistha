"use client";

import { motion } from "framer-motion";
import { Star, Quote, Building2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Testimonial } from "@/types/database";

export function TestimonialsSection({ testimonials }: { testimonials?: Testimonial[] }) {
  const { language } = useLanguage();
  const isId = language === "id";

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="relative py-16 sm:py-20 px-4 sm:px-6 border-t border-border/50">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2 text-center max-w-xl mx-auto"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            // 05. {isId ? "TESTIMONI & ULASAN" : "CLIENT REVIEWS"}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isId ? "Apa Kata Mereka." : "What Clients Say."}
          </h2>
          <p className="text-sm sm:text-base text-muted">
            {isId
              ? "Ulasan langsung dari para partner bisnis dan klien yang pernah bekerja sama dengan Puja Rajistha."
              : "Direct reviews and impressions from collaborators and clients who built products with Puja Rajistha."}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testi, idx) => {
            const role = isId ? testi.role : testi.role_en || testi.role;
            const content = isId ? testi.content : testi.content_en || testi.content;

            return (
              <motion.div
                key={testi.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col justify-between rounded-2xl border border-border/70 bg-surface/60 p-6 backdrop-blur-xs transition-all duration-300 hover:border-accent/40 hover:bg-surface shadow-xs group"
              >
                {/* Top Quote Icon & Stars */}
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: testi.rating || 5 }).map((_, rIdx) => (
                        <Star key={rIdx} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-accent/20 group-hover:text-accent/40 transition-colors" />
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic">
                    "{content}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display text-sm font-bold text-foreground truncate">
                      {testi.name}
                    </h4>
                    <p className="text-[11px] text-muted truncate">
                      {role}
                    </p>
                  </div>

                  {testi.company && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono text-muted bg-surface-2 px-2 py-1 rounded-md shrink-0 border border-border/40">
                      <Building2 className="h-2.5 w-2.5 text-accent" />
                      {testi.company}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
