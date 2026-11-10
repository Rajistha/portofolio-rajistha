import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data-public";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export const metadata: Metadata = { title: "Pengaturan" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Pengaturan</h1>
      <p className="mb-8 text-sm text-muted">Atur animasi dan elemen berat pada halaman publik.</p>
      <SettingsForm initial={settings} />
    </div>
  );
}
