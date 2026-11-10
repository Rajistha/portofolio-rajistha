"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { fetchUnreadSummary, markAllMessagesRead } from "@/lib/actions/contact";
import { cn } from "@/lib/utils";
import type { UnreadSummary } from "@/lib/admin-data";

const POLL_MS = 30_000;
const PANEL_WIDTH = 340;

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export function NotificationBell({ initial, className }: { initial: UnreadSummary; className?: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState(initial);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(initial.count);

  // Keep in sync with whatever the server layout last rendered.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setSummary(initial);
  }

  useEffect(() => {
    lastCount.current = initial.count;
  }, [initial]);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchUnreadSummary();
      setSummary(next);
      if (next.count !== lastCount.current) {
        // Re-render the layout so the sidebar badge stays in step with the bell.
        lastCount.current = next.count;
        router.refresh();
      }
    } catch {
      // Offline or signed out — try again on the next tick.
    }
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
      setPosition({ top: rect.bottom + 8, left });
      refresh();
    }
    setOpen((value) => !value);
  }

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function markAll() {
    startTransition(async () => {
      const result = await markAllMessagesRead();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      lastCount.current = 0;
      setSummary({ count: 0, latest: [] });
      router.refresh();
    });
  }

  const label = summary.count > 0 ? `Notifikasi, ${summary.count} pesan belum dibaca` : "Notifikasi, tidak ada pesan baru";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent",
          className
        )}
      >
        <Bell className="h-4 w-4" />
        {summary.count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold leading-4.5 text-background">
            {summary.count > 99 ? "99+" : summary.count}
          </span>
        )}
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifikasi pesan"
            style={{ top: position.top, left: position.left, width: Math.min(PANEL_WIDTH, window.innerWidth - 24) }}
            className="fixed z-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/30"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium">
                Pesan baru
                {summary.count > 0 && <span className="ml-2 font-mono text-xs text-muted">{summary.count}</span>}
              </p>
              {summary.count > 0 && (
                <button
                  type="button"
                  onClick={markAll}
                  disabled={pending}
                  className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {summary.latest.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <Inbox className="mb-2 h-6 w-6 text-muted/60" />
                <p className="text-sm text-foreground">Tidak ada pesan baru</p>
                <p className="mt-0.5 text-xs text-muted">Semua pesan sudah dibaca.</p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto scrollbar-none">
                {summary.latest.map((message) => (
                  <li key={message.id} className="border-b border-border/60 last:border-b-0">
                    <Link
                      href="/admin/messages"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium">{message.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted/70">{timeAgo(message.created_at)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                        {message.subject ? `${message.subject} — ` : ""}
                        {message.message}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/admin/messages"
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-3 text-center text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-accent"
            >
              Buka semua pesan
            </Link>
          </div>,
          document.body
        )}
    </>
  );
}
