import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { BlogArticle } from "@/components/site/blog-article";
import { Footer } from "@/components/site/footer";
import { getPostBySlug, getProfilePublic, getPublishedPosts } from "@/lib/data-public";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Tulisan tidak ditemukan" };

  const description = post.excerpt || undefined;
  const images = post.cover_url ? [post.cover_url] : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags,
      images,
    },
    twitter: { card: "summary_large_image", title: post.title, description, images },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts, profile] = await Promise.all([getPostBySlug(slug), getPublishedPosts(), getProfilePublic()]);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 2);
  const name = profile?.name ?? "Puja Rajistha";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    keywords: post.tags.join(", ") || undefined,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Person", name, url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main" className="flex-1">
        <BlogArticle post={post} related={related} />
      </main>
      <Footer name={name} profile={profile} hasBlog />
    </>
  );
}
