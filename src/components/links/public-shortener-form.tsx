"use client";

import { useState, useTransition } from "react";
import { Link2, Sparkles, Copy, Check, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createShortLink } from "@/lib/actions/links";

export function PublicShortenerForm() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Silakan masukkan URL tujuan.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("destination_url", url);
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

  return (
    <div className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4"
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-muted">
            URL Panjang yang Ingin Diperpendek
          </label>
          <div className="relative flex items-center">
            <Link2 className="absolute left-3.5 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-link-to-shorten..."
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent/60 focus:bg-background"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              Custom Alias (Opsional)
            </label>
            <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm focus-within:border-accent/60">
              <span className="text-muted text-xs font-mono shrink-0 select-none">
                s.rajistha.my.id/
              </span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder="custom-slug"
                className="w-full bg-transparent pl-1 text-sm text-foreground outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50 h-[42px] cursor-pointer shadow-md shadow-accent/20"
            >
              <Sparkles className="h-4 w-4" />
              {isPending ? "Memproses..." : "Perpendek"}
            </button>
          </div>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-mono uppercase text-accent font-semibold tracking-wider">
              Tautan Pendek Anda Siap:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-foreground truncate">
                {result.shortUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3.5 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-background cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Tersalin!" : "Salin Link"}
            </button>
            <a
              href={`/${result.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
