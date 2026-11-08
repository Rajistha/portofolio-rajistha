"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import { deleteStorageFile } from "@/lib/actions/storage";

// -----------------------------------------------------------------------------
// STATS
// -----------------------------------------------------------------------------
export async function saveStat(formData: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const id = formData.get("id") as string | null;
    const value = parseFloat(formData.get("value") as string) || 0;
    const suffix = (formData.get("suffix") as string) || "";
    const label = (formData.get("label") as string)?.trim();
    const label_en = (formData.get("label_en") as string)?.trim() || null;
    const description = (formData.get("description") as string)?.trim() || "";
    const description_en = (formData.get("description_en") as string)?.trim() || null;
    const sort_order = parseInt(formData.get("sort_order") as string, 10) || 0;

    if (!label) {
      return { error: "Label statistik wajib diisi." };
    }

    const payload = {
      value,
      suffix,
      label,
      label_en,
      description,
      description_en,
      sort_order,
    };

    const admin = createAdminClient();

    if (id) {
      const { error } = await admin.from("portfolio_stats").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("portfolio_stats").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/stats");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menyimpan statistik" };
  }
}

export async function deleteStat(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const admin = createAdminClient();
    const { error } = await admin.from("portfolio_stats").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/stats");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menghapus statistik" };
  }
}

// -----------------------------------------------------------------------------
// EXPERIENCES (REKAM JEJAK)
// -----------------------------------------------------------------------------
export async function saveExperience(formData: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const id = formData.get("id") as string | null;
    const category = ((formData.get("category") as string)?.trim() || "work") as string;
    const period = (formData.get("period") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();
    const role_en = (formData.get("role_en") as string)?.trim() || null;
    const company = (formData.get("company") as string)?.trim();
    const location = (formData.get("location") as string)?.trim() || "";
    const description = (formData.get("description") as string)?.trim() || "";
    const description_en = (formData.get("description_en") as string)?.trim() || null;
    const achievements = (formData.get("achievements") as string)?.trim() || "";
    const achievements_en = (formData.get("achievements_en") as string)?.trim() || null;
    const skills = (formData.get("skills") as string)?.trim() || "";
    const is_current = formData.get("is_current") === "true" || formData.get("is_current") === "on";
    const sort_order = parseInt(formData.get("sort_order") as string, 10) || 0;

    if (!period || !role || !company) {
      return { error: "Periode, Peran/Posisi, dan Institusi/Perusahaan wajib diisi." };
    }

    const payload = {
      category,
      period,
      role,
      role_en,
      company,
      location,
      description,
      description_en,
      achievements,
      achievements_en,
      skills,
      is_current,
      sort_order,
    };

    const admin = createAdminClient();

    if (id) {
      const { error } = await admin.from("experiences").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("experiences").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/experiences");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menyimpan rekam jejak" };
  }
}

export async function deleteExperience(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const admin = createAdminClient();
    const { error } = await admin.from("experiences").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/experiences");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menghapus rekam jejak" };
  }
}

// -----------------------------------------------------------------------------
// TESTIMONIALS
// -----------------------------------------------------------------------------
export async function saveTestimonial(formData: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const id = formData.get("id") as string | null;
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();
    const role_en = (formData.get("role_en") as string)?.trim() || null;
    const company = (formData.get("company") as string)?.trim();
    const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;
    const rating = Math.min(Math.max(parseInt(formData.get("rating") as string, 10) || 5, 1), 5);
    const content = (formData.get("content") as string)?.trim();
    const content_en = (formData.get("content_en") as string)?.trim() || null;
    const project_ref = (formData.get("project_ref") as string)?.trim() || null;
    const sort_order = parseInt(formData.get("sort_order") as string, 10) || 0;

    if (!name || !role || !company || !content) {
      return { error: "Nama, Jabatan, Perusahaan, dan Isi Testimoni wajib diisi." };
    }

    const payload = {
      name,
      role,
      role_en,
      company,
      avatar_url,
      rating,
      content,
      content_en,
      project_ref,
      sort_order,
    };

    const admin = createAdminClient();

    if (id) {
      const { data: existing } = await admin
        .from("testimonials")
        .select("avatar_url")
        .eq("id", id)
        .maybeSingle();

      const { error } = await admin.from("testimonials").update(payload).eq("id", id);
      if (error) throw error;

      if (existing?.avatar_url && existing.avatar_url !== payload.avatar_url) {
        await deleteStorageFile(existing.avatar_url);
      }
    } else {
      const { error } = await admin.from("testimonials").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menyimpan ulasan" };
  }
}

export async function deleteTestimonial(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const userError = await requireUser(supabase);
    if (userError) return { error: userError };

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("testimonials")
      .select("avatar_url")
      .eq("id", id)
      .maybeSingle();

    const { error } = await admin.from("testimonials").delete().eq("id", id);
    if (error) throw error;

    if (existing?.avatar_url) {
      await deleteStorageFile(existing.avatar_url);
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Gagal menghapus ulasan" };
  }
}
