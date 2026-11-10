"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { savePost } from "@/lib/actions/blog";
import type { BlogPost } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-muted";

export function PostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const result = await savePost(new FormData(e.currentTarget));
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(post ? "Tulisan diperbarui." : "Tulisan dibuat.");
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Judul — Indonesia</label>
          <input name="title" required defaultValue={post?.title} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title — English</label>
          <input name="title_en" defaultValue={post?.title_en ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Slug (opsional)</label>
          <input
            name="slug"
            defaultValue={post?.slug}
            placeholder="dibuat otomatis dari judul"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tag (pisahkan dengan koma)</label>
          <input
            name="tags"
            defaultValue={post?.tags.join(", ")}
            placeholder="nextjs, performa, ui"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Ringkasan — Indonesia</label>
          <textarea name="excerpt" rows={3} defaultValue={post?.excerpt} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Excerpt — English</label>
          <textarea name="excerpt_en" rows={3} defaultValue={post?.excerpt_en ?? ""} className={inputClass} />
        </div>
      </div>

      <ImageUploader
        name="cover_url"
        label="Gambar sampul (opsional)"
        bucket="project-images"
        defaultValue={post?.cover_url}
      />

      <div className="space-y-6">
        <RichTextEditor name="content" label="Isi tulisan — Indonesia" defaultValue={post?.content} />
        <RichTextEditor name="content_en" label="Content — English (opsional)" defaultValue={post?.content_en} isEnglish />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Publikasikan tulisan ini
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {post ? "Simpan perubahan" : "Buat tulisan"}
      </button>
    </form>
  );
}
