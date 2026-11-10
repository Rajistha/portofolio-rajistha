"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProjectBody } from "@/components/site/project-body";
import { useLanguage } from "@/components/language-provider";
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
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-sm"
        >
          {/* macOS App Window with Spring Launch Physics & Precise Corner Clipping */}
          <motion.div
            key="mac-modal-window"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl border border-white/10 bg-surface shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* macOS Title Bar with Traffic Lights */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-surface-2/40 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    title="Tutup (ESC)"
                    className="group/traffic flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f56] hover:brightness-90 transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] cursor-pointer shadow-xs"
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 overscroll-contain">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 id="modal-project-title" className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {project.title}
                </h3>
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {isId ? "Halaman penuh" : "Full page"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <ProjectBody project={project} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}