"use client";

import { useState, type ChangeEvent } from "react";
import { UploadCloud, Loader2, FileText, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { createSignedUploadUrl } from "@/lib/actions/upload";

function friendlyErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (!message || /Minified React error/i.test(message)) {
    return "Upload gagal. File mungkin terlalu besar atau terjadi kesalahan.";
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const lastDot = file.name.lastIndexOf(".");
    const ext = lastDot !== -1 ? file.name.slice(lastDot).toLowerCase() : "";
    const allowed = [".pdf", ".doc", ".docx"];
    if (!allowed.includes(ext)) {
      setError("Format tidak didukung. Gunakan PDF atau Word (.doc/.docx).");
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimal 20MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Dapatkan signed upload URL dari server (tidak ada file yang lewat Vercel)
      const signed = await createSignedUploadUrl("documents", file.name, "cv");

      if (signed.error || !signed.signedUrl || !signed.publicUrl) {
        throw new Error(signed.error ?? "Gagal membuat upload URL.");
      }

      // 2. Upload langsung dari browser ke Supabase Storage menggunakan XHR
      //    agar bisa melacak progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signed.signedUrl!);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload gagal: HTTP ${xhr.status} — ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Koneksi terputus saat upload."));
        xhr.send(file);
      });

      // 3. Simpan public URL ke state
      setUrl(signed.publicUrl);
      setFileName(file.name);
      setProgress(100);
      toast.success("File CV berhasil diunggah langsung ke Supabase.");
    } catch (err) {
      const message = friendlyErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }

    // Reset input agar file yang sama bisa dipilih lagi
    e.target.value = "";
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
        {/* Input Text URL */}
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
                setProgress(0);
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
          <span>{uploading ? `Mengunggah… ${progress}%` : "Upload file CV"}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status info */}
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
          Format didukung: PDF, Word (.doc, .docx). Upload langsung ke Supabase — tidak ada batas ukuran Vercel.
          Anda juga bisa menempelkan link Google Drive / Dropbox.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
