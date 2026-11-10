"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, MessageSquare, Star, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { saveTestimonial, deleteTestimonial } from "@/lib/actions/portfolio";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Testimonial } from "@/types/database";

export function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTesti, setEditingTesti] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initialTestimonials);
  if (prevInitial !== initialTestimonials) {
    setPrevInitial(initialTestimonials);
    setTestimonials(initialTestimonials);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    startTransition(async () => {
      const res = await deleteTestimonial(targetId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Ulasan dihapus.");
      setTestimonials((prev) => prev.filter((t) => t.id !== targetId));
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
            Testimoni &amp; Ulasan Klien
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola ulasan dan rekomendasi dari klien atau partner untuk ditampilkan di landing page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTesti(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Testimoni
        </button>
      </div>

      {/* Note about auto-hide */}
      <div className="rounded-xl border border-border/70 bg-surface-2/40 px-4 py-3 flex items-start gap-2.5 text-xs text-muted">
        <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Info:</strong> Jika belum ada data testimoni di bawah ini, seksi testimoni di landing page akan otomatis <em>disembunyikan</em>.
        </p>
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted/60 mb-3" />
          <p className="text-sm font-medium text-foreground">Belum ada testimoni klien</p>
          <p className="text-xs text-muted mt-1">
            Klik tombol &quot;Tambah Testimoni&quot; untuk memasukkan ulasan pertama dari partner bisnis atau klien Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testi) => (
            <div
              key={testi.id}
              className="rounded-2xl border border-border bg-surface p-5 space-y-3 relative group hover:border-accent/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: testi.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTesti(testi);
                        setModalOpen(true);
                      }}
                      className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteTarget({ id: testi.id, name: testi.name })}
                      className="rounded-lg p-1 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground/85 italic leading-relaxed line-clamp-4">
                  &ldquo;{testi.content}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 space-y-1">
                <h4 className="font-display text-sm font-bold text-foreground truncate">
                  {testi.name}
                </h4>
                <p className="text-[11px] text-muted truncate">
                  {testi.role}
                </p>
                {testi.company && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded-md mt-1">
                    <Building2 className="h-2.5 w-2.5 text-accent" />
                    {testi.company}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <TestimonialModal
          isOpen={modalOpen}
          testimonial={editingTesti}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Testimoni?"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus ulasan dari "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Hapus Ulasan"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function TestimonialModal({
  isOpen,
  testimonial,
  onClose,
}: {
  isOpen: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveTestimonial(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(testimonial ? "Testimoni diperbarui." : "Testimoni ditambahkan.");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          {testimonial ? "Edit Testimoni" : "Tambah Testimoni"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {testimonial?.id && <input type="hidden" name="id" value={testimonial.id} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Nama Klien / Partner *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={testimonial?.name ?? ""}
                placeholder="Dimas Prasetyo"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Perusahaan / Brand *</label>
              <input
                type="text"
                name="company"
                required
                defaultValue={testimonial?.company ?? ""}
                placeholder="Malang Festive Moments"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Jabatan / Peran (ID) *</label>
              <input
                type="text"
                name="role"
                required
                defaultValue={testimonial?.role ?? ""}
                placeholder="Event Organizer & Creative Lead"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-muted mb-1">Jabatan / Peran (EN)</label>
              <input
                type="text"
                name="role_en"
                defaultValue={testimonial?.role_en ?? ""}
                placeholder="Event Organizer & Creative Lead"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Rating Bintang (1 - 5)</label>
              <select
                name="rating"
                defaultValue={testimonial?.rating ?? 5}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              >
                <option value="5">5 Bintang (Sangat Puas)</option>
                <option value="4">4 Bintang (Puas)</option>
                <option value="3">3 Bintang (Cukup)</option>
                <option value="2">2 Bintang (Kurang)</option>
                <option value="1">1 Bintang (Tidak Puas)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Proyek Terkait</label>
              <input
                type="text"
                name="project_ref"
                defaultValue={testimonial?.project_ref ?? ""}
                placeholder="MemoriBox.id Photobooth"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Isi Testimoni (ID) *</label>
            <textarea
              name="content"
              required
              rows={3}
              defaultValue={testimonial?.content ?? ""}
              placeholder="Puja sangat cekatan dalam menerjemahkan kebutuhan web kami..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-muted mb-1">Isi Testimoni (EN)</label>
            <textarea
              name="content_en"
              rows={3}
              defaultValue={testimonial?.content_en ?? ""}
              placeholder="Puja was exceptionally fast and accurate..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Urutan Tampilan</label>
            <input
              type="number"
              name="sort_order"
              defaultValue={testimonial?.sort_order ?? 0}
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
