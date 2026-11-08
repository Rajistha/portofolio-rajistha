"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Pin, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { createShortLink, updateShortLink } from "@/lib/actions/links";
import type { ShortLink } from "@/types/database";

export function LinkFormModal({
  link,
  isOpen,
  onClose,
}: {
  link?: ShortLink | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [destinationUrl, setDestinationUrl] = useState(link?.destination_url ?? "");
  const [slug, setSlug] = useState(link?.slug ?? "");
  const [title, setTitle] = useState(link?.title ?? "");
  const [description, setDescription] = useState(link?.description ?? "");
  const [isPinned, setIsPinned] = useState(link?.is_pinned ?? false);
  const [isPublic, setIsPublic] = useState(link?.is_public ?? true);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destinationUrl.trim()) {
      toast.error("URL tujuan wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("destination_url", destinationUrl.trim());
      formData.set("slug", slug.trim());
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      if (isPinned) formData.set("is_pinned", "on");
      if (!isPublic) formData.set("is_public", "off");

      const res = link
        ? await updateShortLink(link.id, formData)
        : await createShortLink(formData, false);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(link ? "Shortlink berhasil diperbarui!" : "Shortlink baru berhasil dibuat!");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            <h3 className="font-display font-bold text-lg text-foreground">
              {link ? "Edit Short Link" : "Buat Short Link Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              URL Tujuan (Destination URL) *
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com/destinasi-asli"
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              Custom Slug / Alias *
            </label>
            <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus-within:border-accent/60">
              <span className="text-muted text-xs font-mono shrink-0 select-none">
                s.rajistha.my.id/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder={link ? link.slug : "cv, wa, promo (kosongkan untuk acak)"}
                className="w-full bg-transparent pl-1 text-sm text-foreground outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              Judul Tautan (Label Display)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Resume 2026 Puja Rajistha"
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat untuk ditampilkan di hub publik"
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent/60"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <Pin className="h-3.5 w-3.5 text-accent" />
              Pin ke Tautan Resmi (Verified)
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <Globe className="h-3.5 w-3.5 text-muted" />
              Tampilkan di Direktori Publik
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : link ? "Simpan Perubahan" : "Buat Shortlink"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
