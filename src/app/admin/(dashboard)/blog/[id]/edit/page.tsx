import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getPostById } from "@/lib/admin-data";

export const revalidate = 0;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Edit Tulisan</h1>
      <PostForm post={post} />
    </div>
  );
}
