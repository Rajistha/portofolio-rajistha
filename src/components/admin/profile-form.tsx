"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { ActionResult } from "@/lib/actions/projects";
import type { Profile } from "@/types/database";

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
        <Field label="GitHub URL" name="github_url" defaultValue={profile.github_url ?? ""} type="url" />
        <Field label="LinkedIn URL" name="linkedin_url" defaultValue={profile.linkedin_url ?? ""} type="url" />
        <Field label="Instagram URL" name="instagram_url" defaultValue={profile.instagram_url ?? ""} type="url" />
        <Field label="CV URL" name="cv_url" defaultValue={profile.cv_url ?? ""} type="url" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
      />
    </div>
  );
}
