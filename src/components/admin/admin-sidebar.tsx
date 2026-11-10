"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FolderKanban, Cpu, UserRound, LogOut, Menu, X, Link2, Briefcase, MessageSquare, BarChart3, PenLine, Inbox, Activity, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/admin/notification-bell";
import type { UnreadSummary } from "@/lib/admin-data";
import { useDismissableOverlay } from "@/hooks/use-dismissable-overlay";

const navSections = [
  {
    title: "Ringkasan",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: Activity },
      { href: "/admin/messages", label: "Pesan", icon: Inbox },
    ],
  },
  {
    title: "Konten",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/blog", label: "Blog", icon: PenLine },
      { href: "/admin/experiences", label: "Rekam Jejak", icon: Briefcase },
      { href: "/admin/testimonials", label: "Testimoni", icon: MessageSquare },
      { href: "/admin/stats", label: "Statistik", icon: BarChart3 },
      { href: "/admin/tech-stack", label: "Tech Stack", icon: Cpu },
    ],
  },
  {
    title: "Situs",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/links", label: "Short Links", icon: Link2 },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function AdminSidebar({
  userEmail,
  signOut,
  unread,
}: {
  userEmail?: string;
  signOut: () => Promise<void>;
  unread: UnreadSummary;
}) {
  const unreadMessages = unread.count;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useDismissableOverlay(open, () => setOpen(false));

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain scrollbar-none" aria-label="Admin">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted/70">
            {section.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    active ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
                  {item.label}
                  {item.href === "/admin/messages" && unreadMessages > 0 && (
                    <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-background">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="mt-3 shrink-0 border-t border-border pt-3">
      <p className="mb-3 truncate text-xs text-muted">{userEmail}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — pinned to the viewport height (dvh follows mobile
          browser chrome) and independent of the page: only the menu scrolls,
          the header and account block stay in place. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-border bg-background p-5 sm:flex">
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <p className="font-display text-xl">
            Admin<span className="text-accent">.</span>
          </p>
          <div className="flex items-center gap-2">
            <NotificationBell initial={unread} className="h-8 w-8" />
            <ThemeToggle className="h-8 w-8" />
          </div>
        </div>
        {nav}
        {account}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:hidden">
        <p className="font-display text-lg">
          Admin<span className="text-accent">.</span>
        </p>
        <div className="flex items-center gap-2">
          <NotificationBell initial={unread} className="h-8 w-8" />
          <ThemeToggle className="h-8 w-8" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
              className="fixed inset-0 top-14.25 z-30 bg-foreground/40 sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-0 top-14.25 z-40 flex max-h-[calc(100dvh-3.5625rem)] flex-col border-b border-border bg-background shadow-xl sm:hidden"
            >
              <div className="flex min-h-0 flex-1 flex-col p-4">
                {nav}
                {account}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
