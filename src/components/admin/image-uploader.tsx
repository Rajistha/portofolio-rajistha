"use client";

import { useState, type ChangeEvent } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/actions/upload";

export function ImageUploader({
  name,
  label = "Image",
  bucket,
  defaultValue,
}: {
  name: string;
  label?: string;
  bucket: "project-images" | "avatars";
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const result = await uploadImage(bucket, formData);

      if (result.error || !result.url) {
        const message = result.error ?? "Upload failed.";
        setError(message);
        toast.error(message);
        return;
      }

      setUrl(result.url);
      toast.success("Image uploaded.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed unexpectedly.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">{label}</label>

      <div className="flex items-center gap-3">
        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <UploadCloud className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... or upload a file"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-accent">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
