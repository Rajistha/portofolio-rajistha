"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/actions/projects";

const ALLOWED_BUCKETS = ["project-images", "avatars"] as const;
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
