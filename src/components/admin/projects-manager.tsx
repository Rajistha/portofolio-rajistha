"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderKanban, GripVertical, Pencil, Plus } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import { reorderItems } from "@/lib/actions/reorder";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import { EmptyState } from "@/components/ui/empty-state";
import { TechIcon } from "@/components/ui/tech-icon";
import { resolveProjectImage } from "@/lib/project-image";
import type { Project } from "@/types/database";

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [, startTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initialProjects);
  if (prevInitial !== initialProjects) {
    setPrevInitial(initialProjects);
    setProjects(initialProjects);
  }

  function persist(next: Project[]) {
    const previous = prevInitial;
    startTransition(async () => {
      const result = await reorderItems("projects", next.map((p) => p.id));
      if (result.error) {
        toast.error(result.error);
        setProjects(previous);
        return;
      }
      toast.success("Urutan proyek disimpan.");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Projects</h1>
          <p className="text-muted">
            {projects.length} total
            {projects.length > 1 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                · <GripVertical className="h-3 w-3" /> seret untuk mengatur urutan
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Add project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Belum ada proyek"
          description="Tambahkan proyek pertama untuk ditampilkan di bagian Karya pada landing page."
          action={
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah proyek
            </Link>
          }
        />
      ) : (
        <SortableList
          items={projects}
          onReorder={setProjects}
          onCommit={persist}
          className="space-y-3"
          renderItem={(project) => {
            const resolved = resolveProjectImage(project);
            return (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {resolved.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolved.url}
                      alt={project.title}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                      No image
                    </div>
                  )}
                  {resolved.isAuto && (
                    <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center text-[9px] text-muted">
                      Auto
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{project.title}</p>
                    {project.status === "in_progress" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                        In Progress
                      </span>
                    )}
                    {project.featured && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">Featured</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">{project.summary}</p>
                  <div className="mt-2 flex gap-1.5">
                    {project.tech_stacks?.map((tech) => (
                      <TechIcon key={tech.id} slug={tech.slug} name={tech.name} color={tech.color} size={16} />
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    aria-label="Edit proyek"
                    className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton
                    action={deleteProject.bind(null, project.id)}
                    confirmMessage={`Delete "${project.title}"?`}
                  />
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
