"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { TechIcon } from "@/components/ui/tech-icon";
import type { ActionResult } from "@/lib/actions/projects";
import type { Project, TechStack } from "@/types/database";

export function ProjectForm({
  action,
  project,
  techStacks,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  project?: Project;
  techStacks: TechStack[];
}) {
  const router = useRouter();
  const selectedIds = new Set(project?.tech_stacks?.map((t) => t.id));
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    setPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(project ? "Project updated." : "Project created.");
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">Title</label>
          <input
            name="title"
            required
            defaultValue={project?.title}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Slug (optional)
          </label>
          <input
            name="slug"
            defaultValue={project?.slug}
            placeholder="auto-generated from title"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Summary — Indonesia (shown on the card)
          </label>
          <textarea
            name="summary"
            rows={2}
            required
            defaultValue={project?.summary}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Summary — English
          </label>
          <textarea
            name="summary_en"
            rows={2}
            defaultValue={project?.summary_en ?? ""}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Full description — Indonesia
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={project?.description}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Full description — English
          </label>
          <textarea
            name="description_en"
            rows={4}
            defaultValue={project?.description_en ?? ""}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <ImageUploader
        name="image_url"
        label="Project image"
        bucket="project-images"
        defaultValue={project?.image_url}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Live URL
          </label>
          <input
            name="live_url"
            type="url"
            defaultValue={project?.live_url ?? ""}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Repository URL
          </label>
          <input
            name="repo_url"
            type="url"
            defaultValue={project?.repo_url ?? ""}
            placeholder="https://github.com/..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-muted">
          Tech stack used
        </label>
        {techStacks.length === 0 ? (
          <p className="text-sm text-muted">
            No tech stack items yet — add some from the Tech Stack page first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {techStacks.map((tech) => (
              <label
                key={tech.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm has-checked:border-accent/60 has-checked:bg-accent/10"
              >
                <input
                  type="checkbox"
                  name="tech_stack_ids"
                  value={tech.id}
                  defaultChecked={selectedIds.has(tech.id)}
                  className="sr-only"
                />
                <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={16} />
                {tech.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Featured project
        </label>

        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wide text-muted">Order</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={project?.sort_order ?? 0}
            className="w-20 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Saving…" : project ? "Save changes" : "Create project"}
      </button>
    </form>
  );
}
