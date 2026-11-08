import type { Metadata } from "next";
import { getExperiences } from "@/lib/data";
import { ExperiencesManager } from "@/components/admin/experiences-manager";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Rekam Jejak",
};

export default async function AdminExperiencesPage() {
  const experiences = await getExperiences();

  return <ExperiencesManager initialExperiences={experiences} />;
}
