"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TechIcon } from "@/components/ui/tech-icon";
import type { ActionResult } from "@/lib/actions/projects";

const DEFAULT_CATEGORIES = ["Frontend", "Backend", "Database", "Tools", "Design", "DevOps", "Mobile"];

export function TechStackForm({
  action,
  categories,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  categories: string[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState({ slug: "", name: "", color: "" });

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]));

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

    toast.success("Tech stack added.");
    formRef.current?.reset();
    setPreview({ slug: "", name: "", color: "" });
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-10 space-y-3 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="grid gap-3 sm:grid-cols-5">
        <input
          name="name"
          required
          placeholder="Name (React)"
          onChange={(e) => setPreview((p) => ({ ...p, name: e.target.value }))}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        <input
          name="slug"
          required
          placeholder="Slug (react)"
          onChange={(e) => setPreview((p) => ({ ...p, slug: e.target.value.trim().toLowerCase() }))}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        <input
          name="color"
          placeholder="Hex color (optional)"
          onChange={(e) => setPreview((p) => ({ ...p, color: e.target.value.replace("#", "") }))}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        <div>
          <input
            name="category"
            required
            list="tech-category-options"
            placeholder="Category (type to add new)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/50"
          />
          <datalist id="tech-category-options">
            {allCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {preview.slug && (
            <TechIcon slug={preview.slug} name={preview.name || preview.slug} color={preview.color || null} size={16} />
          )}
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      <p className="text-xs text-muted">
        Tip: type any category name (e.g. &quot;Testing&quot;, &quot;Cloud&quot;) to create a new one — it&apos;ll show up as its own group on the site.
      </p>
    </form>
  );
}
