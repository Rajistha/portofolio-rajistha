"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/lib/actions/contact";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { gmailComposeUrl, openGmailCompose } from "@/lib/email";
import type { ContactMessage } from "@/types/database";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesInbox({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [pending, startTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initialMessages);
  if (prevInitial !== initialMessages) {
    setPrevInitial(initialMessages);
    setMessages(initialMessages);
  }

  const unread = messages.filter((m) => !m.is_read).length;

  function updateRead(id: string, isRead: boolean) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m)));
    startTransition(async () => {
      const result = await setMessageRead(id, isRead);
      if (result.error) {
        toast.error(result.error);
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: !isRead } : m)));
        return;
      }
      router.refresh();
    });
  }

  function toggleOpen(message: ContactMessage) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && !message.is_read) updateRead(message.id, true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteMessage(target.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pesan dihapus.");
      setMessages((prev) => prev.filter((m) => m.id !== target.id));
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Pesan Masuk</h1>
        <p className="text-muted">
          {messages.length} pesan · {unread} belum dibaca
        </p>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada pesan"
          description="Pesan dari formulir kontak di website akan muncul di sini. Jika tabel contact_messages belum ada, jalankan supabase/add-blog-inbox-analytics.sql."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "rounded-2xl border bg-surface transition-colors",
                  message.is_read ? "border-border" : "border-accent/40"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(message)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span className="mt-0.5 text-muted">
                    {message.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-accent" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className={cn("truncate text-sm", !message.is_read && "font-semibold")}>
                        {message.name}
                      </span>
                      <span className="truncate text-xs text-muted">{message.email}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {message.subject ? `${message.subject} — ` : ""}
                      {message.message}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted/70">{formatDate(message.created_at)}</span>
                </button>

                {open && (
                  <div className="border-t border-border px-4 pb-4 pt-4">
                    {message.subject && <p className="mb-2 text-sm font-medium">{message.subject}</p>}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{message.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={gmailComposeUrl({
                          to: message.email,
                          subject: `Re: ${message.subject || "Pesan Anda"}`,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          openGmailCompose({
                            to: message.email,
                            subject: `Re: ${message.subject || "Pesan Anda"}`,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium text-background transition-colors hover:bg-accent"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Balas lewat Gmail
                      </a>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => updateRead(message.id, false)}
                        className="rounded-lg border border-border px-3.5 py-2 text-xs text-muted transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        Tandai belum dibaca
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(message)}
                        className="ml-auto rounded-lg border border-border p-2 text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
                        aria-label="Hapus pesan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Pesan?"
        description={deleteTarget ? `Pesan dari ${deleteTarget.name} akan dihapus permanen.` : ""}
        confirmLabel="Hapus Pesan"
        isLoading={pending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
