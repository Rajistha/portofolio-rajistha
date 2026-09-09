"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#stack", label: t.nav.stack },
    { href: "#work", label: t.nav.work },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg text-foreground">
          Rajistha
          <span className="text-accent">.</span>
        </Link>

        <div className="hidden gap-8 text-sm text-muted sm:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle className="h-8 w-8" />
          <ThemeToggle className="h-8 w-8" />
          <a
            href="#contact"
            className="hidden rounded-md border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent sm:inline-flex"
          >
            {t.nav.hireMe}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent sm:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60 sm:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md border border-border px-4 py-2.5 text-center text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent"
              >
                {t.nav.hireMe}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
