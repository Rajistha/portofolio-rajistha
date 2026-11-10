"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/actions/projects";
import { slugifyFilename, withUniqueSuffix } from "@/lib/slug";

const ALLOWED_BUCKETS = ["project-images", "avatars", "documents"] as const;
type UploadBucket = (typeof ALLOWED_BUCKETS)[number];

/**
 * Creates a signed upload URL so the browser can upload directly to
 * Supabase Storage — bypassing the Vercel function body-size limit entirely.
 * Returns { signedUrl, path, publicUrl } on success.
 */
export async function createSignedUploadUrl(
  bucket: UploadBucket,
  filename: string,
  folder?: string
): Promise<ActionResult & { signedUrl?: string; path?: string; publicUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to upload files." };
  if (!ALLOWED_BUCKETS.includes(bucket)) return { error: "Invalid upload target." };

  const admin = createAdminClient();

  // Ensure documents bucket is public when needed
  if (bucket === "documents") {
    try {
      const { data: bucketData } = await admin.storage.getBucket(bucket);
      if (!bucketData) {
        await admin.storage.createBucket(bucket, { public: true });
      }
    } catch {
      // ignore — bucket may already exist
    }
  }

  const cleanName = slugifyFilename(filename);
  const prefix = folder ? `${folder}/` : "";

  // Clean, timestamp-free name; on a name clash add a short random suffix.
  let path = `${prefix}${cleanName}`;
  let { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error) {
    path = `${prefix}${withUniqueSuffix(cleanName)}`;
    ({ data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path));
  }

  if (error || !data) return { error: error?.message ?? "Failed to create upload URL." };

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);

  return {
    signedUrl: data.signedUrl,
    path,
    publicUrl: pub.publicUrl,
  };
}

/**
 * Legacy server-side upload — kept for small files or server-to-server use.
 * For client uploads prefer createSignedUploadUrl + direct PUT from the browser.
 */
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
  const path = withUniqueSuffix(slugifyFilename(file.name, "image"));

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Legacy CV upload via server — file passes through Vercel (4.5 MB limit applies).
 * Use createSignedUploadUrl + direct PUT instead for large files.
 */
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

  try {
    const { data: bucketData } = await admin.storage.getBucket(bucket);
    if (!bucketData) {
      await admin.storage.createBucket(bucket, { public: true });
    }
  } catch (err) {
    console.error("Bucket ensure error:", err);
  }

  const path = `cv/${withUniqueSuffix(slugifyFilename(file.name, "cv"))}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });

  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
}
