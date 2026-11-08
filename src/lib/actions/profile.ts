"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import { deleteStorageFile } from "@/lib/actions/storage";
import { findUnsafeUrl, normalizeUrl } from "@/lib/actions/validate-url";
import type { ActionResult } from "@/lib/actions/projects";

export async function updateProfile(profileId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    bio_en: String(formData.get("bio_en") ?? "").trim() || null,
    avatar_url: normalizeUrl(String(formData.get("avatar_url") ?? "")),
    email: String(formData.get("email") ?? "").trim() || null,
    github_url: normalizeUrl(String(formData.get("github_url") ?? "")),
    linkedin_url: normalizeUrl(String(formData.get("linkedin_url") ?? "")),
    instagram_url: normalizeUrl(String(formData.get("instagram_url") ?? "")),
    cv_url: normalizeUrl(String(formData.get("cv_url") ?? "")),
    updated_at: new Date().toISOString(),
  };

  const urlError = findUnsafeUrl({
    avatar_url: payload.avatar_url,
    github_url: payload.github_url,
    linkedin_url: payload.linkedin_url,
    instagram_url: payload.instagram_url,
    cv_url: payload.cv_url,
  });
  if (urlError) return { error: urlError };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profile")
    .select("avatar_url, cv_url")
    .eq("id", profileId)
    .maybeSingle();

  const { error } = await admin.from("profile").update(payload).eq("id", profileId);
  if (error) return { error: error.message };

  if (existing?.avatar_url && existing.avatar_url !== payload.avatar_url) {
    await deleteStorageFile(existing.avatar_url);
  }
  if (existing?.cv_url && existing.cv_url !== payload.cv_url) {
    await deleteStorageFile(existing.cv_url);
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return {};
}
