"use client";

import { useState, useTransition } from "react";
import { Link2, ArrowRight, Copy, Check, ExternalLink, Loader2, X, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { createShortLink } from "@/lib/actions/links";
import { generateRandomSlug } from "@/lib/links";

export function PublicShortenerForm() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRandomizeSlug() {
    const randomSlug = generateRandomSlug(6);
    setCustomSlug(randomSlug);
    toast.success(`Slug acak dibuat: ${randomSlug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Silakan masukkan URL tujuan.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("destination_url", url.trim());
      if (customSlug.trim()) {
        formData.set("slug", customSlug.trim());
      }

      const res = await createShortLink(formData, true);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.slug) {
        const fullShortUrl = `https://s.rajistha.my.id/${res.slug}`;
        setResult({ shortUrl: fullShortUrl, slug: res.slug });
        toast.success("Shortlink berhasil dibuat!");
      }
    });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success("Tautan disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setUrl("");
    setCustomSlug("");
    setResult(null);
    setCopied(false);
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* Shortener Card */}
      <div className="relative rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination URL Field */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              URL Tujuan
            </label>
            <div className="relative flex items-center rounded-2xl border border-border/80 bg-surface-2/60 transition-all focus-within:border-accent/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-accent/15">
              <Link2 className="absolute left-4 h-4 w-4 text-muted pointer-events-none shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://contoh-link-panjang.com/halaman"
                style={{ outline: "none", border: "none", boxShadow: "none" }}
                className="min-w-0 w-full bg-transparent pl-11 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted/60 outline-none border-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                required
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="absolute right-3 p-1 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Hapus input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Custom Alias Field: Unified single continuous container with zero inner borders */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              Custom Alias <span className="text-muted/60 lowercase font-normal">(opsional)</span>
            </label>

            <div className="flex items-center rounded-2xl border border-border/80 bg-surface-2/60 px-4 py-1.5 transition-all focus-within:border-accent/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-accent/15">
              <span className="font-mono text-xs sm:text-sm text-muted shrink-0 select-none pr-1">
                s.rajistha.my.id/
              </span>
              <input
                type="text"
                value={customSlug}
                maxLength={48}
                onChange={(e) =>
                  setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                }
                placeholder="alias-kustom"
                style={{ outline: "none", border: "none", boxShadow: "none" }}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs sm:text-sm text-foreground font-mono placeholder:text-muted/50 outline-none border-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              <div className="flex items-center gap-1.5 shrink-0 pl-1.5">
                {customSlug && (
                  <button
                    type="button"
                    onClick={() => setCustomSlug("")}
                    className="p-1 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Hapus alias"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRandomizeSlug}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs font-mono text-muted hover:border-accent/50 hover:text-accent transition-colors cursor-pointer"
                  title="Acak slug otomatis"
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Acak</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Full-width, prominent, elegant with ArrowRight */}
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-95 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses Tautan...</span>
              </>
            ) : (
              <>
                <span>Perpendek Tautan</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Result Container */}
        {result && (
          <div className="mt-6 pt-6 border-t border-border/60 animate-in fade-in slide-in-from-top-3 duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Tautan Siap Digunakan
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-mono text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Buat Baru
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-sm sm:text-base font-bold text-foreground break-all select-all">
                  {result.shortUrl}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background transition-transform hover:opacity-95 active:scale-95 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin"}</span>
                </button>

                <a
                  href={`/${result.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-border bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent cursor-pointer"
                  title="Kunjungi link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
