"use client";

import { useState, type ChangeEvent } from "react";
import { UploadCloud, Loader2, FileText, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCvFile } from "@/lib/actions/upload";

function friendlyErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (!message || /Minified React error/i.test(message)) {
    return "Upload failed. The file may be too large, or something went wrong on the server.";
  }
  return message;
}

export function CvUploader({
  name = "cv_url",
  label = "Curriculum Vitae (CV)",
  defaultValue,
}: {
  name?: string;
  label?: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const result = await uploadCvFile(formData);

      if (result.error || !result.url) {
        const message = result.error ?? "Upload failed.";
        setError(message);
        toast.error(message);
        return;
      }

      setUrl(result.url);
      setFileName(result.name ?? file.name);
      toast.success("File CV berhasil diunggah.");
    } catch (err) {
      const message = friendlyErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  const isUploadedToSupabase = url.includes("/storage/v1/object/public/documents");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-wide text-muted">{label}</label>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Test Link CV
          </a>
        )}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Input Text URL (supports external links & uploaded URL) */}
        <div className="relative flex-1">
          <input
            type="text"
            name={name}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setFileName(null);
            }}
            placeholder="Paste link (Google Drive, dll) atau klik Upload file"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-8 text-sm outline-none focus:border-accent/50"
          />
          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setFileName(null);
              }}
              title="Hapus CV"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/60 hover:text-accent">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          <span>{uploading ? "Mengunggah…" : "Upload file CV"}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      </div>

      {/* Info status preview */}
      {url ? (
        <div className="flex items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-1.5 text-xs text-muted">
          <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="truncate">
            {fileName
              ? `File: ${fileName}`
              : isUploadedToSupabase
              ? "File tersimpan di Supabase Storage"
              : `Link aktif: ${url}`}
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-muted">
          Format file didukung: PDF, Word (.doc, .docx). Anda juga bisa langsung menempelkan link Google Drive / Dropbox jika tidak ingin mengunggah file.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
