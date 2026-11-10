"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveSiteSettings } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/database";

const OPTIONS: { key: keyof SiteSettings; title: string; description: string }[] = [
  {
    key: "preloader_enabled",
    title: "Intro / preloader",
    description:
      "Layar pembuka yang tampil sekali per sesi. Pengunjung dengan pengaturan reduced motion otomatis melewatinya.",
  },
  {
    key: "lanyard_enabled",
    title: "Kartu 3D (lanyard) di hero",
    description:
      "Matikan untuk mengganti dengan kartu statis yang lebih ringan. Perangkat berspesifikasi rendah atau mode hemat data otomatis memakai kartu statis.",
  },
];

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const dirty = OPTIONS.some(({ key }) => values[key] !== saved[key]);

  function save() {
    startTransition(async () => {
      const result = await saveSiteSettings(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSaved(values);
      toast.success("Pengaturan disimpan.");
    });
  }

  return (
    <div className="space-y-4">
      {OPTIONS.map(({ key, title, description }) => (
        <div
          key={key}
          className="flex items-start justify-between gap-6 rounded-2xl border border-border bg-surface p-5"
        >
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-muted">{description}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values[key]}
            aria-label={title}
            onClick={() => setValues((prev) => ({ ...prev, [key]: !prev[key] }))}
            className={cn(
              "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
              values[key] ? "border-accent/60 bg-accent/30" : "border-border bg-surface-2"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full transition-transform",
                values[key] ? "translate-x-5 bg-accent" : "translate-x-0 bg-muted"
              )}
            />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Simpan pengaturan
      </button>
    </div>
  );
}
