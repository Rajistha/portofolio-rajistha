"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, Check, ExternalLink, Pencil, Trash2, Pin, MousePointerClick, Globe } from "lucide-react";
import { toast } from "sonner";
import { deleteShortLink } from "@/lib/actions/links";
import { LinkFormModal } from "@/components/admin/link-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ShortLink } from "@/types/database";

export function LinksTable({ initialLinks }: { initialLinks: ShortLink[] }) {
  const router = useRouter();
  const [links, setLinks] = useState<ShortLink[]>(initialLinks);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initialLinks);
  if (prevInitial !== initialLinks) {
    setPrevInitial(initialLinks);
    setLinks(initialLinks);
  }

  function handleCopy(slug: string, id: string) {
    const fullUrl = `https://s.rajistha.my.id/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success(`Disalin: ${fullUrl}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    startDeleteTransition(async () => {
      const res = await deleteShortLink(targetId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Shortlink dihapus.");
      setLinks((prev) => prev.filter((l) => l.id !== targetId));
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Short Links
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola tautan pendek bermerek untuk subdomain <span className="text-accent font-mono">s.rajistha.my.id</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/links"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:border-accent/50 hover:text-accent transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            Hub Publik
          </a>
          <button
            type="button"
            onClick={() => {
              setSelectedLink(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah Short Link
          </button>
        </div>
      </div>

      {/* Empty State */}
      {links.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-xs sm:text-sm text-muted font-mono">
            Belum ada shortlink. Klik &quot;Tambah Short Link&quot; untuk membuat tautan pendek pertama Anda.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile, visible on sm+) — strictly table-fixed, zero horizontal scroll */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[34%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="border-b border-border bg-surface-2/60 text-xs font-mono uppercase text-muted">
                <tr>
                  <th className="px-4 py-3.5 font-medium">Shortlink &amp; Judul</th>
                  <th className="px-4 py-3.5 font-medium">URL Tujuan</th>
                  <th className="px-2 py-3.5 font-medium text-center">Klik</th>
                  <th className="px-2 py-3.5 font-medium text-center">Status</th>
                  <th className="px-4 py-3.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {links.map((link) => (
                  <tr key={link.id} className="transition-colors hover:bg-surface-2/40">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-xs sm:text-sm font-bold text-accent truncate">
                            s.rajistha.my.id/{link.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(link.slug, link.id)}
                            className="shrink-0 text-muted hover:text-foreground transition-colors p-1 rounded hover:bg-surface-2"
                            title="Salin shortlink"
                          >
                            {copiedId === link.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {link.title && (
                          <p className="truncate text-xs text-muted font-medium" title={link.title}>
                            {link.title}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs text-muted">
                        <span className="truncate min-w-0 font-mono text-[11px] sm:text-xs" title={link.destination_url}>
                          {link.destination_url}
                        </span>
                        <a
                          href={link.destination_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-muted hover:text-accent transition-colors p-1"
                          title="Buka URL tujuan"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="px-2 py-3.5 text-center align-middle">
                      <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2.5 py-1 text-xs font-mono font-medium text-foreground whitespace-nowrap">
                        <MousePointerClick className="h-3 w-3 text-muted" />
                        {link.clicks || 0}
                      </span>
                    </td>

                    <td className="px-2 py-3.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {link.is_pinned && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent whitespace-nowrap">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </span>
                        )}
                        {link.is_public ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 whitespace-nowrap">
                            Publik
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                            Privat
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right align-middle">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLink(link);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                          title="Edit link"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setDeleteTarget({ id: link.id, title: link.title || link.slug })}
                          className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Hapus link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (visible on < sm, hidden on desktop) — clean card rows without horizontal scrolling */}
          <div className="sm:hidden space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="rounded-2xl border border-border bg-surface p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-sm font-bold text-accent truncate">
                        s.rajistha.my.id/{link.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(link.slug, link.id)}
                        className="shrink-0 text-muted hover:text-foreground transition-colors p-1"
                        title="Salin shortlink"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {link.title && (
                      <p className="text-xs text-foreground font-medium mt-0.5 truncate">
                        {link.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLink(link);
                        setModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                      title="Edit link"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget({ id: link.id, title: link.title || link.slug })}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                      title="Hapus link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted min-w-0 bg-surface-2/60 rounded-xl px-3 py-2">
                  <span className="truncate font-mono text-[11px] min-w-0 flex-1">
                    {link.destination_url}
                  </span>
                  <a
                    href={link.destination_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted hover:text-accent p-0.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                  <span className="inline-flex items-center gap-1 text-muted font-mono text-xs">
                    <MousePointerClick className="h-3 w-3" />
                    <span className="font-semibold text-foreground">{link.clicks || 0}</span> klik
                  </span>
                  <div className="flex items-center gap-1.5">
                    {link.is_pinned && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                    {link.is_public ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Publik
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        Privat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <LinkFormModal
        isOpen={modalOpen}
        link={selectedLink}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Shortlink?"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus shortlink "${deleteTarget.title}"? Pengunjung yang mengakses URL ini tidak akan lagi dialihkan.`
            : ""
        }
        confirmLabel="Hapus Shortlink"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
