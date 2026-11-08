import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PublicShortenerForm } from "@/components/links/public-shortener-form";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Link Shortener — s.rajistha.my.id",
  description: "Pemendek tautan untuk subdomain s.rajistha.my.id.",
};

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-foreground">
      {/* Background cyber grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hero-grid opacity-35 -z-10"
      />

      {/* Header bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Kembali ke Portofolio
          </Link>

          <Link href="/" className="font-display text-lg font-bold">
            Rajistha<span className="text-accent">.</span>
          </Link>

          <Link
            href="/admin/links"
            className="text-xs font-mono text-muted/60 hover:text-accent transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-16 sm:py-24 w-full space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
            <Sparkles className="h-3 w-3" />
            Link Shortener // s.rajistha.my.id
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Shorten &amp; Share.
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-md mx-auto">
            Perpendek URL panjang Anda menjadi tautan ringkas bermerek menggunakan subdomain <span className="font-mono text-accent font-semibold">s.rajistha.my.id</span>.
          </p>
        </div>

        {/* Public Shortener Box */}
        <section aria-label="Shortener Tool" className="w-full">
          <PublicShortenerForm />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center text-xs font-mono text-muted">
        <p>© {new Date().getFullYear()} Puja Rajistha. s.rajistha.my.id branded shortlinks.</p>
      </footer>
    </div>
  );
}
