"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setPostPublished } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(published);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !current;
    setCurrent(next);
    startTransition(async () => {
      const result = await setPostPublished(id, next);
      if (result.error) {
        setCurrent(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Tulisan dipublikasikan." : "Tulisan dikembalikan ke draf.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={current}
      aria-label={current ? "Sembunyikan tulisan" : "Publikasikan tulisan"}
      disabled={pending}
      onClick={toggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-60",
        current ? "border-accent/60 bg-accent/30" : "border-border bg-surface-2"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4.5 w-4.5 rounded-full transition-transform",
          current ? "translate-x-5.5 bg-accent" : "translate-x-0.5 bg-muted"
        )}
      />
    </button>
  );
}
