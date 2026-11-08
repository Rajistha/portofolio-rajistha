"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, FileText, CheckCircle2, Layers, AlertCircle } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { useLanguage } from "@/components/language-provider";
import { CASE_STUDIES } from "@/lib/portfolio-data";
import type { Project } from "@/types/database";

export function ProjectModal({
  project,
  isOpen,
  onClose,
}: {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const isId = language === "id";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const caseStudy = project ? CASE_STUDIES[project.slug] : null;
  const summary = project ? (isId ? project.summary : project.summary_en || project.summary) : "";
  const description = project ? (isId ? project.description : project.description_en || project.description) : "";

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          key="mac-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md"
        >
          {/* macOS App Window with Spring Launch Physics & Precise Corner Clipping */}
          <motion.div
            key="mac-modal-window"
            initial={{ opacity: 0, scale: 0.88, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 14, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-2xl max-h-[88vh] rounded-3xl border border-white/10 bg-surface/95 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* macOS Title Bar with Traffic Lights */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-surface-2/40 px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    title="Tutup (ESC)"
                    className="group/traffic flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f56] hover:brightness-90 transition-all cursor-pointer shadow-xs"
                  >
                    <X className="h-2 w-2 text-[#4a0002] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                  </button>
                  <span className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e] shadow-xs opacity-75" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#27c93f] shadow-xs opacity-75" />
                </div>

                <span className="h-4 w-px bg-border/60 mx-1" aria-hidden />

                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-mono font-medium text-accent">
                  <FileText className="h-3.5 w-3.5" />
                  {isId ? "Studi Kasus Proyek" : "Project Case Study"}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-border bg-surface-2 p-1.5 text-muted hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body (Strictly clipped inside window, no leaking) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 overscroll-contain">
              <div>
                <h3 id="modal-project-title" className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {project.title}
                </h3>
              </div>

              {/* Project Summary */}
              {summary && (
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  {summary}
                </p>
              )}

              {/* Action Links */}
              <div className="flex flex-wrap items-center gap-3">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isId ? "Kunjungi Situs Live" : "View Live Site"}
                  </a>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-foreground hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    <GithubIcon size={14} />
                    {isId ? "Kode Sumber (GitHub)" : "Source Code"}
                  </a>
                )}
              </div>

              {/* Detailed Case Study */}
              {description && description.trim() !== summary?.trim() ? (
                <div className="space-y-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                    <FileText className="h-4 w-4" />
                    {isId ? "Studi Kasus Proyek:" : "Project Case Study:"}
                  </div>
                  {description.trim().startsWith("<") ? (
                    <div
                      className="prose-content text-sm sm:text-base text-muted leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <div className="space-y-3 text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                      {description}
                    </div>
                  )}
                </div>
              ) : caseStudy ? (
                <div className="space-y-6 pt-4 border-t border-border/60">
                  {/* Problem */}
                  <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      {isId ? "Masalah / Tantangan:" : "Problem & Challenges:"}
                    </div>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {isId ? caseStudy.problem.id : caseStudy.problem.en}
                    </p>
                  </div>

                  {/* Solution & Architecture */}
                  <div className="rounded-2xl border border-border/60 bg-surface-2/40 p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-accent">
                      <Layers className="h-4 w-4" />
                      {isId ? "Solusi & Arsitektur Teknis:" : "Solution & Technical Architecture:"}
                    </div>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed mb-3">
                      {isId ? caseStudy.solution.id : caseStudy.solution.en}
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted">
                      {caseStudy.architecture.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-accent font-mono">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Results / Key Impacts */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                      {isId ? "Dampak & Hasil:" : "Outcomes & Impact:"}
                    </span>
                    <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-muted">
                      {(isId ? caseStudy.results.id : caseStudy.results.en).map((res, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* Tech Stacks used */}
              {project.tech_stacks && project.tech_stacks.length > 0 && (
                <div className="pt-4 border-t border-border/60 space-y-2">
                  <span className="text-xs font-mono uppercase text-muted tracking-wider block">
                    {isId ? "Teknologi yang Digunakan:" : "Technologies Used:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stacks.map((ts) => (
                      <span
                        key={ts.id}
                        className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-mono text-foreground"
                      >
                        {ts.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}