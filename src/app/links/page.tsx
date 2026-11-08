import type { Metadata } from "next";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { PublicShortenerForm } from "@/components/links/public-shortener-form";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Link Shortener — s.rajistha.my.id",
  description: "Pemendek tautan resmi untuk subdomain s.rajistha.my.id.",
};

export default function LinksPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-foreground overflow-x-hidden">
      {/* Background ambient lighting & cyber grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hero-grid opacity-30 -z-20"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-accent/8 blur-[130px] rounded-full -z-10"
      />

      {/* Header bar: Clean & Minimalist centered brand */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-6 py-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            Rajistha<span className="text-accent">.</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 sm:py-20 w-full space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1 text-xs font-mono text-accent">
            <Link2 className="h-3.5 w-3.5 text-accent" />
            <span>s.rajistha.my.id</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Shorten &amp; Share
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
            Perpendek URL panjang menjadi tautan ringkas bermerek menggunakan subdomain resmi{" "}
            <span className="font-mono text-accent font-semibold">s.rajistha.my.id</span>.
          </p>
        </div>

        {/* Public Shortener Box */}
        <section aria-label="Shortener Tool" className="w-full">
          <PublicShortenerForm />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs font-mono text-muted/70">
        <p>© {new Date().getFullYear()} Puja Rajistha. Branded shortlinks by s.rajistha.my.id</p>
      </footer>
    </div>
  );
}
