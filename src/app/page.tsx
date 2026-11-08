import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { StatsCounter } from "@/components/site/stats-counter";
import { AboutSection } from "@/components/site/about-section";
import { ExperienceSection } from "@/components/site/experience-section";
import { TechStackSection } from "@/components/site/tech-stack-section";
import { ProjectsSection } from "@/components/site/projects-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { GitHubActivity } from "@/components/site/github-activity";
import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { BackToTop } from "@/components/site/back-to-top";
import { getProfile, getProjects, getTechStacks, getStats, getExperiences, getTestimonials } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Revalidate page cache every 60 seconds (ISR), or instantly via revalidatePath
export const revalidate = 60;

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
  const [profile, techStacks, projects, stats, experiences, testimonials] = await Promise.all([
    getProfile(),
    getTechStacks(),
    getProjects(),
    getStats(),
    getExperiences(),
    getTestimonials(),
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
      <Navbar hasExperience={experiences.length > 0} />
      <main id="main" className="flex-1">
        <Hero profile={profile} />
        <StatsCounter stats={stats} />
        <AboutSection profile={profile} />
        <ExperienceSection experiences={experiences} />
        <TechStackSection techStacks={techStacks} />
        <ProjectsSection projects={projects} />
        <TestimonialsSection testimonials={testimonials} />
        <GitHubActivity username="rajistha" githubUrl={profile?.github_url} />
        <ContactSection profile={profile} />
      </main>
      <Footer name={name} profile={profile} />
      <BackToTop />
    </>
  );
}
