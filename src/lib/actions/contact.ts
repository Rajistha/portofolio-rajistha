"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUnreadSummary, type UnreadSummary } from "@/lib/admin-data";
import type { ActionResult } from "@/lib/actions/projects";

const messageSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  email: z.string().trim().email("Format email tidak valid.").max(120),
  subject: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter.").max(3000),
});

/**
 * Optional email notification through Resend. Only runs when RESEND_API_KEY and
 * a destination address are configured; failures never block the submission
 * since the message is already stored in the inbox.
 */
async function notifyByEmail(data: z.infer<typeof messageSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
        to,
        reply_to: data.email,
        subject: `Pesan baru dari ${data.name}${data.subject ? `: ${data.subject}` : ""}`,
        html: `<p><strong>${escape(data.name)}</strong> &lt;${escape(data.email)}&gt;</p><p>${escape(data.message).replace(/\n/g, "<br>")}</p>`,
      }),
    });
  } catch (err) {
    console.error("contact notify:", err);
  }
}

export async function submitContactMessage(formData: FormData): Promise<ActionResult> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("hp_token") ?? "").trim()) {
    console.warn("contact: honeypot triggered, message dropped");
    return {};
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 3, 10 * 60_000)) {
    return { error: "Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi." };
  }

  const parsed = messageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  try {
    const { error } = await createAdminClient().from("contact_messages").insert(parsed.data);
    if (error) {
      console.error("contact insert:", error.message);
      return { error: "Pesan gagal disimpan." };
    }
  } catch (err) {
    console.error("contact insert:", err);
    return { error: "Pesan gagal disimpan." };
  }

  await notifyByEmail(parsed.data);
  revalidatePath("/admin/messages");
  return {};
}

export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { error } = await createAdminClient().from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
  return {};
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { error } = await createAdminClient().from("contact_messages").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
  return {};
}

/** Polled by the admin notification bell. */
export async function fetchUnreadSummary(): Promise<UnreadSummary> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { count: 0, latest: [] };
  return getUnreadSummary();
}

export async function markAllMessagesRead(): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { error } = await createAdminClient().from("contact_messages").update({ is_read: true }).eq("is_read", false);
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
  return {};
}
