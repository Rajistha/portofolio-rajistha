"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ActionResult } from "@/lib/actions/projects";

export function DeleteButton({
  action,
  confirmMessage = "Apakah Anda yakin ingin menghapus proyek ini?",
  successMessage = "Proyek berhasil dihapus.",
  dialogTitle = "Hapus Proyek?",
  confirmLabel = "Hapus Proyek",
  tooltip = "Hapus proyek",
}: {
  action: () => Promise<ActionResult>;
  confirmMessage?: string;
  successMessage?: string;
  dialogTitle?: string;
  confirmLabel?: string;
  tooltip?: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      setDialogOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setDialogOpen(true)}
        className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
        aria-label="Delete"
        title={tooltip}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogTitle}
        description={confirmMessage}
        confirmLabel={confirmLabel}
        isLoading={isPending}
        onConfirm={handleConfirm}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
