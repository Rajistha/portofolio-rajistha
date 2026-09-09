"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/actions/projects";

export function DeleteButton({
  action,
  confirmMessage = "Are you sure you want to delete this?",
  successMessage = "Deleted.",
}: {
  action: () => Promise<ActionResult>;
  confirmMessage?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
