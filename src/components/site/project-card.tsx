"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { RevealStaggerItem } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { useLanguage } from "@/components/language-provider";
import { resolveProjectImage } from "@/lib/project-image";
import { ProjectPlaceholder } from "@/components/site/project-placeholder";
import { ProjectModal } from "@/components/site/project-modal";
import { trackEvent } from "@/lib/track";
import type { Project } from "@/types/database";

export function ProjectCard({ project }: { project: Project }) {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const isId = language === "id";
  const summary = language === "en" ? project.summary_en || project.summary : project.summary;

  function openModal() {
    setModalOpen(true);
    trackEvent("project_open", { label: project.title });
  }

  const resolved = resolveProjectImage(project);
  const imageUrl = !imageError ? resolved.url : null;
  const isInProgress = project.status === "in_progress";

  return (
    <>
      <RevealStaggerItem className="h-full">
        <motion.article
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-black/50"
        >
          <div
            onClick={openModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${isId ? "Lihat studi kasus" : "View case study"}: ${project.title}`}
            className="relative aspect-16/10 w-full overflow-hidden rounded-t-lg bg-surface-2 cursor-pointer"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={project.title}
                onError={() => setImageError(true)}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <ProjectPlaceholder project={project} />
            )}
            {imageUrl && (
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/85 via-transparent to-transparent" />
            )}

            {/* Status & Featured badges (positioned at bottom to keep top navbar clean & visible) */}
            <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isInProgress && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-background/85 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-amber-400 backdrop-blur-md shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  {t.work.inProgress}
                </span>
              )}

              {project.featured && (
                <span className="rounded-md bg-accent px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-background shadow-xs">
                  {t.work.featured}
                </span>
              )}
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/90 px-3.5 py-1.5 text-xs font-semibold text-background shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <BookOpen className="h-3.5 w-3.5" />
                {isId ? "Lihat Studi Kasus" : "View Case Study"}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h3
                onClick={openModal}
                className="font-display text-xl cursor-pointer hover:text-accent transition-colors"
              >
                {project.title}
              </h3>
              <div className="flex shrink-0 gap-2">
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.work.viewSourceCode}
                    className="group/tip relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <TechIcon slug="github" name="GitHub" size={16} className="icon-mono" />
                    <span className="pointer-events-none absolute -top-9 right-0 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                      {t.work.sourceCode}
                    </span>
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.work.viewLiveSite}
                    className="group/tip relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="pointer-events-none absolute -top-9 right-0 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                      {t.work.liveDemo}
                    </span>
                  </a>
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                {summary}
              </p>
            </div>

            <div className="mt-auto">
              {project.tech_stacks && project.tech_stacks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {project.tech_stacks.map((tech) => (
                    <div
                      key={tech.id}
                      title={tech.name}
                      className="flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1"
                    >
                      <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={14} />
                      <span className="text-xs text-foreground/80">{tech.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </RevealStaggerItem>

      <ProjectModal
        project={project}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
