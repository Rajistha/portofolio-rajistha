"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/actions/projects";

const ALLOWED_BUCKETS = ["project-images", "avatars", "documents"] as const;
type UploadBucket = (typeof ALLOWED_BUCKETS)[number];

export async function uploadImage(
  bucket: UploadBucket,
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to upload images." };
  if (!ALLOWED_BUCKETS.includes(bucket)) return { error: "Invalid upload target." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }

  const admin = createAdminClient();
  const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadCvFile(
  formData: FormData
): Promise<ActionResult & { url?: string; name?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to upload files." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowed = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
  if (!allowed.includes(ext) && !file.type.includes("pdf") && !file.type.includes("document")) {
    return { error: "Only PDF, Word (.doc, .docx), or image files are allowed for CV." };
  }

  if (file.size > 20 * 1024 * 1024) {
    return { error: "File size exceeds 20MB limit." };
  }

  const admin = createAdminClient();
  const bucket = "documents";

  // Ensure documents bucket exists and is public
  try {
    const { data: bucketData } = await admin.storage.getBucket(bucket);
    if (!bucketData) {
      await admin.storage.createBucket(bucket, { public: true });
    }
  } catch (err) {
    console.error("Bucket ensure error:", err);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `cv/${Date.now()}-${cleanName}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });

  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
}
