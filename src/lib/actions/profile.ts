"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/require-auth";
import { deleteStorageFile } from "@/lib/actions/storage";
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
    avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    github_url: String(formData.get("github_url") ?? "").trim() || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
    instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
    cv_url: String(formData.get("cv_url") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("profile")
    .select("avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  const { error } = await supabase.from("profile").update(payload).eq("id", profileId);
  if (error) return { error: error.message };

  if (existing?.avatar_url && existing.avatar_url !== payload.avatar_url) {
    await deleteStorageFile(existing.avatar_url);
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return {};
}
