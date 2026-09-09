import Link from "next/link";
import { Pencil } from "lucide-react";
import { getProjects } from "@/lib/data";
import { deleteProject } from "@/lib/actions/projects";
import { DeleteButton } from "@/components/admin/delete-button";
import { TechIcon } from "@/components/ui/tech-icon";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Projects</h1>
          <p className="text-muted">{projects.length} total</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          + Add project
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {project.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{project.title}</p>
                {project.featured && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                    Featured
                  </span>
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
                className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <DeleteButton action={deleteProject.bind(null, project.id)} confirmMessage={`Delete "${project.title}"?`} />
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-muted">No projects yet. Add your first one.</p>
        )}
      </div>
    </div>
  );
}
