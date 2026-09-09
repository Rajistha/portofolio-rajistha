"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/require-auth";
import { deleteStorageFile } from "@/lib/actions/storage";
import { findUnsafeUrl } from "@/lib/actions/validate-url";

export type ActionResult = { error?: string; id?: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseProjectForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const techStackIds = formData.getAll("tech_stack_ids").map(String);

  return {
    title,
    slug: slugify(String(formData.get("slug") || title)),
    summary: String(formData.get("summary") ?? "").trim(),
    summary_en: String(formData.get("summary_en") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    description_en: String(formData.get("description_en") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    live_url: String(formData.get("live_url") ?? "").trim() || null,
    repo_url: String(formData.get("repo_url") ?? "").trim() || null,
    featured: formData.get("featured") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    techStackIds,
  };
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { techStackIds, ...project } = parseProjectForm(formData);

  if (!project.title) return { error: "Title is required." };
  const urlError = findUnsafeUrl({
    image_url: project.image_url,
    live_url: project.live_url,
    repo_url: project.repo_url,
  });
  if (urlError) return { error: urlError };

  const { data, error } = await supabase.from("projects").insert(project).select("id").single();
  if (error) return { error: error.message };

  if (techStackIds.length > 0) {
    const { error: linkError } = await supabase.from("project_tech_stacks").insert(
      techStackIds.map((tech_stack_id) => ({ project_id: data.id, tech_stack_id }))
    );
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { id: data.id };
}

export async function updateProject(projectId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { techStackIds, ...project } = parseProjectForm(formData);

  if (!project.title) return { error: "Title is required." };
  const urlError = findUnsafeUrl({
    image_url: project.image_url,
    live_url: project.live_url,
    repo_url: project.repo_url,
  });
  if (urlError) return { error: urlError };

  const { data: existing } = await supabase
    .from("projects")
    .select("image_url")
    .eq("id", projectId)
    .maybeSingle();

  const { error } = await supabase.from("projects").update(project).eq("id", projectId);
  if (error) return { error: error.message };

  if (existing?.image_url && existing.image_url !== project.image_url) {
    await deleteStorageFile(existing.image_url);
  }

  const { error: clearError } = await supabase
    .from("project_tech_stacks")
    .delete()
    .eq("project_id", projectId);
  if (clearError) return { error: clearError.message };

  if (techStackIds.length > 0) {
    const { error: linkError } = await supabase.from("project_tech_stacks").insert(
      techStackIds.map((tech_stack_id) => ({ project_id: projectId, tech_stack_id }))
    );
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { id: projectId };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { data: existing } = await supabase
    .from("projects")
    .select("image_url")
    .eq("id", projectId)
    .maybeSingle();

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) return { error: error.message };

  await deleteStorageFile(existing?.image_url);

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return {};
}
