"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { UploadCloud, Loader2, RotateCcw, X, Globe, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/actions/upload";
import { fetchWebsitePreview } from "@/lib/actions/preview";
import { getAutoScreenshotUrl, getGitHubOgUrl } from "@/lib/project-image";

function friendlyErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (!message || /Minified React error/i.test(message)) {
    return "Upload failed. The file may be too large, or something went wrong on the server — please try again.";
  }
  return message;
}

export function ImageUploader({
  name,
  label = "Image",
  bucket,
  defaultValue,
  liveUrl,
  repoUrl,
}: {
  name: string;
  label?: string;
  bucket: "project-images" | "avatars";
  defaultValue?: string | null;
  liveUrl?: string;
  repoUrl?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto screenshot candidate via local proxy /api/screenshot
  const liveScreenshotUrl = getAutoScreenshotUrl(liveUrl);
  const githubOgUrl = getGitHubOgUrl(repoUrl);

  // OpenGraph banner detected directly from the live website HTML
  const [detectedOg, setDetectedOg] = useState<string | null>(null);

  // User toggle for preview mode between Live Screenshot and OG Banner
  const [activeMode, setActiveMode] = useState<"screenshot" | "og">("screenshot");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Auto-detect OG image in background whenever liveUrl changes
  useEffect(() => {
    if (!liveUrl || !liveUrl.trim()) {
      setDetectedOg(null);
      return;
    }

    const trimmed = liveUrl.trim();
    if (!trimmed.includes(".")) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const result = await fetchWebsitePreview(trimmed);
        if (!cancelled && result.ogImage) {
          setDetectedOg(result.ogImage);
        }
      } catch {
        // ignore
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [liveUrl]);

  // Determine current preview candidate
  let autoCandidate: string | null = null;
  if (activeMode === "og" && detectedOg) {
    autoCandidate = detectedOg;
  } else if (liveScreenshotUrl) {
    autoCandidate = liveScreenshotUrl;
  } else if (githubOgUrl) {
    autoCandidate = githubOgUrl;
  }

  const currentPreview = url || autoCandidate;
  const isAutoActive = !url && !!autoCandidate;

  // Reset loading timeout fail-safe whenever preview target changes
  useEffect(() => {
    if (!currentPreview) {
      setImgLoading(false);
      setImgError(false);
      return;
    }
    setImgError(false);
    setImgLoading(true);

    // Hard fail-safe: loader will NEVER stay stuck for more than 2 seconds
    const safety = setTimeout(() => {
      setImgLoading(false);
    }, 2000);

    return () => clearTimeout(safety);
  }, [currentPreview]);

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
      setImgError(false);
      toast.success("Image uploaded.");
    } catch (err) {
      const message = friendlyErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs uppercase tracking-wide text-muted">{label}</label>
        {isAutoActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
            <Camera className="h-3 w-3" /> Auto Preview aktif
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Thumbnail Preview Area */}
        <div className="flex flex-col gap-2">
          <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 shadow-xs flex items-center justify-center">
            {/* Background Loader: sits underneath the image so it never blocks painted pixels */}
            {imgLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-2 text-muted gap-1 z-10">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span className="text-[10px]">Memuat gambar...</span>
              </div>
            )}

            {currentPreview && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPreview}
                alt="Preview"
                key={currentPreview}
                ref={(el) => {
                  if (el && el.complete && el.naturalWidth > 0) {
                    setImgLoading(false);
                  }
                }}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgLoading(false);
                  setImgError(true);
                }}
                className="relative z-10 h-full w-full object-cover object-top transition-opacity duration-300"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center text-muted z-10">
                {imgError ? (
                  <>
                    <Globe className="h-5 w-5 text-amber-500" />
                    <span className="text-[10px] text-zinc-400 leading-tight">
                      Preview belum tersedia. Silakan upload file manual.
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-[10px]">Belum ada gambar</span>
                  </>
                )}
              </div>
            )}

            {isAutoActive && !imgError && (
              <div className="absolute inset-x-0 bottom-0 z-20 bg-background/90 py-1 text-center text-[10px] text-foreground font-mono font-medium backdrop-blur-xs flex items-center justify-center gap-1">
                {activeMode === "og" && detectedOg ? (
                  <>
                    <ImageIcon className="h-3 w-3 text-accent" />
                    Banner OG Website
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 text-accent" />
                    Live Screenshot
                  </>
                )}
              </div>
            )}
          </div>

          {/* Source Switcher: Quick toggle between Live Screenshot and OG Banner */}
          {detectedOg && liveScreenshotUrl && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-surface text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("screenshot");
                  setUrl(""); // switch to live screenshot
                  setImgError(false);
                  toast.info("Mode: Live Screenshot");
                }}
                className={`flex-1 py-1 px-1.5 rounded-md text-center transition-colors flex items-center justify-center gap-1 ${
                  activeMode === "screenshot" && url !== detectedOg
                    ? "bg-accent text-background font-semibold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Camera className="h-3 w-3" />
                Screenshot
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode("og");
                  setUrl(detectedOg); // apply OG banner
                  setImgError(false);
                  toast.success("Mode: Banner OG");
                }}
                className={`flex-1 py-1 px-1.5 rounded-md text-center transition-colors flex items-center justify-center gap-1 ${
                  activeMode === "og" || url === detectedOg
                    ? "bg-accent text-background font-semibold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                Banner OG
              </button>
            </div>
          )}
        </div>

        {/* Input & Action controls */}
        <div className="flex-1 space-y-2.5">
          <div className="relative flex items-center">
            <input
              type="text"
              name={name}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setImgError(false);
              }}
              placeholder={
                autoCandidate
                  ? "Kosongkan untuk auto-preview, atau paste URL / upload"
                  : "https://... or upload a file"
              }
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-8 text-sm outline-none focus:border-accent/50"
            />
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setImgError(false);
                }}
                title="Hapus / gunakan auto-preview"
                className="absolute right-2.5 rounded-md p-1 text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Upload File Button */}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload file gambar"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFile}
              />
            </label>

            {/* Quick button to clear and revert back to auto preview */}
            {autoCandidate && url && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setImgError(false);
                }}
                className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Kembalikan ke Auto Preview
              </button>
            )}

            {isAutoActive && (
              <span className="text-[11px] text-muted">
                {activeMode === "screenshot"
                  ? "Tangkapan layar live diambil otomatis dari Live URL."
                  : "Menggunakan banner OpenGraph resmi dari website."}
              </span>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
