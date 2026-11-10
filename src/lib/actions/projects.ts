"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

/** Drops `status` for databases that haven't run the add-project-status migration yet. */
function omitStatus<T extends { status?: unknown }>(project: T): Omit<T, "status"> {
  const copy = { ...project };
  delete copy.status;
  return copy;
}

function parseProjectForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const techStackIds = formData.getAll("tech_stack_ids").map(String);
  const rawStatus = String(formData.get("status") ?? "completed").trim();
  const status: "completed" | "in_progress" =
    rawStatus === "in_progress" ? "in_progress" : "completed";

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
    status,
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

  let { data, error } = await supabase.from("projects").insert(project).select("id").single();
  if (error && error.message.toLowerCase().includes("status")) {
    // Graceful fallback if database migration hasn't been executed yet
    const projectWithoutStatus = omitStatus(project);
    const retry = await supabase.from("projects").insert(projectWithoutStatus).select("id").single();
    if (retry.error) return { error: retry.error.message };
    data = retry.data;
    error = null;
  }
  if (error) return { error: error.message };

  if (techStackIds.length > 0 && data?.id) {
    const { error: linkError } = await supabase.from("project_tech_stacks").insert(
      techStackIds.map((tech_stack_id) => ({ project_id: data.id, tech_stack_id }))
    );
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { id: data?.id };
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

  let { error } = await supabase.from("projects").update(project).eq("id", projectId);
  if (error && error.message.toLowerCase().includes("status")) {
    // Graceful fallback if database migration hasn't been executed yet
    const projectWithoutStatus = omitStatus(project);
    const retry = await supabase.from("projects").update(projectWithoutStatus).eq("id", projectId);
    if (retry.error) return { error: retry.error.message };
    error = null;
  }
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

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("projects")
    .select("image_url")
    .eq("id", projectId)
    .maybeSingle();

  const { error } = await admin.from("projects").delete().eq("id", projectId);
  if (error) return { error: error.message };

  if (existing?.image_url) {
    await deleteStorageFile(existing.image_url);
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return {};
}
