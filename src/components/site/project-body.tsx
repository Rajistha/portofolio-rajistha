"use client";

import { ExternalLink, FileText, CheckCircle2, Layers, AlertCircle } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { useLanguage } from "@/components/language-provider";
import { CASE_STUDIES } from "@/lib/portfolio-data";
import type { Project } from "@/types/database";

/**
 * Shared project content (summary, links, case study, technologies) used by
 * both the quick-view modal and the full project page.
 */
export function ProjectBody({ project }: { project: Project }) {
  const { language } = useLanguage();
  const isId = language === "id";
  const caseStudy = CASE_STUDIES[project.slug] ?? null;
  const summary = isId ? project.summary : project.summary_en || project.summary;
  const description = isId ? project.description : project.description_en || project.description;

  return (
    <>
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
    </>
  );
}
