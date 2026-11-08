"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { CvUploader } from "@/components/admin/cv-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { ActionResult } from "@/lib/actions/projects";
import type { Profile } from "@/types/database";

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

export function ProfileForm({
  action,
  profile,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  profile: Profile;
}) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);

    // Auto-normalize any URL fields that might be missing https://
    for (const key of ["github_url", "linkedin_url", "instagram_url", "cv_url"]) {
      const val = formData.get(key);
      if (typeof val === "string" && val.trim()) {
        formData.set(key, normalizeClientUrl(val));
      }
    }

    const result = await action(formData);

    setPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Profile saved.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={profile.name} />
        <Field label="Role" name="role" defaultValue={profile.role} />
      </div>

      <Field label="Tagline" name="tagline" defaultValue={profile.tagline} />

      <RichTextEditor name="bio" label="Bio (Indonesia)" defaultValue={profile.bio} />
      <RichTextEditor name="bio_en" label="Bio (English)" defaultValue={profile.bio_en} />

      <ImageUploader
        name="avatar_url"
        label="Avatar photo"
        bucket="avatars"
        defaultValue={profile.avatar_url}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" defaultValue={profile.email ?? ""} type="email" />
        <Field
          label="GitHub URL"
          name="github_url"
          defaultValue={profile.github_url ?? ""}
          type="url"
          placeholder="https://github.com/..."
        />
        <Field
          label="LinkedIn URL"
          name="linkedin_url"
          defaultValue={profile.linkedin_url ?? ""}
          type="url"
          placeholder="https://linkedin.com/in/..."
        />
        <Field
          label="Instagram URL"
          name="instagram_url"
          defaultValue={profile.instagram_url ?? ""}
          type="url"
          placeholder="https://instagram.com/..."
        />
      </div>

      <CvUploader defaultValue={profile.cv_url} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  const handleBlur = () => {
    if (type === "url" && value.trim()) {
      setValue(normalizeClientUrl(value));
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">{label}</label>
      <input
        name={name}
        type={type === "url" ? "text" : type}
        inputMode={type === "url" ? "url" : undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
      />
    </div>
  );
}
