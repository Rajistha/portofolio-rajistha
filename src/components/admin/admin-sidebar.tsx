"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FolderKanban, Sparkles, UserRound, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDismissableOverlay } from "@/hooks/use-dismissable-overlay";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tech-stack", label: "Tech Stack", icon: Sparkles },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export function AdminSidebar({
  userEmail,
  signOut,
}: {
  userEmail?: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useDismissableOverlay(open, () => setOpen(false));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t border-border pt-4">
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
      {/* Desktop sidebar — sticky + independently scrollable so it stays in
          view while long admin pages (forms, project lists) scroll past it. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border p-6 sm:flex">
        <div className="mb-8 flex items-center justify-between">
          <p className="font-display text-xl">
            Admin<span className="text-accent">.</span>
          </p>
          <ThemeToggle className="h-8 w-8" />
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
              className="fixed inset-x-0 top-14.25 z-40 max-h-[calc(100vh-3.5625rem)] overflow-y-auto border-b border-border bg-background shadow-xl sm:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
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
