"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calendar, MapPin, CheckCircle2, GraduationCap, Users, Rocket, Layers } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Experience } from "@/types/database";

const CATEGORY_CONFIG: Record<
  string,
  { label: { id: string; en: string }; icon: typeof Briefcase; color: string; dotBorder: string }
> = {
  education: {
    label: { id: "Pendidikan", en: "Education" },
    icon: GraduationCap,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    dotBorder: "border-blue-400",
  },
  work: {
    label: { id: "Pekerjaan", en: "Work" },
    icon: Briefcase,
    color: "text-accent bg-accent/10 border-accent/30",
    dotBorder: "border-accent",
  },
  organization: {
    label: { id: "Organisasi", en: "Organization" },
    icon: Users,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    dotBorder: "border-emerald-400",
  },
  project: {
    label: { id: "Proyek", en: "Projects" },
    icon: Rocket,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    dotBorder: "border-purple-400",
  },
};

export function ExperienceSection({ experiences }: { experiences?: Experience[] }) {
  const { language } = useLanguage();
  const isId = language === "id";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!experiences || experiences.length === 0) {
    return null;
  }

  // Count available categories
  const categoryCounts = experiences.reduce<Record<string, number>>((acc, exp) => {
    const cat = exp.category || "work";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const availableCategories = Object.keys(categoryCounts);

  // Tabs list with Lucide icons (Zero emojis)
  const tabs = [
    { key: "all", label: isId ? "Semua" : "All", icon: Layers, count: experiences.length },
    ...(categoryCounts.education ? [{ key: "education", label: isId ? "Pendidikan" : "Education", icon: GraduationCap, count: categoryCounts.education }] : []),
    ...(categoryCounts.work ? [{ key: "work", label: isId ? "Pekerjaan" : "Work", icon: Briefcase, count: categoryCounts.work }] : []),
    ...(categoryCounts.organization ? [{ key: "organization", label: isId ? "Organisasi" : "Organization", icon: Users, count: categoryCounts.organization }] : []),
    ...(categoryCounts.project ? [{ key: "project", label: isId ? "Proyek" : "Projects", icon: Rocket, count: categoryCounts.project }] : []),
  ];

  // Filter items
  const filteredExperiences = selectedCategory === "all"
    ? experiences
    : experiences.filter((e) => (e.category || "work") === selectedCategory);

  return (
    <section id="experience" className="relative py-16 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Eyebrow and Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 space-y-2"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            // 03. {isId ? "REKAM JEJAK & PENGALAMAN" : "CAREER & EDUCATION"}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isId ? "Rekam Jejak & Pendidikan." : "Journey & Experience."}
          </h2>
          <p className="max-w-xl text-sm sm:text-base text-muted">
            {isId
              ? "Linimasa riwayat akademis, karier profesional, pengalaman organisasi, dan inisiatif proyek."
              : "A chronicle of academic background, professional experience, organization leadership, and key projects."}
          </p>
        </motion.div>

        {/* Category Filter Tabs (if there are multiple categories) */}
        {availableCategories.length > 1 && (
          <div className="overflow-x-auto pb-2 mb-8 sm:mb-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-2 min-w-max">
              {tabs.map((tab) => {
                const active = selectedCategory === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                      active
                        ? "bg-accent text-background font-semibold shadow-xs"
                        : "border border-border/80 bg-surface/60 text-muted hover:border-accent/40 hover:text-foreground backdrop-blur-xs"
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        active ? "bg-background/20 text-background" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline container */}
        <div className="relative border-l-2 border-border/80 pl-6 sm:pl-8 space-y-10 sm:space-y-12 ml-2 sm:ml-4">
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((exp, idx) => {
              const catKey = exp.category || "work";
              const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.work;
              const CatIcon = catConfig.icon;
              const role = isId ? exp.role : exp.role_en || exp.role;
              const description = isId ? exp.description : exp.description_en || exp.description;
              const achievementsText = isId ? exp.achievements : exp.achievements_en || exp.achievements;
              const achievementsList = achievementsText
                ? achievementsText.split("\n").map((s) => s.trim()).filter(Boolean)
                : [];
              const skillsList = exp.skills
                ? exp.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <motion.div
                  key={exp.id || idx}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="relative group"
                >
                  {/* Timeline Marker Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-2 h-3.5 w-3.5 rounded-full border-2 transition-colors duration-200 ${
                      exp.is_current
                        ? "border-accent bg-accent"
                        : `${catConfig.dotBorder} bg-surface`
                    }`}
                  />

                  {/* Card wrapper */}
                  <div className="rounded-2xl border border-border/70 bg-surface/60 p-6 sm:p-7 backdrop-blur-xs transition-all duration-300 hover:border-accent/40 hover:bg-surface shadow-xs">
                    {/* Category pill & Period */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium ${catConfig.color}`}
                        >
                          <CatIcon className="h-3 w-3" />
                          {isId ? catConfig.label.id : catConfig.label.en}
                        </span>

                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">
                          <Calendar className="h-3.5 w-3.5 text-accent" />
                          {exp.period}
                        </div>
                      </div>

                      {exp.is_current && (
                        <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-mono font-medium text-accent">
                          {catKey === "education"
                            ? isId
                              ? "Sedang Menempuh"
                              : "Enrolled"
                            : isId
                            ? "Posisi Aktif"
                            : "Present"}
                        </span>
                      )}
                    </div>

                    {/* Role & Company */}
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted mt-1 mb-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                        <CatIcon className="h-3.5 w-3.5 text-accent" />
                        {exp.company}
                      </span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-muted">
                            <MapPin className="h-3 w-3 text-muted/70" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-sm text-muted leading-relaxed mb-5">
                        {description}
                      </p>
                    )}

                    {/* Key Achievements */}
                    {achievementsList.length > 0 && (
                      <div className="space-y-2 mb-5">
                        <span className="text-xs font-mono uppercase text-foreground/80 font-semibold tracking-wider block">
                          {catKey === "education"
                            ? isId
                              ? "Poin Studi / Prestasi:"
                              : "Key Highlights & Honors:"
                            : isId
                            ? "Pencapaian Utama:"
                            : "Key Impacts:"}
                        </span>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-muted">
                          {achievementsList.map((ach, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech Skills Pills */}
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                        {skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-border/60 bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-muted/90"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
