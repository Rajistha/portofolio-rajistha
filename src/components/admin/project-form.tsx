"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, FileText } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { TechIcon } from "@/components/ui/tech-icon";
import type { ActionResult } from "@/lib/actions/projects";
import type { Project, TechStack } from "@/types/database";

function normalizeClientUrl(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, "http://").replace(/^https:\/\//i, "https://");
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
  }
  return trimmed;
}

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
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? "");
  const [repoUrl, setRepoUrl] = useState(project?.repo_url ?? "");
  const [status, setStatus] = useState<"completed" | "in_progress">(
    project?.status ?? "completed"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    if (liveUrl.trim()) {
      formData.set("live_url", normalizeClientUrl(liveUrl));
    }
    if (repoUrl.trim()) {
      formData.set("repo_url", normalizeClientUrl(repoUrl));
    }

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
      {/* Title & Slug */}
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

      {/* Summary */}
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

      {/* Studi Kasus Proyek / Project Case Study Editor */}
      <div className="rounded-2xl border border-border/80 bg-surface/50 p-5 sm:p-6 space-y-5">
        <div className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              Studi Kasus Proyek (Case Study) — Opsional
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Tulis pembahasan mendalam mengenai masalah, solusi teknis, dan hasil/dampak proyek ini. Konten ini akan ditampilkan saat pengunjung membuka pop-up &ldquo;Lihat Studi Kasus&rdquo; di portofolio. Jika tidak diisi, pop-up akan tetap tampil bersih dengan ringkasan dasar.
          </p>
        </div>

        <div className="space-y-6">
          <RichTextEditor
            name="description"
            label="Studi Kasus Proyek (Bahasa Indonesia) — Opsional"
            defaultValue={project?.description}
            enableCaseStudyTemplate={true}
          />
          <RichTextEditor
            name="description_en"
            label="Project Case Study (English) — Optional"
            defaultValue={project?.description_en}
            enableCaseStudyTemplate={true}
            isEnglish={true}
          />
        </div>
      </div>

      {/* Live & Repo URLs (placed before image uploader to enable instant auto-preview) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Live URL (e.g. Vercel deployment)
          </label>
          <input
            name="live_url"
            type="text"
            inputMode="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            onBlur={() => {
              if (liveUrl.trim()) setLiveUrl(normalizeClientUrl(liveUrl));
            }}
            placeholder="https://my-app.vercel.app"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
          <p className="mt-1 text-[11px] text-muted">
            Preview screenshot akan otomatis diambil dari URL ini jika gambar di bawah tidak di-upload.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Repository URL
          </label>
          <input
            name="repo_url"
            type="text"
            inputMode="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onBlur={() => {
              if (repoUrl.trim()) setRepoUrl(normalizeClientUrl(repoUrl));
            }}
            placeholder="https://github.com/username/repo"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
          <p className="mt-1 text-[11px] text-muted">
            Jika link demo belum ada, banner kartu GitHub otomatis digunakan sebagai fallback.
          </p>
        </div>
      </div>

      {/* Image Uploader with dynamic live preview */}
      <ImageUploader
        name="image_url"
        label="Project image (Opsional jika sudah mengisi Live URL)"
        bucket="project-images"
        defaultValue={project?.image_url}
        liveUrl={liveUrl}
        repoUrl={repoUrl}
      />

      {/* Project Status Selection */}
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-muted">
          Project Status
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
              status === "completed"
                ? "border-accent/60 bg-accent/5 shadow-xs"
                : "border-border bg-surface hover:border-border/80"
            }`}
          >
            <input
              type="radio"
              name="status"
              value="completed"
              checked={status === "completed"}
              onChange={() => setStatus("completed")}
              className="mt-0.5 text-accent accent-accent"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Completed / Selesai
              </div>
              <p className="mt-1 text-xs text-muted">
                Proyek sudah selesai, dideploy, dan siap dipamerkan di portfolio.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
              status === "in_progress"
                ? "border-amber-500/60 bg-amber-500/5 shadow-xs"
                : "border-border bg-surface hover:border-border/80"
            }`}
          >
            <input
              type="radio"
              name="status"
              value="in_progress"
              checked={status === "in_progress"}
              onChange={() => setStatus("in_progress")}
              className="mt-0.5 text-amber-500 accent-amber-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-amber-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                In Progress / Sedang Dikerjakan
              </div>
              <p className="mt-1 text-xs text-muted">
                Proyek sedang dalam pengerjaan aktif. Akan memiliki badge khusus di halaman utama.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Tech stack */}
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

      {/* Featured & Order */}
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
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : project ? "Save changes" : "Create project"}
      </button>
    </form>
  );
}
