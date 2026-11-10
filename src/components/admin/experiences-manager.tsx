"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Briefcase, Calendar, MapPin, AlertCircle, CheckCircle2, GraduationCap, Users, Rocket, Layers } from "lucide-react";
import { toast } from "sonner";
import { saveExperience, deleteExperience } from "@/lib/actions/portfolio";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SortableList } from "@/components/admin/sortable-list";
import { reorderItems } from "@/lib/actions/reorder";
import type { Experience } from "@/types/database";

const CATEGORY_MAP: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  education: { label: "Pendidikan", icon: GraduationCap, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  work: { label: "Pekerjaan", icon: Briefcase, color: "text-accent bg-accent/10 border-accent/30" },
  organization: { label: "Organisasi", icon: Users, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  project: { label: "Proyek", icon: Rocket, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
};

const FILTER_TABS = [
  { key: "all", label: "Semua Kategori", icon: Layers },
  { key: "education", label: "Pendidikan", icon: GraduationCap },
  { key: "work", label: "Pekerjaan", icon: Briefcase },
  { key: "organization", label: "Organisasi", icon: Users },
  { key: "project", label: "Proyek", icon: Rocket },
];

export function ExperiencesManager({ initialExperiences }: { initialExperiences: Experience[] }) {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; role: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initialExperiences);
  if (prevInitial !== initialExperiences) {
    setPrevInitial(initialExperiences);
    setExperiences(initialExperiences);
  }

  function persistOrder(next: Experience[]) {
    const previous = prevInitial;
    startTransition(async () => {
      const res = await reorderItems("experiences", next.map((e) => e.id));
      if (res.error) {
        toast.error(res.error);
        setExperiences(previous);
        return;
      }
      toast.success("Urutan rekam jejak disimpan.");
      router.refresh();
    });
  }

  const filtered = activeFilter === "all" ? experiences : experiences.filter((e) => (e.category || "work") === activeFilter);

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    startTransition(async () => {
      const res = await deleteExperience(targetId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Rekam jejak dihapus.");
      setExperiences((prev) => prev.filter((e) => e.id !== targetId));
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function renderCard(exp: Experience) {
            const cat = CATEGORY_MAP[exp.category || "work"] || CATEGORY_MAP.work;
            const CatIcon = cat.icon;
            const achievementsList = exp.achievements
              ? exp.achievements
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
            const skillsList = exp.skills
              ? exp.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

            return (
              <div key={exp.id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4 relative group hover:border-accent/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium ${cat.color}`}>
                        <CatIcon className="h-3 w-3" />
                        {cat.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {exp.period}
                      </span>
                      {exp.is_current && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-mono font-medium text-accent">Posisi Aktif</span>}
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">{exp.role}</h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-medium text-foreground/90">{exp.company}</span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExp(exp);
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
                      onClick={() => setDeleteTarget({ id: exp.id, role: exp.role })}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {exp.description && <p className="text-xs sm:text-sm text-muted leading-relaxed">{exp.description}</p>}

                {achievementsList.length > 0 && (
                  <div className="space-y-1.5 bg-surface-2/40 rounded-xl p-3 text-xs text-muted">
                    <span className="text-[11px] font-mono font-semibold uppercase text-foreground/80 block">Pencapaian:</span>
                    <ul className="space-y-1">
                      {achievementsList.map((ach, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillsList.map((skill) => (
                      <span key={skill} className="rounded-lg border border-border/70 bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Rekam Jejak &amp; Pengalaman</h1>
          <p className="text-xs sm:text-sm text-muted">Kelola riwayat pendidikan, pengalaman kerja, organisasi, dan proyek untuk linimasa karier.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingExp(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Rekam Jejak
        </button>
      </div>

      {/* Note about auto-hide */}
      <div className="rounded-xl border border-border/70 bg-surface-2/40 px-4 py-3 flex items-start gap-2.5 text-xs text-muted">
        <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Info:</strong> Jika belum ada data rekam jejak, seksi linimasa di landing page akan otomatis disembunyikan.
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {FILTER_TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === tab.key ? "bg-accent text-background font-semibold" : "border border-border/70 bg-surface text-muted hover:text-foreground"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Experiences List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted/60 mb-3" />
          <p className="text-sm font-medium text-foreground">{activeFilter === "all" ? "Belum ada riwayat rekam jejak" : `Belum ada data untuk kategori "${CATEGORY_MAP[activeFilter]?.label || activeFilter}"`}</p>
          <p className="text-xs text-muted mt-1">Klik tombol &quot;Tambah Rekam Jejak&quot; untuk memasukkan data pertama Anda.</p>
        </div>
      ) : (
        activeFilter === "all" ? (
          <SortableList
            items={experiences}
            onReorder={setExperiences}
            onCommit={persistOrder}
            className="space-y-4"
            renderItem={renderCard}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(renderCard)}
            <p className="text-center text-[11px] text-muted">
              Pilih kategori &quot;Semua Kategori&quot; untuk mengatur urutan dengan drag-and-drop.
            </p>
          </div>
        )
      )}

      {/* Modal Form */}
      {modalOpen && <ExperienceModal isOpen={modalOpen} experience={editingExp} onClose={() => setModalOpen(false)} />}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Rekam Jejak?"
        description={deleteTarget ? `Apakah Anda yakin ingin menghapus data rekam jejak "${deleteTarget.role}"? Tindakan ini tidak dapat dibatalkan.` : ""}
        confirmLabel="Hapus Data"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function formatMonthYear(ym: string): string {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  const year = parts[0];
  const month = parts[1];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const mIdx = parseInt(month, 10) - 1;
  return `${monthNames[mIdx] || month} ${year}`;
}

function ExperienceModal({ isOpen, experience, onClose }: { isOpen: boolean; experience: Experience | null; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCat, setSelectedCat] = useState<string>(experience?.category || "work");

  // Calendar date states
  const [startMonth, setStartMonth] = useState<string>(() => {
    const match = experience?.period?.match(/(\d{4})/);
    return match ? `${match[1]}-01` : "2024-01";
  });
  const [endMonth, setEndMonth] = useState<string>(() => {
    const matches = experience?.period?.match(/(\d{4})/g);
    if (matches && matches.length > 1) {
      return `${matches[1]}-12`;
    }
    return "2024-12";
  });
  const [isCurrent, setIsCurrent] = useState<boolean>(experience?.is_current ?? true);
  const [useCustomPeriod, setUseCustomPeriod] = useState<boolean>(false);
  const [customPeriod, setCustomPeriod] = useState<string>(experience?.period ?? "");

  const computedPeriod = isCurrent ? `${formatMonthYear(startMonth)} — Sekarang` : `${formatMonthYear(startMonth)} — ${formatMonthYear(endMonth)}`;

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveExperience(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(experience ? "Rekam jejak diperbarui." : "Rekam jejak ditambahkan.");
      router.refresh();
      onClose();
    });
  }

  // Dynamic placeholders based on category
  const rolePlaceholder =
    selectedCat === "education"
      ? "S1 Teknik Informatika / Rekayasa Perangkat Lunak"
      : selectedCat === "organization"
        ? "Ketua Divisi Media & Kreatif"
        : selectedCat === "project"
          ? "Project Lead & UI/UX Developer"
          : "Lead Front-End Developer / Intern";

  const companyPlaceholder =
    selectedCat === "education"
      ? "Universitas Brawijaya / Nama Sekolah"
      : selectedCat === "organization"
        ? "Himpunan Mahasiswa Informatika / GDSC"
        : selectedCat === "project"
          ? "Platform Photobooth MemoriBox"
          : "Nama Perusahaan / Freelance Client";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">{experience ? "Edit Rekam Jejak" : "Tambah Rekam Jejak"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {experience?.id && <input type="hidden" name="id" value={experience.id} />}

          {/* Category Dropdown (Clean, zero emojis) */}
          <div>
            <label className="block font-medium text-foreground mb-1">Kategori Rekam Jejak *</label>
            <select
              name="category"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground font-medium focus:border-accent focus:outline-none"
            >
              <option value="education">Pendidikan (Universitas, Sekolah, Kursus)</option>
              <option value="work">Pekerjaan / Freelance</option>
              <option value="organization">Organisasi / Komunitas</option>
              <option value="project">Proyek Khusus / Event Inisiatif</option>
            </select>
          </div>

          {/* Interactive Calendar Period Selector */}
          <div className="space-y-2.5 rounded-xl border border-border/70 bg-surface-2/40 p-3.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                Periode Waktu *
              </label>
              <button type="button" onClick={() => setUseCustomPeriod(!useCustomPeriod)} className="text-[10px] text-muted hover:text-accent font-mono underline">
                {useCustomPeriod ? "Gunakan Kalender" : "Tulis Manual"}
              </button>
            </div>

            {!useCustomPeriod ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted mb-1">Mulai (Bulan / Tahun) *</label>
                    <input
                      type="month"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted mb-1">Selesai (Bulan / Tahun)</label>
                    <input
                      type="month"
                      value={endMonth}
                      disabled={isCurrent}
                      onChange={(e) => setEndMonth(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:border-accent focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" />
                    <span>{selectedCat === "education" ? "Sedang Menempuh Pendidikan (Saat Ini)" : "Posisi Aktif (Saat Ini)"}</span>
                  </label>

                  <span className="text-[11px] font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">{computedPeriod}</span>
                </div>

                <input type="hidden" name="period" value={computedPeriod} />
                <input type="hidden" name="is_current" value={isCurrent ? "true" : "false"} />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  name="period"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  placeholder="e.g. 2020 — 2024 / Sekarang"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input type="checkbox" name="is_current" value="true" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" />
                  <span>{selectedCat === "education" ? "Sedang Menempuh Pendidikan (Saat Ini)" : "Posisi Aktif (Saat Ini)"}</span>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">{selectedCat === "education" ? "Nama Institusi / Universitas *" : "Perusahaan / Organisasi *"}</label>
              <input
                type="text"
                name="company"
                required
                defaultValue={experience?.company ?? ""}
                placeholder={companyPlaceholder}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Lokasi</label>
              <input
                type="text"
                name="location"
                defaultValue={experience?.location ?? "Malang, Indonesia"}
                placeholder="Malang, Indonesia / Remote"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">{selectedCat === "education" ? "Gelar / Jurusan (ID) *" : "Peran / Posisi (ID) *"}</label>
              <input
                type="text"
                name="role"
                required
                defaultValue={experience?.role ?? ""}
                placeholder={rolePlaceholder}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-muted mb-1">Peran / Gelar (EN)</label>
              <input
                type="text"
                name="role_en"
                defaultValue={experience?.role_en ?? ""}
                placeholder="Bachelor of Computer Science / Software Engineer"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Lokasi</label>
              <input
                type="text"
                name="location"
                defaultValue={experience?.location ?? "Malang, Indonesia"}
                placeholder="Malang, Indonesia / Remote"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="is_current" name="is_current" value="true" defaultChecked={experience?.is_current ?? false} className="h-4 w-4 rounded border-border accent-accent" />
              <label htmlFor="is_current" className="font-medium text-foreground cursor-pointer">
                {selectedCat === "education" ? "Sedang Menempuh Pendidikan" : "Posisi saat ini (Aktif)"}
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">{selectedCat === "education" ? "Deskripsi / Fokus Studi (ID)" : "Deskripsi Ringkas (ID)"}</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={experience?.description ?? ""}
              placeholder="Fokus pada rekayasa perangkat lunak, sistem interaktif..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-muted mb-1">Deskripsi Ringkas (EN)</label>
            <textarea
              name="description_en"
              rows={2}
              defaultValue={experience?.description_en ?? ""}
              placeholder="Focusing on software engineering and interactive systems..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Pencapaian Utama / Nilai / Prestasi <span className="text-muted font-normal">(1 baris per poin)</span>
            </label>
            <textarea
              name="achievements"
              rows={3}
              defaultValue={experience?.achievements ?? ""}
              placeholder={"IPK: 3.85 / 4.00\nPublikasi tugas akhir mengenai web optimasi..."}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Tag Keahlian / Tech Stack / Mata Kuliah <span className="text-muted font-normal">(pisahkan dengan koma)</span>
            </label>
            <input
              type="text"
              name="skills"
              defaultValue={experience?.skills ?? ""}
              placeholder="Next.js, React, Struktur Data, Algoritma"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Urutan Tampilan</label>
            <input type="number" name="sort_order" defaultValue={experience?.sort_order ?? 0} className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 font-medium text-muted hover:text-foreground">
              Batal
            </button>
            <button type="submit" disabled={isPending} className="rounded-xl bg-accent px-4 py-2 font-semibold text-background hover:opacity-90 disabled:opacity-50">
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
