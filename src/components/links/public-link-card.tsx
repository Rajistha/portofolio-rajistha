"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import type { ShortLink } from "@/types/database";

export function PublicLinkCard({ link }: { link: ShortLink }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `https://s.rajistha.my.id/${link.slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success(`Disalin: ${shortUrl}`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-border/70 bg-surface/80 p-4 backdrop-blur-md transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] duration-300 hover:border-accent/40 hover:bg-surface-2/60 hover:shadow-lg hover:shadow-black/20">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent transition-colors group-hover:text-accent">
            s.rajistha.my.id/{link.slug}
          </span>
          {link.clicks > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-muted">
              <MousePointerClick className="h-2.5 w-2.5 text-accent" />
              {link.clicks}
            </span>
          )}
        </div>
        {link.title && (
          <p className="text-xs font-medium text-foreground truncate">{link.title}</p>
        )}
        {link.description && (
          <p className="text-[11px] text-muted truncate max-w-md">{link.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-mono font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground cursor-pointer"
          title="Salin shortlink"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Tersalin" : "Salin"}</span>
        </button>

        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-border/80 bg-surface text-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer"
          title="Buka tautan"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
