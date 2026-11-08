"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import type { ShortLink } from "@/types/database";
import {
  RESERVED_SLUGS,
  FALLBACK_SHORT_LINKS,
  cleanSlug,
  generateRandomSlug,
} from "@/lib/links";

export type ActionResult = {
  error?: string;
  data?: ShortLink;
  slug?: string;
};

export async function getShortLinks(onlyPublic = false): Promise<ShortLink[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("short_links").select("*");

    if (onlyPublic) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("clicks", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return onlyPublic ? FALLBACK_SHORT_LINKS : [];
    }

    return (data as ShortLink[]) ?? [];
  } catch {
    return onlyPublic ? FALLBACK_SHORT_LINKS : [];
  }
}

export async function getShortLinkBySlug(slug: string): Promise<ShortLink | null> {
  const normalized = cleanSlug(slug);
  if (!normalized) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("short_links")
      .select("*")
      .eq("slug", normalized)
      .maybeSingle();

    if (!error && data) {
      return data as ShortLink;
    }
  } catch {
    // fallback search below
  }

  const fallback = FALLBACK_SHORT_LINKS.find((l) => l.slug.toLowerCase() === normalized);
  return fallback ?? null;
}

export async function recordClick(slug: string): Promise<void> {
  const normalized = cleanSlug(slug);
  if (!normalized) return;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("short_links")
      .select("clicks")
      .eq("slug", normalized)
      .maybeSingle();

    if (data) {
      await supabase
        .from("short_links")
        .update({ clicks: (data.clicks || 0) + 1, updated_at: new Date().toISOString() })
        .eq("slug", normalized);
    }
  } catch {
    // silent failure for analytics
  }
}

export async function createShortLink(formData: FormData, isPublic = false): Promise<ActionResult> {
  let destination = String(formData.get("destination_url") ?? "").trim();
  let rawSlug = String(formData.get("slug") ?? "").trim();
  let title = String(formData.get("title") ?? "").trim();
  let description = String(formData.get("description") ?? "").trim();
  const isPinned = isPublic ? false : formData.get("is_pinned") === "on";

  if (!destination) {
    return { error: "URL tujuan wajib diisi." };
  }

  if (!/^https?:\/\//i.test(destination)) {
    destination = `https://${destination}`;
  }

  try {
    new URL(destination);
  } catch {
    return { error: "Format URL tidak valid. Pastikan diawali https://" };
  }

  let slug = rawSlug ? cleanSlug(rawSlug) : generateRandomSlug();
  if (!slug) {
    slug = generateRandomSlug();
  }

  if (RESERVED_SLUGS.has(slug)) {
    return { error: `Slug "${slug}" adalah kata sistem yang tidak boleh digunakan.` };
  }

  if (!title) {
    try {
      const parsed = new URL(destination);
      title = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
    } catch {
      title = slug;
    }
  }

  const supabase = await createClient();

  if (!isPublic) {
    const authError = await requireUser(supabase);
    if (authError) return { error: authError };
  }

  try {
    const { data, error } = await supabase
      .from("short_links")
      .insert({
        slug,
        destination_url: destination,
        title,
        description: description || null,
        is_pinned: isPinned,
        is_public: true,
        clicks: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: `Slug "${slug}" sudah dipakai. Silakan pilih slug lain.` };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/links");
    revalidatePath("/links");
    return { data: data as ShortLink, slug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat shortlink.";
    return { error: message };
  }
}

export async function updateShortLink(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  let destination = String(formData.get("destination_url") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPinned = formData.get("is_pinned") === "on";
  const isPublic = formData.get("is_public") !== "off";

  if (!destination) return { error: "URL tujuan wajib diisi." };
  if (!/^https?:\/\//i.test(destination)) {
    destination = `https://${destination}`;
  }

  const slug = cleanSlug(rawSlug);
  if (!slug) return { error: "Slug tidak boleh kosong." };

  if (RESERVED_SLUGS.has(slug)) {
    return { error: `Slug "${slug}" adalah kata sistem yang tidak boleh digunakan.` };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("short_links")
      .update({
        slug,
        destination_url: destination,
        title,
        description: description || null,
        is_pinned: isPinned,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: `Slug "${slug}" sudah dipakai oleh link lain.` };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/links");
    revalidatePath("/links");
    return { data: data as ShortLink, slug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui shortlink.";
    return { error: message };
  }
}

export async function deleteShortLink(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("short_links").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/links");
    revalidatePath("/links");
    return {};
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus shortlink.";
    return { error: message };
  }
}
