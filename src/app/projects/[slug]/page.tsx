import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { ProjectPage } from "@/components/site/project-page";
import { Footer } from "@/components/site/footer";
import { getAllProjectsPublic, getProfilePublic, getProjectBySlug } from "@/lib/data-public";
import { resolveProjectImage } from "@/lib/project-image";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function absoluteUrl(url: string | null) {
  if (!url) return undefined;
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Proyek tidak ditemukan" };

  const image = absoluteUrl(resolveProjectImage(project).url);
  const description = project.summary || undefined;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description,
      url: `/projects/${project.slug}`,
      images: image ? [image] : undefined,
    },
    twitter: { card: "summary_large_image", title: project.title, description, images: image ? [image] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, projects, profile] = await Promise.all([
    getProjectBySlug(slug),
    getAllProjectsPublic(),
    getProfilePublic(),
  ]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.id === project.id);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary || undefined,
    image: absoluteUrl(resolveProjectImage(project).url),
    url: `${SITE_URL}/projects/${project.slug}`,
    author: { "@type": "Person", name: profile?.name ?? "Puja Rajistha", url: SITE_URL },
    keywords: project.tech_stacks?.map((tech) => tech.name).join(", ") || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main" className="flex-1">
        <ProjectPage project={project} previous={previous} next={next} />
      </main>
      <Footer name={profile?.name ?? "Puja Rajistha"} profile={profile} />
    </>
  );
}
