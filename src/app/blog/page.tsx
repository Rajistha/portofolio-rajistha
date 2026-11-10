import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { BlogList } from "@/components/site/blog-list";
import { Footer } from "@/components/site/footer";
import { getProfilePublic, getPublishedPosts } from "@/lib/data-public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Catatan dan artikel tentang pengembangan web, proses kerja, dan hal-hal yang saya pelajari.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog", url: "/blog", type: "website" },
};

export default async function BlogPage() {
  const [posts, profile] = await Promise.all([getPublishedPosts(), getProfilePublic()]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <BlogList posts={posts} />
      </main>
      <Footer name={profile?.name ?? "Puja Rajistha"} profile={profile} hasBlog />
    </>
  );
}
