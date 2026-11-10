"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { useDismissableOverlay } from "@/hooks/use-dismissable-overlay";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; section?: string; show?: boolean };

export function Navbar({
  hasExperience = true,
  hasBlog = false,
}: {
  hasExperience?: boolean;
  hasBlog?: boolean;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Section anchors only exist on the home page; elsewhere they link back to it.
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  useDismissableOverlay(open, () => setOpen(false));

  const links = (
    [
      { href: anchor("about"), label: t.nav.about, section: "about" },
      { href: anchor("experience"), label: t.nav.experience, section: "experience", show: hasExperience },
      { href: anchor("stack"), label: t.nav.stack, section: "stack" },
      { href: anchor("work"), label: t.nav.work, section: "work" },
      { href: "/blog", label: t.nav.blog, show: hasBlog },
      { href: anchor("contact"), label: t.nav.contact, section: "contact" },
    ] satisfies NavLink[]
  ).filter((l) => l.show !== false);

  // Scroll-spy: highlight the section currently crossing the upper third of
  // the viewport.
  useEffect(() => {
    if (!isHome) return;
    const ids = ["about", "experience", "stack", "work", "contact"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    elements.forEach((el) => observer.observe(el));

    // Clear the highlight while the hero is on screen.
    const onScroll = () => {
      if (window.scrollY < 200) setActiveSection(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  // The mobile menu locks page scroll while open. Jumping to an anchor in that
  // state is silently ignored, so close the menu first, let the lock release,
  // and only then scroll to the section.
  function goToSection(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (!href.startsWith("#")) return; // other pages: normal navigation

    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    window.setTimeout(() => {
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    }, 60);
  }

  function isActive(link: NavLink) {
    if (link.section) return isHome && activeSection === link.section;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

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

        <div className="hidden gap-8 text-sm sm:flex">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "relative py-1 transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle className="h-10 w-10 sm:h-8 sm:w-8" />
          <ThemeToggle className="h-10 w-10 sm:h-8 sm:w-8" />
          <a
            href={anchor("contact")}
            className="hidden rounded-md border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent sm:inline-flex"
          >
            {t.nav.hireMe}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent sm:hidden"
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
                  onClick={(e) => goToSection(e, link.href)}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm transition-colors hover:bg-surface hover:text-foreground",
                    isActive(link) ? "bg-surface text-foreground" : "text-muted"
                  )}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={anchor("contact")}
                onClick={(e) => goToSection(e, anchor("contact"))}
                className="mt-2 rounded-md border border-border px-4 py-3 text-center text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent"
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
