import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getProfilePublic } from "@/lib/data-public";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfilePublic();
  const name = profile?.name ?? "Puja Rajistha";
  return {
    title: `CV — ${name}`,
    robots: { index: false },
    alternates: { canonical: "/cv" },
  };
}

export default async function CvPage() {
  const profile = await getProfilePublic();
  if (!profile?.cv_url) redirect("/");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 text-sm">
        <a href="/" className="font-display text-foreground">
          {profile.name ?? "Rajistha"}
          <span className="text-accent">.</span>
        </a>
        <a
          href="/cv/file?download"
          className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
        >
          <Download className="h-4 w-4" />
          Unduh
        </a>
      </div>
      <iframe src="/cv/file" title="CV" className="min-h-0 w-full flex-1 border-0" />
    </div>
  );
}
