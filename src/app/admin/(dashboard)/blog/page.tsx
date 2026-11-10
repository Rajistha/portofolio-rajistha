import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import { getAllPosts } from "@/lib/admin-data";
import { deletePost } from "@/lib/actions/blog";
import { DeleteButton } from "@/components/admin/delete-button";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPostDate } from "@/lib/blog";

export const revalidate = 0;

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  const published = posts.filter((post) => post.published).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Blog</h1>
          <p className="text-muted">
            {posts.length} tulisan · {published} dipublikasikan
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Tulisan baru
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada tulisan"
          description="Buat tulisan pertama. Jika tabel blog_posts belum ada, jalankan supabase/add-blog-inbox-analytics.sql di Supabase."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{post.title}</p>
                  {!post.published && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">Draf</span>
                  )}
                </div>
                <p className="truncate text-sm text-muted">{post.excerpt || "Tanpa ringkasan"}</p>
                <p className="mt-1 font-mono text-[11px] text-muted/70">
                  /blog/{post.slug}
                  {post.published_at && ` · ${formatPostDate(post.published_at, "id")}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <PublishToggle id={post.id} published={post.published} />
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    aria-label="Lihat tulisan"
                    className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  aria-label="Edit tulisan"
                  className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton
                  action={deletePost.bind(null, post.id)}
                  confirmMessage={`Hapus tulisan "${post.title}"?`}
                  successMessage="Tulisan dihapus."
                  dialogTitle="Hapus Tulisan?"
                  confirmLabel="Hapus Tulisan"
                  tooltip="Hapus tulisan"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
