"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import { findUnsafeUrl } from "@/lib/actions/validate-url";
import type { ActionResult } from "@/lib/actions/projects";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 8);
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function savePost(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const authError = await requireUser(supabase);
    if (authError) return { error: authError };

    const id = String(formData.get("id") ?? "").trim() || null;
    const title = String(formData.get("title") ?? "").trim();
    const slug = slugify(String(formData.get("slug") || title));
    const cover_url = String(formData.get("cover_url") ?? "").trim() || null;
    const published = formData.get("published") === "on";

    if (!title) return { error: "Judul wajib diisi." };
    if (!slug) return { error: "Slug tidak valid." };

    const urlError = findUnsafeUrl({ cover_url });
    if (urlError) return { error: urlError };

    const admin = createAdminClient();

    let publishedAt: string | null = null;
    if (published) {
      // Keep the original publish date when re-saving an already published post.
      if (id) {
        const { data: existing } = await admin
          .from("blog_posts")
          .select("published, published_at")
          .eq("id", id)
          .maybeSingle();
        publishedAt = existing?.published && existing.published_at ? existing.published_at : new Date().toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    }

    const payload = {
      slug,
      title,
      title_en: String(formData.get("title_en") ?? "").trim() || null,
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      excerpt_en: String(formData.get("excerpt_en") ?? "").trim() || null,
      content: String(formData.get("content") ?? ""),
      content_en: String(formData.get("content_en") ?? "").trim() || null,
      cover_url,
      tags: parseTags(String(formData.get("tags") ?? "")),
      published,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    const query = id
      ? admin.from("blog_posts").update(payload).eq("id", id).select("id").single()
      : admin.from("blog_posts").insert(payload).select("id").single();
    const { data, error } = await query;

    if (error) {
      if (error.code === "23505") return { error: "Slug sudah dipakai tulisan lain." };
      return { error: error.message };
    }

    revalidateBlog(slug);
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menyimpan tulisan." };
  }
}

export async function setPostPublished(id: string, published: boolean): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const authError = await requireUser(supabase);
    if (authError) return { error: authError };

    const admin = createAdminClient();
    const { data: current } = await admin
      .from("blog_posts")
      .select("slug, published_at")
      .eq("id", id)
      .maybeSingle();

    const { error } = await admin
      .from("blog_posts")
      .update({
        published,
        published_at: published ? current?.published_at ?? new Date().toISOString() : current?.published_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { error: error.message };

    revalidateBlog(current?.slug);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengubah status." };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const authError = await requireUser(supabase);
    if (authError) return { error: authError };

    const admin = createAdminClient();
    const { data: current } = await admin.from("blog_posts").select("slug").eq("id", id).maybeSingle();
    const { error } = await admin.from("blog_posts").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidateBlog(current?.slug);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal menghapus tulisan." };
  }
}
