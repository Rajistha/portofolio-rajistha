import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { AboutSection } from "@/components/site/about-section";
import { TechStackSection } from "@/components/site/tech-stack-section";
import { ProjectsSection } from "@/components/site/projects-section";
import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { BackToTop } from "@/components/site/back-to-top";
import { getProfile, getProjects, getTechStacks } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? "Your Name";
  const title = `${name} — ${profile?.role ?? "Front-End Developer"}`;
  const description =
    profile?.tagline ?? "Front-end developer portfolio — crafting fast, elegant, and accessible web experiences.";

  return {
    title,
    description,
    openGraph: { title, description, images: profile?.avatar_url ? [profile.avatar_url] : undefined },
    twitter: { title, description, images: profile?.avatar_url ? [profile.avatar_url] : undefined },
  };
}

export default async function Home() {
  const [profile, techStacks, projects] = await Promise.all([
    getProfile(),
    getTechStacks(),
    getProjects(),
  ]);

  const name = profile?.name ?? "Your Name";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: profile?.role ?? "Front-End Developer",
    description: profile?.tagline ?? undefined,
    image: profile?.avatar_url ?? undefined,
    email: profile?.email ?? undefined,
    url: SITE_URL,
    sameAs: [profile?.github_url, profile?.linkedin_url, profile?.instagram_url].filter(
      (url): url is string => Boolean(url)
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Navbar />
      <main id="main" className="flex-1">
        <Hero profile={profile} />
        <AboutSection profile={profile} />
        <TechStackSection techStacks={techStacks} />
        <ProjectsSection projects={projects} />
        <ContactSection profile={profile} />
      </main>
      <Footer name={name} profile={profile} />
      <BackToTop />
    </>
  );
}
