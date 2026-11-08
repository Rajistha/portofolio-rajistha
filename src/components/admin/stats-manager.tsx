"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, BarChart3, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { saveStat, deleteStat } from "@/lib/actions/portfolio";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { PortfolioStat } from "@/types/database";

export function StatsManager({ initialStats }: { initialStats: PortfolioStat[] }) {
  const router = useRouter();
  const [stats, setStats] = useState<PortfolioStat[]>(initialStats);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<PortfolioStat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    startTransition(async () => {
      const res = await deleteStat(targetId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Statistik dihapus.");
      setStats((prev) => prev.filter((s) => s.id !== targetId));
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Statistik Portofolio
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola barisan angka pencapaian key numbers di landing page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStat(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Statistik
        </button>
      </div>

      {/* Note about auto-hide */}
      <div className="rounded-xl border border-border/70 bg-surface-2/40 px-4 py-3 flex items-start gap-2.5 text-xs text-muted">
        <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Info:</strong> Jika belum ada data statistik di bawah ini, seksi statistik akan otomatis <em>disembunyikan</em> dari landing page.
        </p>
      </div>

      {/* Stats List */}
      {stats.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-muted/60 mb-3" />
          <p className="text-sm font-medium text-foreground">Belum ada data statistik</p>
          <p className="text-xs text-muted mt-1">
            Klik tombol "Tambah Statistik" untuk menambahkan angka pencapaian pertama Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-border bg-surface p-5 space-y-3 relative group hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-3xl font-extrabold text-foreground tracking-tight">
                    {stat.value}
                    <span className="text-accent">{stat.suffix}</span>
                  </div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent mt-1">
                    {stat.label}
                  </h3>
                  {stat.label_en && (
                    <span className="text-[10px] font-mono text-muted block">
                      EN: {stat.label_en}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStat(stat);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setDeleteTarget({ id: stat.id, label: stat.label })}
                    className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {stat.description && (
                <p className="text-xs text-muted leading-relaxed line-clamp-2 pt-2 border-t border-border/50">
                  {stat.description}
                </p>
              )}

              <div className="text-[10px] font-mono text-muted/70 flex justify-end">
                Urutan: #{stat.sort_order}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <StatModal
          isOpen={modalOpen}
          stat={editingStat}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Statistik?"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus statistik "${deleteTarget.label}"?`
            : ""
        }
        confirmLabel="Hapus Data"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StatModal({
  isOpen,
  stat,
  onClose,
}: {
  isOpen: boolean;
  stat: PortfolioStat | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveStat(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(stat ? "Statistik diperbarui." : "Statistik ditambahkan.");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          {stat ? "Edit Statistik" : "Tambah Statistik"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {stat?.id && <input type="hidden" name="id" value={stat.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Nilai Angka *</label>
              <input
                type="number"
                step="any"
                name="value"
                required
                defaultValue={stat?.value ?? 15}
                placeholder="15"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Akhiran (Suffix)</label>
              <input
                type="text"
                name="suffix"
                defaultValue={stat?.suffix ?? "+"}
                placeholder="+, %, k+"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Label (ID) *</label>
            <input
              type="text"
              name="label"
              required
              defaultValue={stat?.label ?? ""}
              placeholder="Proyek Selesai"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-muted mb-1">Label (EN)</label>
            <input
              type="text"
              name="label_en"
              defaultValue={stat?.label_en ?? ""}
              placeholder="Projects Delivered"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Deskripsi Singkat (ID)</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={stat?.description ?? ""}
              placeholder="Aplikasi web modern, sistem photobooth..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-muted mb-1">Deskripsi Singkat (EN)</label>
            <textarea
              name="description_en"
              rows={2}
              defaultValue={stat?.description_en ?? ""}
              placeholder="Modern web applications, photobooth..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Urutan Tampilan</label>
            <input
              type="number"
              name="sort_order"
              defaultValue={stat?.sort_order ?? 0}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 font-medium text-muted hover:text-foreground"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-accent px-4 py-2 font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
