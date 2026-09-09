import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const PUBLIC_PREFIX = "/storage/v1/object/public/";

/**
 * Deletes the Supabase Storage object behind a public URL, if it points at
 * one of our own buckets. Silently no-ops for external/foreign URLs.
 */
export async function deleteStorageFile(url: string | null | undefined) {
  if (!url) return;

  const idx = url.indexOf(PUBLIC_PREFIX);
  if (idx === -1) return;

  const [bucket, ...pathParts] = url.slice(idx + PUBLIC_PREFIX.length).split("/");
  const path = pathParts.join("/");
  if (!bucket || !path) return;

  const admin = createAdminClient();
  await admin.storage.from(bucket).remove([path]);
}
