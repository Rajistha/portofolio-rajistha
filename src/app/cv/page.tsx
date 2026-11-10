import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CvViewer } from "@/components/site/cv-viewer";
import { getProfilePublic } from "@/lib/data-public";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfilePublic();
  const name = profile?.name ?? "Puja Rajistha";
  return {
    title: `CV — ${name}`,
    robots: { index: false },
    alternates: { canonical: "/cv" },
  };
}

export default async function CvPage() {
  const profile = await getProfilePublic();
  if (!profile?.cv_url) redirect("/");

  return <CvViewer name={profile.name ?? "Rajistha"} src={profile.cv_url} />;
}
